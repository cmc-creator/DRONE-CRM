import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { activities: { orderBy: { createdAt: "desc" } } },
  });
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { companyName, contactName, email, phone, status, source, value, notes, nextFollowUp } = body;

  const lead = await prisma.lead.update({
    where: { id },
    data: {
      ...(companyName && { companyName }),
      ...(contactName && { contactName }),
      ...(email !== undefined && { email }),
      ...(phone !== undefined && { phone }),
      ...(status && { status }),
      ...(source && { source }),
      ...(value !== undefined && { value: value ? parseFloat(value) : null }),
      ...(notes !== undefined && { notes }),
      ...(nextFollowUp !== undefined && { nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null }),
    },
  });
  return NextResponse.json(lead);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await prisma.lead.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
