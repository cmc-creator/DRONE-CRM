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

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
  });

  const headers = [
    "Company Name",
    "Contact Name",
    "Email",
    "Phone",
    "Website",
    "Type",
    "Status",
    "Address",
    "City",
    "State",
    "Zip",
    "Billing Email",
    "Source",
    "Total Jobs",
    "Total Invoices",
    "Notes",
    "Created At",
    "ID",
  ];

  const lines = [
    headers.join(","),
    ...clients.map((c) =>
      row([
        c.companyName,
        c.contactName,
        c.email,
        c.phone,
        c.website,
        c.type,
        c.status,
        c.address,
        c.city,
        c.state,
        c.zip,
        c.billingEmail,
        c.source,
        c._count.jobs,
        c._count.invoices,
        c.notes,
        new Date(c.createdAt).toISOString().split("T")[0],
        c.id,
      ])
    ),
  ];

  const csv = lines.join("\r\n");
  const filename = `lumin-clients-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
