import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [payments, unpaidAssignments] = await Promise.all([
    prisma.pilotPayment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        pilot: { include: { user: { select: { name: true, email: true } } } },
        assignment: {
          include: {
            job: { include: { client: { select: { companyName: true } } } },
          },
        },
      },
    }),
    prisma.jobAssignment.findMany({
      where: {
        payment: null,
        job: { status: { in: ["ASSIGNED", "IN_PROGRESS", "CAPTURE_COMPLETE", "DELIVERED", "COMPLETED"] } },
      },
      orderBy: { assignedAt: "desc" },
      include: {
        pilot: { include: { user: { select: { name: true, email: true } } } },
        job: { include: { client: { select: { companyName: true } } } },
      },
      take: 100,
    }),
  ]);

  return NextResponse.json({ payments, unpaidAssignments });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { assignmentId, amount, method, notes } = body;

  if (!assignmentId) {
    return NextResponse.json({ error: "assignmentId is required" }, { status: 400 });
  }

  const assignment = await prisma.jobAssignment.findUnique({
    where: { id: assignmentId },
    include: { job: true, payment: true, pilot: true },
  });

  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found" }, { status: 404 });
  }

  if (assignment.payment) {
    return NextResponse.json({ error: "Payment already exists for this assignment" }, { status: 400 });
  }

  const resolvedAmount = Number(amount ?? assignment.job.pilotPayout ?? 0);
  if (!resolvedAmount || Number.isNaN(resolvedAmount) || resolvedAmount <= 0) {
    return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
  }

  const payment = await prisma.pilotPayment.create({
    data: {
      assignmentId,
      pilotId: assignment.pilotId,
      amount: resolvedAmount,
      method: method ?? null,
      notes: notes ?? null,
      status: "PENDING",
    },
  });

  return NextResponse.json(payment, { status: 201 });
}
