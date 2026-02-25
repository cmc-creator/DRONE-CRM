import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InvoiceStatus } from "@prisma/client";

// ─── CSV helpers ────────────────────────────────────────────────────────────

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(cur.trim()); cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

function parseCsv(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, "").trim());
  return lines.slice(1).filter(Boolean).map((line) => {
    const vals = parseCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

// ─── Wix invoice column aliases → our field names ───────────────────────────
// Wix exports headers like "Invoice Number", "Customer Name", etc.
// We also accept our own export format so re-imports work.

function resolveField(row: Record<string, string>, ...aliases: string[]): string {
  for (const alias of aliases) {
    if (row[alias] !== undefined && row[alias] !== "") return row[alias];
  }
  return "";
}

// ─── Template download ───────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = [
    "Invoice Number,Customer Name,Customer Email,Issue Date,Due Date,Item Description,Amount,Tax,Status,Notes",
    "WIX-0001,Acme Corp,billing@acme.com,2025-01-15,2025-02-15,Aerial Photography Package,2500.00,0,PAID,Initial shoot",
  ].join("\r\n");

  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="invoice-import-template.csv"',
    },
  });
}

// ─── Batch import ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let text: string;
  const contentType = req.headers.get("content-type") ?? "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    text = await file.text();
  } else {
    text = await req.text();
  }

  const rows = parseCsv(text);
  if (rows.length === 0) {
    return NextResponse.json({ error: "CSV is empty or malformed" }, { status: 400 });
  }

  // Pre-load all clients indexed by email and company name for lookup
  type ClientRow = { id: string; companyName: string; email: string | null; billingEmail: string | null };
  const allClients: ClientRow[] = await prisma.client.findMany({
    select: { id: true, companyName: true, email: true, billingEmail: true },
  });
  const clientByEmail = new Map<string, string>(
    allClients.flatMap((c: ClientRow) => {
      const entries: [string, string][] = [];
      if (c.email)        entries.push([c.email.toLowerCase(),        c.id]);
      if (c.billingEmail) entries.push([c.billingEmail.toLowerCase(), c.id]);
      return entries;
    })
  );
  const clientByCompany = new Map<string, string>(
    allClients.map((c: ClientRow) => [c.companyName.toLowerCase(), c.id])
  );

  const results: {
    row: number;
    invoiceNumber: string;
    status: "created" | "skipped";
    reason?: string;
  }[] = [];

  // For auto-generating invoice numbers
  let existingCount = await prisma.invoice.count();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];

    // Accept both Wix and our own export format
    const invoiceNumber = resolveField(r, "Invoice Number", "invoice_number", "Invoice #");
    const clientEmail   = resolveField(r, "Customer Email", "Client Email", "client_email").toLowerCase();
    const clientName    = resolveField(r, "Customer Name",  "Client Company", "company_name");
    const amountStr     = resolveField(r, "Amount", "Total Amount", "total_amount", "amount");
    const taxStr        = resolveField(r, "Tax", "tax");
    const dueDateStr    = resolveField(r, "Due Date", "due_date", "dueDate");
    const statusRaw     = resolveField(r, "Status", "status").toUpperCase();
    const notes         = resolveField(r, "Notes", "notes", "Item Description", "description");

    const amount = parseFloat(amountStr.replace(/[$,]/g, "")) || 0;
    const tax    = parseFloat(taxStr.replace(/[$,]/g, ""))    || 0;
    const total  = amount + tax;
    const dueDate = dueDateStr ? new Date(dueDateStr) : undefined;

    // Map external status strings to our enum
    const statusMap: Record<string, InvoiceStatus> = {
      PAID: "PAID", UNPAID: "SENT", SENT: "SENT", DRAFT: "DRAFT",
      OVERDUE: "OVERDUE", VOID: "VOID", REFUNDED: "REFUNDED",
    };
    const invoiceStatus: InvoiceStatus = statusMap[statusRaw] ?? "DRAFT";

    // Find matching client
    let clientId = clientByEmail.get(clientEmail) ?? clientByCompany.get(clientName.toLowerCase()) ?? null;

    // If no match, create a stub client
    if (!clientId && (clientName || clientEmail)) {
      const newClient = await prisma.client.create({
        data: {
          companyName: clientName || clientEmail,
          email:       clientEmail || null,
          status:      "ACTIVE",
        },
      });
      clientId = newClient.id;
      clientByEmail.set(clientEmail, clientId);
      clientByCompany.set(clientName.toLowerCase(), clientId);
    }

    if (!clientId) {
      results.push({ row: i + 2, invoiceNumber, status: "skipped", reason: "No client info" });
      continue;
    }

    // Build invoice number
    const year = new Date().getFullYear();
    const finalNumber = invoiceNumber && invoiceNumber !== ""
      ? invoiceNumber
      : `LA-${year}-${String(++existingCount).padStart(4, "0")}`;

    // Skip duplicates by invoice number
    const duplicate = await prisma.invoice.findFirst({ where: { invoiceNumber: finalNumber } });
    if (duplicate) {
      results.push({ row: i + 2, invoiceNumber: finalNumber, status: "skipped", reason: "Invoice number already exists" });
      continue;
    }

    await prisma.invoice.create({
      data: {
        invoiceNumber: finalNumber,
        clientId,
        amount:      total || amount,
        totalAmount: total || amount,
        amountPaid:  invoiceStatus === "PAID" ? (total || amount) : 0,
        tax,
        dueDate,
        status: invoiceStatus,
        notes:  notes || null,
        paidAt: invoiceStatus === "PAID" ? new Date() : null,
      },
    });

    results.push({ row: i + 2, invoiceNumber: finalNumber, status: "created" });
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  return NextResponse.json({ created, skipped, results }, { status: 201 });
}
