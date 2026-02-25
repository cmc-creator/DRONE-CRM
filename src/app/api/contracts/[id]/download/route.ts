import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contract = await prisma.contract.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { companyName: true } },
      pilot:  { select: { user: { select: { name: true } } } },
    },
  });

  if (!contract) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const party = contract.client?.companyName ?? contract.pilot?.user.name ?? "Unknown";
  const signedBlock = contract.signedAt
    ? `<div style="margin-top:48px;padding-top:16px;border-top:1px solid #ccc;font-size:13px;color:#555;">
        <strong>Signed by:</strong> ${contract.signedByName ?? ""} &lt;${contract.signedByEmail ?? ""}&gt;<br/>
        <strong>Date:</strong> ${new Date(contract.signedAt).toLocaleDateString()}
       </div>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${contract.title}</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 48px auto; padding: 0 24px; color: #1a1a1a; line-height: 1.7; }
    h1   { font-size: 22px; margin-bottom: 4px; }
    .meta{ font-size: 13px; color: #666; margin-bottom: 32px; }
    .content { white-space: pre-wrap; }
  </style>
</head>
<body>
  <h1>${contract.title}</h1>
  <div class="meta">
    Type: ${contract.type} &nbsp;|&nbsp; Status: ${contract.status} &nbsp;|&nbsp; Party: ${party}
  </div>
  <div class="content">${contract.content}</div>
  ${signedBlock}
</body>
</html>`;

  const slug = contract.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const filename = `contract-${slug}-${contract.id.slice(-6)}.html`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
