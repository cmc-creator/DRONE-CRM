import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

/**
 * POST /api/stripe/checkout
 * Body: { invoiceId }
 * Creates a Stripe Checkout session and returns { url }
 * The client redirects to the Stripe-hosted page.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  // Admins create checkout links; clients can pay via a direct link (unauthenticated POST with invoiceId)
  // We allow both — just verify the invoice exists.

  const { invoiceId } = await req.json();
  if (!invoiceId) {
    return NextResponse.json({ error: "invoiceId required" }, { status: 400 });
  }

  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY to Vercel env vars." },
      { status: 503 }
    );
  }

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { client: { select: { companyName: true, email: true } } },
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  }

  if (invoice.status === "PAID") {
    return NextResponse.json({ error: "Invoice already paid" }, { status: 400 });
  }

  const appUrl = process.env.NEXTAUTH_URL ?? "https://drone-crm-theta.vercel.app";

  const checkoutSession = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    customer_email: invoice.client?.email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(invoice.totalAmount) * 100), // cents
          product_data: {
            name: `Invoice ${invoice.invoiceNumber}`,
            description: `Lumin Aerial — aerial services for ${invoice.client?.companyName ?? "client"}`,
          },
        },
      },
    ],
    metadata: {
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
    },
    success_url: `${appUrl}/client/invoices?paid=${invoice.invoiceNumber}`,
    cancel_url:  `${appUrl}/client/invoices`,
  });

  // Store the checkout session ID on the invoice for webhook matching
  await prisma.invoice.update({
    where: { id: invoice.id },
    data: { stripeCheckoutSessionId: checkoutSession.id },
  });

  return NextResponse.json({ url: checkoutSession.url });
}
