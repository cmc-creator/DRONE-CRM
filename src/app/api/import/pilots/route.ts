import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

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
  const headers = parseCsvLine(lines[0]).map((h) => h.replace(/^"|"$/g, ""));
  return lines.slice(1).filter(Boolean).map((line) => {
    const vals = parseCsvLine(line);
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

// ─── Returns a download template ────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Return a CSV template the user can fill in
  const template = [
    "Name,Email,TempPassword,Phone,City,State,Zip,BusinessName,FAAPartNumber,FAAExpiry,InsuranceCarrier,InsurancePolicyNum,InsuranceExpiry",
    "Jane Smith,jane@example.com,Welcome123!,555-123-4567,Austin,TX,78701,Jane Smith Aerial,4472185,2026-09-30,State Farm,POL-00123,2026-12-31",
  ].join("\r\n");

  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="pilot-import-template.csv"',
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

  const results: { row: number; email: string; status: "created" | "skipped"; reason?: string }[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const email = r["Email"]?.trim();
    const name  = r["Name"]?.trim();
    const tempPw = r["TempPassword"]?.trim() || "LuminAerial2025!";

    if (!email || !name) {
      results.push({ row: i + 2, email: email ?? "(missing)", status: "skipped", reason: "Name and Email are required" });
      continue;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      results.push({ row: i + 2, email, status: "skipped", reason: "Email already exists" });
      continue;
    }

    const hashedPw = await bcrypt.hash(tempPw, 12);
    const faaExpiry       = r["FAAExpiry"]       ? new Date(r["FAAExpiry"])       : undefined;
    const insuranceExpiry = r["InsuranceExpiry"] ? new Date(r["InsuranceExpiry"]) : undefined;

    await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPw,
        role: "PILOT",
        pilot: {
          create: {
            phone:              r["Phone"]              || null,
            city:               r["City"]               || null,
            state:              r["State"]              || null,
            zip:                r["Zip"]                || null,
            businessName:       r["BusinessName"]       || null,
            faaPartNumber:      r["FAAPartNumber"]      || null,
            faaExpiry:          faaExpiry,
            insuranceCarrier:   r["InsuranceCarrier"]   || null,
            insurancePolicyNum: r["InsurancePolicyNum"] || null,
            insuranceExpiry:    insuranceExpiry,
            status:             "PENDING_REVIEW",
          },
        },
      },
    });

    results.push({ row: i + 2, email, status: "created" });
  }

  const created = results.filter((r) => r.status === "created").length;
  const skipped = results.filter((r) => r.status === "skipped").length;

  return NextResponse.json({ created, skipped, results }, { status: 201 });
}
