import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  // Allow any logged-in user to read contracts they're party to
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const contract = await prisma.contract.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, companyName: true, contactName: true, email: true } },
      pilot: { select: { id: true, user: { select: { name: true, email: true } } } },
    },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const { title, type, status, content, notes, clientId, pilotId } = body;

  const data = {
    ...(title !== undefined && { title }),
    ...(type !== undefined && { type }),
    ...(status !== undefined && { status }),
    ...(content !== undefined && { content }),
    ...(notes !== undefined && { notes }),
    ...(clientId !== undefined && { clientId: clientId || null }),
    ...(pilotId !== undefined && { pilotId: pilotId || null }),
    ...(status === "SENT" && { sentAt: new Date() }),
  };

  const updated = await prisma.contract.update({ where: { id }, data });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
