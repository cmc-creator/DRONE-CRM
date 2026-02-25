import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

function r(row: Record<string, string>, ...keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k]?.trim();
    if (v) return v;
  }
  return null;
}

// ─── Template ─────────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = [
    "Company Name,Contact Name,Email,Phone,Website,Type,Status,Address,City,State,Zip,Billing Email,Source,Notes",
    "Skyline Agency,John Doe,john@skyline.com,555-999-0001,skylineagency.com,AGENCY,ACTIVE,123 Main St,Denver,CO,80201,billing@skyline.com,Referral,VIP client",
  ].join("\r\n");

  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="client-import-template.csv"',
    },
  });
}

// ─── Import ───────────────────────────────────────────────────────────────

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

  const validTypes   = new Set(["AGENCY", "COMMERCIAL", "REAL_ESTATE", "OTHER"]);
  const validStatuses = new Set(["LEAD", "ACTIVE", "INACTIVE", "ARCHIVED"]);

  const results: { row: number; company: string; status: "created" | "skipped"; reason?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];

    const companyName = r(row, "Company Name", "company_name", "Company") ;
    if (!companyName) {
      results.push({ row: i + 2, company: "(missing)", status: "skipped", reason: "Company Name is required" });
      continue;
    }

    const email = r(row, "Email", "email");

    // Check for duplicate by email (if provided)
    if (email) {
      const existing = await prisma.client.findFirst({ where: { email } });
      if (existing) {
        results.push({ row: i + 2, company: companyName, status: "skipped", reason: "Email already exists" });
        continue;
      }
    }

    const rawType   = (r(row, "Type",   "type",   "Client Type")   ?? "OTHER").toUpperCase();
    const rawStatus = (r(row, "Status", "status", "Client Status") ?? "ACTIVE").toUpperCase();

    await prisma.client.create({
      data: {
        companyName,
        contactName:  r(row, "Contact Name",  "contactName",  "Contact"),
        email,
        phone:        r(row, "Phone",          "phone"),
        website:      r(row, "Website",        "website"),
        type:         validTypes.has(rawType)     ? (rawType as "AGENCY" | "COMMERCIAL" | "REAL_ESTATE" | "OTHER") : "OTHER",
        status:       validStatuses.has(rawStatus) ? (rawStatus as "LEAD" | "ACTIVE" | "INACTIVE" | "ARCHIVED") : "ACTIVE",
        address:      r(row, "Address",        "address"),
        city:         r(row, "City",           "city"),
        state:        r(row, "State",          "state"),
        zip:          r(row, "Zip",            "zip"),
        billingEmail: r(row, "Billing Email",  "billingEmail", "Billing"),
        source:       r(row, "Source",         "source"),
        notes:        r(row, "Notes",          "notes"),
      },
    });

    results.push({ row: i + 2, company: companyName, status: "created" });
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  return NextResponse.json({ created, skipped, results }, { status: 201 });
}
