import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      job: { select: { title: true } },
    },
  });

  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    clientId,
    jobId,
    amount,
    tax,
    dueDate,
    notes,
    lineItems,
  } = body;

  if (!clientId || amount == null) {
    return NextResponse.json({ error: "Client and amount are required" }, { status: 400 });
  }

  const taxAmount = Number(tax ?? 0);
  const totalAmount = Number(amount) + taxAmount;

  // Generate invoice number: LA-YYYY-NNNN
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count();
  const invoiceNumber = `LA-${year}-${String(count + 1).padStart(4, "0")}`;

  const invoice = await prisma.invoice.create({
    data: {
      clientId,
      jobId: jobId || undefined,
      invoiceNumber,
      status: "DRAFT",
      amount,
      tax: taxAmount,
      totalAmount,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
      lineItems,
    },
    include: {
      client: true,
      job: true,
    },
  });

  return NextResponse.json(invoice, { status: 201 });
}
