import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await req.json();

  const existing = await prisma.pilotPayment.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const nextStatus = body.status ?? existing.status;
  const updateData: Record<string, unknown> = {
    ...(body.amount !== undefined ? { amount: Number(body.amount) } : {}),
    ...(body.method !== undefined ? { method: body.method || null } : {}),
    ...(body.notes !== undefined ? { notes: body.notes || null } : {}),
    ...(body.status !== undefined ? { status: body.status } : {}),
  };

  if (existing.status !== "APPROVED" && nextStatus === "APPROVED") {
    updateData.approvedAt = new Date();
  }
  if (nextStatus !== "APPROVED") {
    updateData.approvedAt = null;
  }

  if (existing.status !== "PAID" && nextStatus === "PAID") {
    updateData.paidAt = new Date();
  }
  if (nextStatus !== "PAID") {
    updateData.paidAt = null;
  }

  const payment = await prisma.pilotPayment.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(payment);
}
