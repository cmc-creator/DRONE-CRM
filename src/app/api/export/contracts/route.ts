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

  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true, email: true } },
      pilot:  { select: { user: { select: { name: true, email: true } } } },
    },
  });

  const headers = [
    "Title",
    "Type",
    "Status",
    "Party Name",
    "Party Email",
    "Signed By Name",
    "Signed By Email",
    "Signed At",
    "Sent At",
    "Created At",
    "Notes",
    "ID",
  ];

  const lines = [
    headers.join(","),
    ...contracts.map((c) => {
      const partyName  = c.client?.companyName ?? c.pilot?.user.name ?? "";
      const partyEmail = c.client?.email ?? c.pilot?.user.email ?? "";
      return row([
        c.title,
        c.type,
        c.status,
        partyName,
        partyEmail,
        c.signedByName,
        c.signedByEmail,
        c.signedAt  ? new Date(c.signedAt).toISOString().split("T")[0]  : "",
        c.sentAt    ? new Date(c.sentAt).toISOString().split("T")[0]    : "",
        new Date(c.createdAt).toISOString().split("T")[0],
        c.notes,
        c.id,
      ]);
    }),
  ];

  const csv = lines.join("\r\n");
  const filename = `lumin-contracts-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
