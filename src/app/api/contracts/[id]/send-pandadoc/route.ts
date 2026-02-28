/**
 * POST /api/contracts/[id]/send-pandadoc
 *
 * Sends a contract for e-signature via PandaDoc API.
 *
 * Required env vars:
 *   PANDADOC_API_KEY    — PandaDoc API key (Settings → API)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

const PANDADOC_BASE = "https://api.pandadoc.com/public/v1";

export async function POST(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.PANDADOC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "PANDADOC_API_KEY not configured. Set it in Vercel environment variables." },
      { status: 503 }
    );
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

  const body        = await req.json().catch(() => ({}));
  const signerEmail = body.email ?? contract.client?.email ?? contract.pilot?.user?.email;
  const signerName  = body.name  ?? contract.client?.contactName ?? contract.pilot?.user?.name ?? "Signer";

  if (!signerEmail) {
    return NextResponse.json(
      { error: "No signer email found. Pass { email, name } in the request body." },
      { status: 400 }
    );
  }

  // Step 1: Upload document from HTML content
  const uploadRes = await fetch(`${PANDADOC_BASE}/documents`, {
    method: "POST",
    headers: {
      Authorization:  `API-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name:       contract.title,
      url:        null,
      // PandaDoc accepts raw HTML content as a "template" via the `content_placeholders` field
      // We use the raw text approach with a single content block
      content_library_items: [],
      recipients: [
        {
          email: signerEmail,
          first_name: signerName.split(" ")[0] ?? signerName,
          last_name:  signerName.split(" ").slice(1).join(" ") || undefined,
          role:       "signer",
        },
      ],
      // Pass the content as a parsed text section
      pricing_tables: [],
      fields: {},
      metadata: { contractId: contract.id },
      tags: ["nyx-aerial"],
      // document body as a single text section
      schema_version: 1,
      sections: [
        {
          client_id: "section1",
          name:      "Contract",
          items: [
            {
              client_id: "content1",
              type:      "text",
              data: {
                value: contract.content,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    return NextResponse.json({ error: err }, { status: uploadRes.status });
  }

  const doc = await uploadRes.json();
  const documentId: string = doc.uuid ?? doc.id;

  // Step 2: Send the document for signature
  const sendRes = await fetch(`${PANDADOC_BASE}/documents/${documentId}/send`, {
    method: "POST",
    headers: {
      Authorization:  `API-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: `Please review and sign: ${contract.title}`,
      silent:  false,
    }),
  });

  if (!sendRes.ok) {
    const err = await sendRes.json();
    return NextResponse.json({ error: err }, { status: sendRes.status });
  }

  // Update contract: mark as SENT, store document ID in notes
  await prisma.contract.update({
    where: { id },
    data: {
      status: "SENT",
      sentAt: new Date(),
      notes: `${contract.notes ? contract.notes + "\n" : ""}PANDADOC:${documentId}`,
    },
  });

  return NextResponse.json({ success: true, documentId, signerEmail });
}
