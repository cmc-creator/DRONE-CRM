import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { id: true, companyName: true } },
      pilot: { select: { id: true, user: { select: { name: true } } } },
    },
  });
  return NextResponse.json(contracts);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { title, type, clientId, pilotId, content, notes } = body;
  if (!title || !content) {
    return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
  }
  const contract = await prisma.contract.create({
    data: {
      title,
      type: type ?? "OTHER",
      clientId: clientId || null,
      pilotId: pilotId || null,
      content,
      notes,
      status: "DRAFT",
    },
    include: {
      client: { select: { companyName: true } },
      pilot: { select: { user: { select: { name: true } } } },
    },
  });
  return NextResponse.json(contract, { status: 201 });
}
