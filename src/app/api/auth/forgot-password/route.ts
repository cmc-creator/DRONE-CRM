import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // Always return 200 to prevent email enumeration
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) {
    return NextResponse.json({ ok: true });
  }

  // Invalidate any existing tokens for this email
  await prisma.passwordResetToken.updateMany({
    where: { email: user.email, used: false },
    data: { used: true },
  });

  const token = await prisma.passwordResetToken.create({
    data: {
      email: user.email,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  await sendPasswordResetEmail({
    email: user.email,
    name: user.name ?? undefined,
    token: token.token,
  });

  return NextResponse.json({ ok: true });
}
