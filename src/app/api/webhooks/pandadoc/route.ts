/**
 * PandaDoc Webhook
 *
 * PandaDoc calls this endpoint when a document event occurs.
 * We match contracts by looking for PANDADOC:<documentId> in the Notes field.
 *
 * PandaDoc setup:
 *   Settings → Integrations → Webhooks → Add endpoint
 *   URL:      <your-domain>/api/webhooks/pandadoc
 *   Triggers: document.completed
 *
 * Env vars:
 *   PANDADOC_WEBHOOK_SECRET — shared secret from PandaDoc webhook config
 */

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

function verifyPandaDocSignature(body: string, signatureHeader: string | null): boolean {
  const secret = process.env.PANDADOC_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return !secret;

  const computed = crypto
    .createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signatureHeader));
}

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-pandadoc-signature");

  if (!verifyPandaDocSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let events: Array<Record<string, unknown>>;
  try {
    // PandaDoc sends an array of events
    const parsed = JSON.parse(rawBody);
    events = Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const results: Array<{ documentId: string; matched: boolean; contractId?: string }> = [];

  for (const event of events) {
    const type = event.event as string;
    if (type !== "document_state_changed" && !type?.includes("completed")) {
      continue;
    }

    const data = event.data as Record<string, unknown> | undefined;
    const documentId = data?.id as string | undefined;
    const status = data?.status as string | undefined;

    // Only process completed/signed documents
    if (!documentId || status !== "document.completed") {
      // PandaDoc status strings: "document.completed", "document.viewed", etc.
      if (status && !status.includes("completed")) continue;
    }

    if (!documentId) continue;

    const contract = await prisma.contract.findFirst({
      where: {
        OR: [
          { notes: { contains: `PANDADOC:${documentId}` } },
          { notes: { contains: documentId } },
        ],
      },
    });

    if (!contract) {
      console.warn(`[pandadoc webhook] No contract found for documentId: ${documentId}`);
      results.push({ documentId, matched: false });
      continue;
    }

    await prisma.contract.update({
      where: { id: contract.id },
      data: {
        status:   "SIGNED",
        signedAt: new Date(),
      },
    });

    console.log(`[pandadoc webhook] Contract ${contract.id} marked SIGNED (doc: ${documentId})`);
    results.push({ documentId, matched: true, contractId: contract.id });
  }

  return NextResponse.json({ received: true, results });
}
