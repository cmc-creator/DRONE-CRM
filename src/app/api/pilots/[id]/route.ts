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
  const pilot = await prisma.pilot.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      markets: true,
      equipment: true,
    },
  });
  if (!pilot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pilot);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const {
    name, phone, city, state, zip, bio, businessName,
    faaPartNumber, faaExpiry, faaDocUrl,
    insuranceCarrier, insurancePolicyNum, insuranceExpiry, insuranceDocUrl,
    w9OnFile, w9DocUrl, status, rating, notes,
  } = body;

  // Update user name if provided
  const pilot = await prisma.pilot.findUnique({ where: { id }, select: { userId: true } });
  if (!pilot) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (name !== undefined) {
    await prisma.user.update({ where: { id: pilot.userId }, data: { name } });
  }

  const updated = await prisma.pilot.update({
    where: { id },
    data: {
      ...(phone !== undefined && { phone }),
      ...(city !== undefined && { city }),
      ...(state !== undefined && { state }),
      ...(zip !== undefined && { zip }),
      ...(bio !== undefined && { bio }),
      ...(businessName !== undefined && { businessName }),
      ...(faaPartNumber !== undefined && { faaPartNumber }),
      ...(faaExpiry !== undefined && { faaExpiry: faaExpiry ? new Date(faaExpiry) : null }),
      ...(faaDocUrl !== undefined && { faaDocUrl }),
      ...(insuranceCarrier !== undefined && { insuranceCarrier }),
      ...(insurancePolicyNum !== undefined && { insurancePolicyNum }),
      ...(insuranceExpiry !== undefined && { insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null }),
      ...(insuranceDocUrl !== undefined && { insuranceDocUrl }),
      ...(w9OnFile !== undefined && { w9OnFile }),
      ...(w9DocUrl !== undefined && { w9DocUrl }),
      ...(status !== undefined && { status }),
      ...(rating !== undefined && { rating: rating ? Number(rating) : null }),
      ...(notes !== undefined && { notes }),
    },
    include: { user: { select: { name: true, email: true } } },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const pilot = await prisma.pilot.findUnique({ where: { id }, select: { userId: true } });
  if (!pilot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.user.delete({ where: { id: pilot.userId } }); // cascades to pilot
  return NextResponse.json({ success: true });
}
