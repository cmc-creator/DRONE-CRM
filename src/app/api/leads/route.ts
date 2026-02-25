import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { activities: { take: 1, orderBy: { createdAt: "desc" } } },
  });
  return NextResponse.json(leads);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { companyName, contactName, email, phone, status, source, value, notes, nextFollowUp } = body;

  if (!companyName || !contactName)
    return NextResponse.json({ error: "Company name and contact name are required" }, { status: 400 });

  const lead = await prisma.lead.create({
    data: {
      companyName,
      contactName,
      email,
      phone,
      status: status ?? "NEW",
      source: source ?? "OTHER",
      value: value ? parseFloat(value) : null,
      notes,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null,
      assignedTo: session.user.id as string,
    },
  });
  return NextResponse.json(lead, { status: 201 });
}
