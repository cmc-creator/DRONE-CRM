import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const {
    companyName, contactName, email, phone, website,
    type, status, address, city, state, zip, billingEmail, notes, source,
  } = body;

  const updated = await prisma.client.update({
    where: { id },
    data: {
      ...(companyName !== undefined && { companyName }),
      ...(contactName !== undefined && { contactName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(website !== undefined && { website }),
      ...(type !== undefined && { type }),
      ...(status !== undefined && { status }),
      ...(address !== undefined && { address }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zip !== undefined && { zip }),
      ...(billingEmail !== undefined && { billingEmail }),
      ...(notes !== undefined && { notes }),
      ...(source !== undefined && { source }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
