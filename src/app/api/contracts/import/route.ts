import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ── Simple RFC-4180-compliant CSV row parser ──────────────────────────────────
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  for (const line of lines) {
    if (!line.trim()) continue;
    const fields: string[] = [];
    let i = 0;
    while (i < line.length) {
      if (line[i] === '"') {
        // Quoted field
        let field = "";
        i++; // skip opening quote
        while (i < line.length) {
          if (line[i] === '"' && line[i + 1] === '"') { field += '"'; i += 2; }
          else if (line[i] === '"') { i++; break; }
          else { field += line[i++]; }
        }
        if (line[i] === ",") i++;
        fields.push(field);
      } else {
        const end = line.indexOf(",", i);
        if (end === -1) { fields.push(line.slice(i).trim()); i = line.length; }
        else { fields.push(line.slice(i, end).trim()); i = end + 1; }
      }
    }
    rows.push(fields);
  }
  return rows;
}

const VALID_TYPES   = ["PILOT_AGREEMENT","CLIENT_SERVICE","NDA","SUBCONTRACTOR","OTHER"];
const VALID_STATUSES = ["DRAFT","SENT","SIGNED","VOID"];

// GET — return CSV template
export async function GET() {
  const header = "title,clientCompanyName,type,status,notes,signedByName,signedByEmail,signedAt,content";
  const example1 = `"Service Agreement - Creative Pulse Media","Creative Pulse Media","CLIENT_SERVICE","SIGNED","Original signed May 2024","Alex Rivera","alex@creativepulse.com","2024-05-10","Agreement imported from prior system."`;
  const example2 = `"NDA - Q4 2024","","NDA","DRAFT","","","","",""`;
  const csv = [header, example1, example2].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="contracts-import-template.csv"',
    },
  });
}

// POST — import contracts from CSV
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);
  if (rows.length < 2) return NextResponse.json({ error: "CSV appears to be empty" }, { status: 400 });

  // Normalize headers
  const headers = rows[0].map((h) => h.toLowerCase().replace(/\s+/g, "").replace(/[^a-z]/g, ""));
  const idx = (name: string) => headers.indexOf(name);

  const results: { row: number; status: "created" | "skipped"; reason?: string; title?: string }[] = [];
  let created = 0;
  let skipped = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const get = (col: string) => (row[idx(col)] ?? "").trim();

    const title = get("title");
    if (!title) { skipped++; results.push({ row: r + 1, status: "skipped", reason: "Missing title", title: "(empty)" }); continue; }

    // Normalise enums
    const rawType   = get("type").toUpperCase().replace(/\s+/g,"_");
    const rawStatus = get("status").toUpperCase();
    const type   = VALID_TYPES.includes(rawType)    ? rawType    : "OTHER";
    const status = VALID_STATUSES.includes(rawStatus) ? rawStatus : "DRAFT";

    // Look up or create client
    let clientId: string | null = null;
    const companyName = get("clientcompanyname") || get("companyname") || get("client");
    if (companyName) {
      let client = await prisma.client.findFirst({
        where: { companyName: { equals: companyName, mode: "insensitive" } }
      });
      if (!client) {
        // Create a stub client — admin can fill in details later
        const stubUser = await prisma.user.create({
          data: { name: companyName, email: `stub-${Date.now()}-${r}@import.local`, role: "CLIENT" }
        });
        client = await prisma.client.create({
          data: { companyName, userId: stubUser.id }
        });
      }
      clientId = client.id;
    }

    // Parse signedAt
    let signedAt: Date | null = null;
    const rawDate = get("signedat");
    if (rawDate) {
      const d = new Date(rawDate);
      if (!isNaN(d.getTime())) signedAt = d;
    }

    const content = get("content") ||
      `Imported from external system on ${new Date().toLocaleDateString()}.\n\n` +
      `Original document should be referenced separately.\n` +
      (companyName ? `Client: ${companyName}\n` : "");

    try {
      await prisma.contract.create({
        data: {
          title,
          type:         type as "PILOT_AGREEMENT" | "CLIENT_SERVICE" | "NDA" | "SUBCONTRACTOR" | "OTHER",
          status:       status as "DRAFT" | "SENT" | "SIGNED" | "VOID",
          clientId,
          notes:        get("notes") || null,
          signedByName: get("signedbyname") || null,
          signedByEmail: get("signedbyemail") || null,
          signedAt,
          content,
        },
      });
      created++;
      results.push({ row: r + 1, status: "created", title });
    } catch (e) {
      skipped++;
      results.push({ row: r + 1, status: "skipped", reason: String(e), title });
    }
  }

  return NextResponse.json({ created, skipped, results });
}
