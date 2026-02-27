import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendOverdueInvoiceEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/invoice-check
 * Runs daily at 08:00 UTC (see vercel.json).
 * 1. Marks SENT invoices past their due date as OVERDUE.
 * 2. Sends overdue reminder emails to clients.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Find SENT invoices that are past their due date
  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      status: "SENT",
      dueDate: { lt: now },
    },
    include: {
      client: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  if (overdueInvoices.length === 0) {
    return NextResponse.json({ markedOverdue: 0, emailsSent: [] });
  }

  // Bulk-update status to OVERDUE
  await prisma.invoice.updateMany({
    where: {
      id: { in: overdueInvoices.map((inv) => inv.id) },
    },
    data: { status: "OVERDUE" },
  });

  // Send reminder emails
  const emailsSent: string[] = [];
  for (const inv of overdueInvoices) {
    const email = inv.client.user?.email;
    const name = inv.client.user?.name ?? inv.client.companyName;
    if (email) {
      await sendOverdueInvoiceEmail({
        clientEmail: email,
        clientName: name,
        invoiceNumber: inv.invoiceNumber,
        totalAmount: inv.totalAmount.toNumber(),
        dueDate: inv.dueDate ?? undefined,
        invoiceId: inv.id,
      });
      emailsSent.push(email);
    }
  }

  return NextResponse.json({
    markedOverdue: overdueInvoices.length,
    emailsSent,
  });
}
