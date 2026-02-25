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

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true, contactName: true, email: true } },
      job:    { select: { title: true } },
    },
  });

  const headers = [
    "Invoice Number",
    "Client Company",
    "Client Contact",
    "Client Email",
    "Job Title",
    "Status",
    "Total Amount",
    "Amount Paid",
    "Tax",
    "Due Date",
    "Paid At",
    "Notes",
    "Created At",
    "ID",
  ];

  const lines = [
    headers.join(","),
    ...invoices.map((inv) =>
      row([
        inv.invoiceNumber,
        inv.client?.companyName,
        inv.client?.contactName,
        inv.client?.email,
        inv.job?.title,
        inv.status,
        inv.totalAmount,
        inv.amountPaid,
        inv.tax,
        inv.dueDate ? new Date(inv.dueDate).toISOString().split("T")[0] : "",
        inv.paidAt ? new Date(inv.paidAt).toISOString().split("T")[0] : "",
        inv.notes,
        new Date(inv.createdAt).toISOString().split("T")[0],
        inv.id,
      ])
    ),
  ];

  const csv = lines.join("\r\n");
  const filename = `lumin-invoices-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
