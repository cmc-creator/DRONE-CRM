import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const contract = await prisma.contract.findUnique({
    where: { id },
    include: { job: { include: { client: true, pilot: true } } },
  });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(contract);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, status, signedDate, expiresAt, content } = body;
  const contract = await prisma.contract.update({
    where: { id },
    data: {
      title,
      status,
      signedDate: signedDate ? new Date(signedDate) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      content,
    },
    include: { job: { include: { client: true, pilot: true } } },
  });
  return NextResponse.json(contract);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.contract.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
