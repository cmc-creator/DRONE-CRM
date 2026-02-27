/**
 * DocuSign Connect Webhook
 *
 * DocuSign calls this endpoint when an envelope event occurs.
 * We match contracts by looking for DOCUSIGN:<envelopeId> in the Notes field.
 *
 * DocuSign Admin setup:
 *   Admin → Integrations → Connect → New Configuration → Custom
 *   URL:    <your-domain>/api/webhooks/docusign
 *   Events: Envelope Completed
 *   Include: Envelope Data, Document Fields
 *
 * Env vars:
 *   DOCUSIGN_HMAC_SECRET — HMAC secret from DocuSign Connect config
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

/** Verify DocuSign HMAC-SHA256 signature */
function verifyDocuSignSignature(body: string, signatureHeader: string | null): boolean {
  const secret = process.env.DOCUSIGN_HMAC_SECRET;
  if (!secret || !signatureHeader) return !secret; // skip if no secret configured

  const computed = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("base64");

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-docusign-signature-1");

  if (!verifyDocuSignSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = payload.event as string;
  // Only process "envelope-completed" events
  if (event !== "envelope-completed" && event !== "envelope-signing-complete") {
    return NextResponse.json({ received: true, ignored: true });
  }

  const envelopeData = payload.data as Record<string, unknown> | undefined;
  const envelopeId = (envelopeData?.envelopeSummary as Record<string, unknown>)?.envelopeId as string | undefined;

  if (!envelopeId) {
    return NextResponse.json({ error: "No envelopeId in payload" }, { status: 400 });
  }

  // Find matching contract — check Notes field for DOCUSIGN:<envelopeId> tag
  const contract = await prisma.contract.findFirst({
    where: {
      OR: [
        { notes: { contains: `DOCUSIGN:${envelopeId}` } },
        { notes: { contains: envelopeId } },
      ],
    },
  });

  if (!contract) {
    console.warn(`[docusign webhook] No contract found for envelopeId: ${envelopeId}`);
    return NextResponse.json({ received: true, matched: false });
  }

  // Update contract to SIGNED
  await prisma.contract.update({
    where: { id: contract.id },
    data: {
      status:   "SIGNED",
      signedAt: new Date(),
    },
  });

  console.log(`[docusign webhook] Contract ${contract.id} marked SIGNED (envelope: ${envelopeId})`);
  return NextResponse.json({ received: true, matched: true, contractId: contract.id });
}
