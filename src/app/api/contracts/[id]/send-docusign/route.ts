/**
 * POST /api/contracts/[id]/send-docusign
 *
 * Sends a contract for e-signature via DocuSign eSignature API.
 * Creates an envelope and emails the signer a signing link.
 *
 * Required env vars:
 *   DOCUSIGN_ACCOUNT_ID        — DocuSign account UUID
 *   DOCUSIGN_INTEGRATION_KEY   — OAuth 2.0 integration key (client ID)
 *   DOCUSIGN_SECRET_KEY        — OAuth 2.0 secret key
 *   DOCUSIGN_BASE_URL          — e.g. https://demo.docusign.net/restapi (sandbox) or https://na1.docusign.net/restapi
 *   DOCUSIGN_HMAC_SECRET       — for webhook verification (already in use)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

async function getDocuSignToken(): Promise<string | null> {
  const integrationKey = process.env.DOCUSIGN_INTEGRATION_KEY;
  const secretKey      = process.env.DOCUSIGN_SECRET_KEY;
  if (!integrationKey || !secretKey) return null;

  const res = await fetch("https://account-d.docusign.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${integrationKey}:${secretKey}`).toString("base64")}`,
    },
    body: new URLSearchParams({ grant_type: "client_credentials", scope: "signature" }),
  });

  if (!res.ok) return null;
  const { access_token } = await res.json();
  return access_token ?? null;
}

export async function POST(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      client: { select: { contactName: true, email: true } },
      pilot:  { select: { user: { select: { name: true, email: true } } } },
    },
  });

  if (!contract) return NextResponse.json({ error: "Contract not found" }, { status: 404 });

  // Determine signer
  const body    = await req.json().catch(() => ({}));
  const signerEmail = body.email ?? contract.client?.email ?? contract.pilot?.user?.email;
  const signerName  = body.name  ?? contract.client?.contactName ?? contract.pilot?.user?.name ?? "Signer";

  if (!signerEmail) {
    return NextResponse.json({ error: "No signer email found. Pass { email, name } in the request body." }, { status: 400 });
  }

  const accountId = process.env.DOCUSIGN_ACCOUNT_ID;
  const baseUrl   = process.env.DOCUSIGN_BASE_URL ?? "https://demo.docusign.net/restapi";

  if (!accountId) {
    return NextResponse.json(
      { error: "DOCUSIGN_ACCOUNT_ID not configured. Set it in Vercel environment variables." },
      { status: 503 }
    );
  }

  const token = await getDocuSignToken();
  if (!token) {
    return NextResponse.json(
      { error: "Could not obtain DocuSign access token. Check DOCUSIGN_INTEGRATION_KEY and DOCUSIGN_SECRET_KEY." },
      { status: 503 }
    );
  }

  // Build the envelope — document is the contract content as plain text
  const docBase64 = Buffer.from(contract.content).toString("base64");

  const envelope = {
    emailSubject: `Please sign: ${contract.title}`,
    documents: [
      {
        documentId: "1",
        name: `${contract.title}.txt`,
        documentBase64: docBase64,
        fileExtension: "txt",
      },
    ],
    recipients: {
      signers: [
        {
          email:        signerEmail,
          name:         signerName,
          recipientId:  "1",
          routingOrder: "1",
          tabs: {
            signHereTabs: [
              {
                documentId:  "1",
                pageNumber:  "1",
                xPosition:   "100",
                yPosition:   "700",
              },
            ],
            dateSignedTabs: [
              {
                documentId: "1",
                pageNumber:  "1",
                xPosition:  "300",
                yPosition:  "700",
              },
            ],
          },
        },
      ],
    },
    status: "sent",
  };

  const envelopeRes = await fetch(`${baseUrl}/v2.1/accounts/${accountId}/envelopes`, {
    method: "POST",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(envelope),
  });

  if (!envelopeRes.ok) {
    const err = await envelopeRes.json();
    return NextResponse.json({ error: err }, { status: envelopeRes.status });
  }

  const { envelopeId } = await envelopeRes.json();

  // Update contract: mark as SENT, store envelope ID reference in notes
  await prisma.contract.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      notes: `${contract.notes ? contract.notes + "\n" : ""}DOCUSIGN:${envelopeId}`,
    },
  });

  return NextResponse.json({ success: true, envelopeId, signerEmail });
}
