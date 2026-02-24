import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pilots = await prisma.pilot.findMany({
    include: {
      user: { select: { name: true, email: true } },
      markets: true,
      equipment: true,
      _count: { select: { jobAssignments: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(pilots);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    name,
    email,
    password,
    phone,
    city,
    state,
    zip,
    businessName,
    faaPartNumber,
    faaExpiry,
    insuranceCarrier,
    insurancePolicyNum,
    insuranceExpiry,
    markets,
  } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { error: "Name, email, and password are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: "PILOT",
      pilot: {
        create: {
          phone,
          city,
          state,
          zip,
          businessName,
          faaPartNumber,
          faaExpiry: faaExpiry ? new Date(faaExpiry) : undefined,
          insuranceCarrier,
          insurancePolicyNum,
          insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
          markets: markets
            ? {
                create: markets.map((m: { state: string; city?: string }) => ({
                  state: m.state,
                  city: m.city,
                })),
              }
            : undefined,
        },
      },
    },
    include: {
      pilot: true,
    },
  });

  return NextResponse.json(user, { status: 201 });
}
