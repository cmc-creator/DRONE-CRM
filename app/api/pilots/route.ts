import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const pilots = await prisma.pilot.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(pilots);
}

export async function POST(request: Request) {
  const body = await request.json();
  const pilot = await prisma.pilot.create({ data: body });
  return NextResponse.json(pilot, { status: 201 });
}
