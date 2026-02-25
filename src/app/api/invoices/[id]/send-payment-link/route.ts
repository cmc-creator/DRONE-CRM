import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendInvoicePaymentLinkEmail } from "@/lib/email";

/**
 * POST /api/invoices/[id]/send-payment-link
 * Creates a Stripe Checkout session and emails the payment link to the client.
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { client: { select: { companyName: true, email: true } } },
  });

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invoice.status === "PAID") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  // Create Stripe Checkout session
  const checkoutRes = await fetch(
    `${process.env.NEXTAUTH_URL ?? "https://drone-crm-theta.vercel.app"}/api/stripe/checkout`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ invoiceId: id }),
    }
  );

  if (!checkoutRes.ok) {
    const err = await checkoutRes.json();
    return NextResponse.json({ error: err.error ?? "Stripe error" }, { status: 502 });
  }

  const { url: paymentUrl } = await checkoutRes.json();

  if (invoice.client?.email) {
    await sendInvoicePaymentLinkEmail({
      clientEmail: invoice.client.email,
      clientName: invoice.client.companyName,
      invoiceNumber: invoice.invoiceNumber,
      totalAmount: Number(invoice.totalAmount),
      dueDate: invoice.dueDate,
      paymentUrl,
    });
  }

  // Mark invoice as SENT if it was DRAFT
  if (invoice.status === "DRAFT") {
    await prisma.invoice.update({ where: { id }, data: { status: "SENT" } });
  }

  return NextResponse.json({ ok: true, paymentUrl });
}
