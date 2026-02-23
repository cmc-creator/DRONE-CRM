import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contracts = await prisma.contract.findMany({
    include: { job: { include: { client: true, pilot: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contracts);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { jobId, title, status, signedDate, expiresAt, content } = body;
  const contract = await prisma.contract.create({
    data: {
      jobId,
      title,
      status: status || "draft",
      signedDate: signedDate ? new Date(signedDate) : null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      content,
    },
    include: { job: { include: { client: true, pilot: true } } },
  });
  return NextResponse.json(contract, { status: 201 });
}
