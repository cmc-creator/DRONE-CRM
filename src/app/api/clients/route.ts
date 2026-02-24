import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clients = await prisma.client.findMany({
    include: { _count: { select: { jobs: true, invoices: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    companyName,
    contactName,
    email,
    phone,
    website,
    type,
    status,
    address,
    city,
    state,
    zip,
    billingEmail,
    notes,
    source,
    createPortalAccount,
    portalPassword,
  } = body;

  if (!companyName) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }

  let userId: string | undefined;

  if (createPortalAccount && email && portalPassword) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 400 });
    }
    const hashedPassword = await bcrypt.hash(portalPassword, 12);
    const user = await prisma.user.create({
      data: {
        name: contactName ?? companyName,
        email,
        password: hashedPassword,
        role: "CLIENT",
      },
    });
    userId = user.id;
  }

  const client = await prisma.client.create({
    data: {
      companyName,
      contactName,
      email,
      phone,
      website,
      type: type ?? "OTHER",
      status: status ?? "LEAD",
      address,
      city,
      state,
      zip,
      billingEmail,
      notes,
      source,
      userId,
    },
  });

  return NextResponse.json(client, { status: 201 });
}
