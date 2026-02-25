import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/jobs/[id]/files/[fileId]
 * Body: { approvalStatus: "APPROVED" | "REVISION_REQUESTED", approvalNote?: string }
 * Clients and admins can approve or request revisions on job deliverable files.
 */
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string; fileId: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId, fileId } = await context.params;
  const { approvalStatus, approvalNote } = await req.json();

  if (!["APPROVED", "REVISION_REQUESTED"].includes(approvalStatus)) {
    return NextResponse.json({ error: "Invalid approvalStatus" }, { status: 400 });
  }

  // Verify the file belongs to this job
  const file = await prisma.jobFile.findFirst({
    where: { id: fileId, jobId },
    include: { job: { include: { client: { include: { user: true } } } } },
  });

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  // Clients can only approve their own job files
  if (session.user.role === "CLIENT") {
    const clientRecord = await prisma.client.findFirst({
      where: { userId: session.user.id },
    });
    if (file.job.clientId !== clientRecord?.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const updated = await prisma.jobFile.update({
    where: { id: fileId },
    data: {
      approvalStatus,
      approvalNote: approvalNote ?? null,
      reviewedAt: new Date(),
    },
  });

  return NextResponse.json(updated);
}
