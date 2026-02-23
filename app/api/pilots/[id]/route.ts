import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pilot = await prisma.pilot.findUnique({ where: { id } });
  if (!pilot) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pilot);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const pilot = await prisma.pilot.update({ where: { id }, data: body });
  return NextResponse.json(pilot);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.pilot.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
