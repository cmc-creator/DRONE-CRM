import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const jobs = await prisma.job.findMany({
    include: { client: true, pilot: true, contract: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(jobs);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { clientId, pilotId, title, description, status, jobDate, location, totalAmount, commissionRate, notes } = body;

  const commissionAmount =
    totalAmount && commissionRate
      ? (totalAmount * commissionRate) / 100
      : null;

  const job = await prisma.job.create({
    data: {
      title,
      description,
      clientId,
      pilotId: pilotId || null,
      status: status || "pending",
      jobDate: jobDate ? new Date(jobDate) : null,
      location,
      totalAmount: totalAmount ? parseFloat(totalAmount) : null,
      commissionRate: commissionRate ? parseFloat(commissionRate) : 15,
      commissionAmount,
      notes,
    },
    include: { client: true, pilot: true },
  });
  return NextResponse.json(job, { status: 201 });
}
