/**
 * Bulk Job CSV Import
 *
 * GET  /api/import/jobs   — download CSV template
 * POST /api/import/jobs   — import jobs from CSV
 *
 * CSV columns:
 *   ClientEmail, Title, Type, Status, Address, City, State, Zip,
 *   ScheduledDate, Duration, Deliverables, ClientPrice, PilotPayout,
 *   Priority, Description, InternalNotes
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── CSV helpers ─────────────────────────────────────────────────────────────

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

// ─── Template download ────────────────────────────────────────────────────────

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const template = [
    "ClientEmail,Title,Type,Status,Address,City,State,Zip,ScheduledDate,Duration,Deliverables,ClientPrice,PilotPayout,Priority,Description,InternalNotes",
    "client@example.com,Downtown Real Estate Shoot,REAL_ESTATE,PENDING_ASSIGNMENT,123 Main St,Austin,TX,78701,2026-04-15,90,Photos + Video,750,350,2,Aerial photos for 4-bedroom listing,Request rush delivery",
  ].join("\r\n");

  return new NextResponse(template, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="job-import-template.csv"',
    },
  });
}

// ─── Batch import ─────────────────────────────────────────────────────────────

const VALID_TYPES   = ["REAL_ESTATE","CONSTRUCTION","MARKETING","INSPECTION","MAPPING","EVENT","OTHER"];
const VALID_STATUSES = ["DRAFT","PENDING_ASSIGNMENT","ASSIGNED","IN_PROGRESS","CAPTURE_COMPLETE","DELIVERED","COMPLETED","CANCELLED"];

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
    return NextResponse.json({ error: "No data rows found in CSV" }, { status: 400 });
  }

  const results = { created: 0, skipped: 0, errors: [] as string[] };

  for (let i = 0; i < rows.length; i++) {
    const row    = rows[i];
    const rowNum = i + 2; // 1-indexed + header row

    const title   = row["Title"]?.trim();
    const city    = row["City"]?.trim();
    const state   = row["State"]?.trim();

    if (!title || !city || !state) {
      results.errors.push(`Row ${rowNum}: Title, City, and State are required`);
      results.skipped++;
      continue;
    }

    // Look up client by email
    let clientId: string | undefined;
    const clientEmail = row["ClientEmail"]?.trim().toLowerCase();
    if (clientEmail) {
      const client = await prisma.client.findFirst({
        where: { email: { equals: clientEmail, mode: "insensitive" } },
        select: { id: true },
      });
      if (!client) {
        results.errors.push(`Row ${rowNum}: Client with email "${clientEmail}" not found — skipped`);
        results.skipped++;
        continue;
      }
      clientId = client.id;
    } else {
      results.errors.push(`Row ${rowNum}: ClientEmail is required`);
      results.skipped++;
      continue;
    }

    const type   = VALID_TYPES.includes(row["Type"] ?? "")    ? row["Type"]   as string : "OTHER";
    const status = VALID_STATUSES.includes(row["Status"] ?? "") ? row["Status"] as string : "PENDING_ASSIGNMENT";

    try {
      await prisma.job.create({
        data: {
          clientId,
          title,
          type:         type as never,
          status:       status as never,
          address:      row["Address"]     || null,
          city,
          state,
          zip:          row["Zip"]         || null,
          scheduledDate: row["ScheduledDate"] ? new Date(row["ScheduledDate"]) : null,
          duration:     row["Duration"]    ? Number(row["Duration"])   : null,
          deliverables: row["Deliverables"] || null,
          clientPrice:  row["ClientPrice"] ? Number(row["ClientPrice"]) : null,
          pilotPayout:  row["PilotPayout"] ? Number(row["PilotPayout"]) : null,
          priority:     row["Priority"]    ? Number(row["Priority"])   : 2,
          description:  row["Description"] || null,
          internalNotes: row["InternalNotes"] || null,
        },
      });
      results.created++;
    } catch (err) {
      results.errors.push(`Row ${rowNum}: ${err instanceof Error ? err.message : "Unknown error"}`);
      results.skipped++;
    }
  }

  return NextResponse.json(results, { status: results.created > 0 ? 201 : 400 });
}
