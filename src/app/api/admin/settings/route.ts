import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const {
    name, slug, logoUrl, faviconUrl, primaryColor,
    accentColor, customDomain, supportEmail, stripeAccountId,
  } = data;

  // Upsert — only one org record for the platform (single-tenant mode)
  const existing = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });

  const org = existing
    ? await prisma.organization.update({
        where: { id: existing.id },
        data: { name, slug, logoUrl: logoUrl || null, faviconUrl: faviconUrl || null,
          primaryColor, accentColor, customDomain: customDomain || null,
          supportEmail: supportEmail || null, stripeAccountId: stripeAccountId || null },
      })
    : await prisma.organization.create({
        data: { name, slug, logoUrl: logoUrl || null, faviconUrl: faviconUrl || null,
          primaryColor, accentColor, customDomain: customDomain || null,
          supportEmail: supportEmail || null, stripeAccountId: stripeAccountId || null },
      });

  return NextResponse.json(org);
}
