import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(clients);
}

export async function POST(request: Request) {
  const body = await request.json();
  const client = await prisma.client.create({ data: body });
  return NextResponse.json(client, { status: 201 });
}
