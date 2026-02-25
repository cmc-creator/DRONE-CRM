import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function esc(v: unknown): string {
  const s = v == null ? "" : String(v);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(cols: unknown[]): string {
  return cols.map(esc).join(",");
}

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pilots = await prisma.pilot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user:    { select: { name: true, email: true } },
      markets: true,
      equipment: { select: { make: true, model: true, serialNumber: true } },
      _count:  { select: { jobAssignments: true } },
    },
  });

  const headers = [
    "Name",
    "Email",
    "Phone",
    "City",
    "State",
    "Zip",
    "Business Name",
    "Status",
    "FAA Part Number",
    "FAA Expiry",
    "Insurance Carrier",
    "Insurance Policy #",
    "Insurance Expiry",
    "W-9 On File",
    "Rating",
    "Markets (state:city)",
    "Equipment",
    "Total Jobs",
    "Notes",
    "Created At",
    "ID",
  ];

  const lines = [
    headers.join(","),
    ...pilots.map((p) => {
      const markets = p.markets
        .map((m) => `${m.state}${m.city ? ":" + m.city : ""}`)
        .join("|");
      const equipment = p.equipment
        .map((e) => `${e.make} ${e.model}`)
        .join("|");
      return row([
        p.user.name,
        p.user.email,
        p.phone,
        p.city,
        p.state,
        p.zip,
        p.businessName,
        p.status,
        p.faaPartNumber,
        p.faaExpiry ? new Date(p.faaExpiry).toISOString().split("T")[0] : "",
        p.insuranceCarrier,
        p.insurancePolicyNum,
        p.insuranceExpiry ? new Date(p.insuranceExpiry).toISOString().split("T")[0] : "",
        p.w9OnFile ? "Yes" : "No",
        p.rating,
        markets,
        equipment,
        p._count.jobAssignments,
        p.notes,
        new Date(p.createdAt).toISOString().split("T")[0],
        p.id,
      ]);
    }),
  ];

  const csv = lines.join("\r\n");
  const filename = `lumin-pilots-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
