import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

/**
 * POST /api/webhooks/stripe
 * Handles: checkout.session.completed
 * Marks the matching invoice as PAID and records payment details.
 */
export async function POST(req: NextRequest) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const rawBody = await req.text();

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[Stripe webhook] Signature verification failed:", message);
    return NextResponse.json({ error: `Webhook error: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoiceId;

    if (!invoiceId) {
      console.warn("[Stripe webhook] No invoiceId in metadata");
      return NextResponse.json({ received: true });
    }

    const amountPaidDollars = session.amount_total ? session.amount_total / 100 : 0;

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        amountPaid: amountPaidDollars,
        paidAt: new Date(),
        stripePaymentIntentId: typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      },
    });

    console.log(`[Stripe webhook] Invoice ${invoiceId} marked PAID — $${amountPaidDollars}`);
  }

  return NextResponse.json({ received: true });
}
