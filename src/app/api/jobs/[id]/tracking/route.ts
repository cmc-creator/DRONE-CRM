import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/jobs/[id]/tracking
 * Public — returns job status info identified by trackingToken (passed as `id`).
 * No auth required; used by the /track/[token] public page.
 */
export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id: token } = await context.params;

  const job = await prisma.job.findFirst({
    where: { trackingToken: token },
    select: {
      id: true,
      title: true,
      status: true,
      scheduledDate: true,
      city: true,
      state: true,
      description: true,
      client: { select: { companyName: true } },
      assignments: {
        take: 1,
        orderBy: { assignedAt: "desc" },
        include: { pilot: { include: { user: { select: { name: true } } } } },
      },
      files: {
        where: { approvalStatus: "APPROVED" },
        select: { id: true, name: true, url: true, type: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}
