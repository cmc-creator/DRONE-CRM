import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

/**
 * POST /api/jobs/[id]/generate-tracking-token
 * Generates (or returns existing) a unique tracking token for public job status viewing.
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;

  const job = await prisma.job.findUnique({
    where: { id },
    select: { id: true, trackingToken: true },
  });

  if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (job.trackingToken) {
    return NextResponse.json({ trackingToken: job.trackingToken });
  }

  const trackingToken = randomBytes(16).toString("hex");
  await prisma.job.update({ where: { id }, data: { trackingToken } });

  return NextResponse.json({ trackingToken });
}
