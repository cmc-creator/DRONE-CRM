import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// PATCH /api/quotes/[id] — update status or convert to lead
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { status, clientId } = body;

  const updated = await prisma.quoteRequest.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
      ...(clientId !== undefined ? { clientId } : {}),
    },
  });

  return NextResponse.json(updated);
}
