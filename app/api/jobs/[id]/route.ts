import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await prisma.job.findUnique({
    where: { id },
    include: { client: true, pilot: true, contract: true },
  });
  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(job);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { clientId, pilotId, title, description, status, jobDate, location, totalAmount, commissionRate, notes } = body;

  const commissionAmount =
    totalAmount && commissionRate
      ? (parseFloat(totalAmount) * parseFloat(commissionRate)) / 100
      : null;

  const job = await prisma.job.update({
    where: { id },
    data: {
      title,
      description,
      clientId,
      pilotId: pilotId || null,
      status,
      jobDate: jobDate ? new Date(jobDate) : null,
      location,
      totalAmount: totalAmount ? parseFloat(totalAmount) : null,
      commissionRate: commissionRate ? parseFloat(commissionRate) : 15,
      commissionAmount,
      notes,
    },
    include: { client: true, pilot: true },
  });
  return NextResponse.json(job);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
