import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendDeliverableNotificationEmail } from "@/lib/email";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/jobs/[id]/files
 * Pilots and admins can add deliverable files to a job by URL.
 * When isDelivered=true, fires client notification email automatically.
 */
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "PILOT")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: jobId } = await params;
  const body = await req.json();
  const { name, url, type, sizeMb, isDelivered } = body;

  if (!name || !url) {
    return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  }

  // Pilots can only add files to jobs they are assigned to
  if (session.user.role === "PILOT") {
    const pilot = await prisma.pilot.findFirst({ where: { userId: session.user.id } });
    if (!pilot) return NextResponse.json({ error: "Pilot record not found" }, { status: 404 });
    const assignment = await prisma.jobAssignment.findFirst({ where: { jobId, pilotId: pilot.id } });
    if (!assignment) return NextResponse.json({ error: "Not assigned to this job" }, { status: 403 });
  }

  const file = await prisma.jobFile.create({
    data: {
      jobId,
      name,
      url,
      type: type ?? "OTHER",
      sizeMb: sizeMb ? Number(sizeMb) : null,
      uploadedBy: session.user.id,
      isDelivered: Boolean(isDelivered),
      deliveredAt: isDelivered ? new Date() : null,
    },
    include: {
      job: {
        include: {
          client: { include: { user: { select: { email: true, name: true } } } },
          files: { where: { isDelivered: true } },
        },
      },
    },
  });

  // Fire client notification when files are delivered
  if (isDelivered) {
    const clientEmail = file.job.client.user?.email;
    const clientName = file.job.client.user?.name ?? file.job.client.companyName;
    if (clientEmail) {
      const deliveredCount = file.job.files.length;
      sendDeliverableNotificationEmail({
        clientEmail,
        clientName,
        jobTitle: file.job.title,
        jobId: file.job.id,
        fileCount: deliveredCount,
      }).catch(() => {});
    }
  }

  return NextResponse.json(file, { status: 201 });
}
