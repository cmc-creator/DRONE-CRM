import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// TEMPORARY — delete this file immediately after use
export async function GET() {
  const hashed = await bcrypt.hash("NyxAdmin2026!", 12);

  const user = await prisma.user.upsert({
    where: { email: "ops@nyxaerial.com" },
    update: { password: hashed },
    create: {
      name: "Bailey Sargent",
      email: "ops@nyxaerial.com",
      password: hashed,
      role: "ADMIN",
    },
  });

  return NextResponse.json({ ok: true, email: user.email });
}
