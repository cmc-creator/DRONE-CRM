import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/export/quickbooks
 * Exports paid invoices as a QuickBooks IIF (Intuit Interchange Format) file.
 * Import into QuickBooks Desktop via File > Utilities > Import > IIF Files.
 */
export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    where: { status: "PAID" },
    include: {
      client: { select: { companyName: true } },
      job: { select: { title: true } },
    },
    orderBy: { paidAt: "desc" },
  });

  // IIF Header — define the transaction type
  const lines: string[] = [
    "!TRNS\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO\tDOCNUM",
    "!SPL\tTRNSTYPE\tDATE\tACCNT\tNAME\tAMOUNT\tMEMO",
    "!ENDTRNS",
  ];

  for (const inv of invoices) {
    const date = (inv.paidAt ?? inv.createdAt).toLocaleDateString("en-US", {
      month: "2-digit", day: "2-digit", year: "numeric",
    });
    const amount = Number(inv.totalAmount).toFixed(2);
    const client = (inv.client?.companyName ?? "Unknown").replace(/\t/g, " ");
    const memo = (inv.job?.title ?? inv.invoiceNumber).replace(/\t/g, " ");

    // Debit — Accounts Receivable
    lines.push(`TRNS\tINVOICE\t${date}\tAccounts Receivable\t${client}\t${amount}\t${memo}\t${inv.invoiceNumber}`);
    // Credit — Income account
    lines.push(`SPL\tINVOICE\t${date}\tAerial Services Income\t${client}\t-${amount}\t${memo}`);
    lines.push("ENDTRNS");
  }

  const iif = lines.join("\n");

  return new NextResponse(iif, {
    headers: {
      "Content-Type": "text/plain",
      "Content-Disposition": `attachment; filename="lumin-invoices-qb-${Date.now()}.iif"`,
    },
  });
}
