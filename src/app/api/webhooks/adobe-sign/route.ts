/**
 * Adobe Acrobat Sign — Webhook Endpoint
 *
 * Setup in Adobe Admin Console:
 *   Webhook URL: https://your-domain.com/api/webhooks/adobe-sign
 *   Events: AGREEMENT_ACTION_COMPLETED, AGREEMENT_ALL_EVENTS
 *   Scope: Account
 *
 * Required env var: ADOBE_SIGN_WEBHOOK_SECRET  (from Adobe portal)
 *
 * Adobe Sign sends a JSON POST when a document is signed. This handler:
 *   1. Verifies the client-id header matches our secret
 *   2. Finds the matching contract by title or externalId stored in notes
 *   3. Marks the contract SIGNED with signer name, email, IP, and timestamp
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  // Adobe calls this on the first setup to verify the endpoint
  const clientId = req.headers.get("x-adobesign-clientid");
  if (clientId) {
    return NextResponse.json({ xAdobeSignClientId: clientId });
  }

  const secret = process.env.ADOBE_SIGN_WEBHOOK_SECRET;
  if (secret) {
    const incoming = req.headers.get("x-adobesign-clientid") ?? "";
    if (incoming !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = body["event"] as string | undefined;

  // Only process completion events
  if (event !== "AGREEMENT_ACTION_COMPLETED" && event !== "AGREEMENT_SIGNED") {
    return NextResponse.json({ received: true });
  }

  const agreement = body["agreement"] as Record<string, unknown> | undefined;
  if (!agreement) return NextResponse.json({ received: true });

  const agreementName  = agreement["name"]  as string | undefined;
  const agreementId    = agreement["id"]    as string | undefined;

  // Participant (signer) data
  const participants = agreement["participantSet"] as Record<string, unknown>[] | undefined;
  const signer = participants?.[0];
  const signerName  = (signer?.["memberInfos"] as Record<string, unknown>[])?.[0]?.["name"]  as string ?? "";
  const signerEmail = (signer?.["memberInfos"] as Record<string, unknown>[])?.[0]?.["email"] as string ?? "";

  // Try to find contract by externalId (we store Adobe agreement ID in notes as ADOBE:<id>)
  // or fall back to matching by title
  let contract = agreementId
    ? await prisma.contract.findFirst({ where: { notes: { contains: `ADOBE:${agreementId}` } } })
    : null;

  if (!contract && agreementName) {
    contract = await prisma.contract.findFirst({ where: { title: { contains: agreementName } } });
  }

  if (!contract) {
    // Log but acknowledge so Adobe doesn't retry
    console.warn("[adobe-sign webhook] No matching contract found for:", { agreementId, agreementName });
    return NextResponse.json({ received: true });
  }

  if (contract.status === "SIGNED") {
    return NextResponse.json({ received: true, note: "Already signed" });
  }

  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "";

  await prisma.contract.update({
    where: { id: contract.id },
    data: {
      status:        "SIGNED",
      signedAt:      new Date(),
      signedByName:  signerName  || null,
      signedByEmail: signerEmail || null,
      signatureIp:   ip          || null,
    },
  });

  console.log(`[adobe-sign webhook] Contract "${contract.title}" marked SIGNED by ${signerEmail}`);
  return NextResponse.json({ received: true, contractId: contract.id });
}

// Adobe Sign handshake — must return 200 with client-id echo
export async function GET(req: NextRequest) {
  const clientId = req.headers.get("x-adobesign-clientid") ?? req.nextUrl.searchParams.get("x-adobesign-clientid");
  if (clientId) {
    return NextResponse.json({ xAdobeSignClientId: clientId });
  }
  return NextResponse.json({ status: "Adobe Sign webhook endpoint active" });
}
