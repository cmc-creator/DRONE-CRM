import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: Promise<{ id: string }> }

export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { signedByName, signedByEmail } = body;

  if (!signedByName || !signedByEmail) {
    return NextResponse.json({ error: "Name and email are required to sign" }, { status: 400 });
  }

  const contract = await prisma.contract.findUnique({ where: { id } });
  if (!contract) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (contract.status === "SIGNED") {
    return NextResponse.json({ error: "Contract already signed" }, { status: 400 });
  }
  if (contract.status === "VOID") {
    return NextResponse.json({ error: "Contract has been voided" }, { status: 400 });
  }

  // Get real IP from headers
  const forwardedFor = req.headers.get("x-forwarded-for");
  const signatureIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

  const updated = await prisma.contract.update({
    where: { id },
    data: {
      status: "SIGNED",
      signedAt: new Date(),
      signedByName,
      signedByEmail,
      signatureIp,
    },
  });
  return NextResponse.json(updated);
}
