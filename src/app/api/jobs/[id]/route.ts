import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendJobStatusEmail } from "@/lib/email";

interface Props {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, { params }: Props) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: true,
      assignments: {
        include: { pilot: { include: { user: true } }, payment: true },
      },
      files: true,
      invoices: true,
    },
  });

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json(job);
}

export async function PATCH(req: Request, { params }: Props) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  // Pilots may only update status on jobs they are assigned to,
  // and only to allowed transition states.
  if (session.user.role === "PILOT") {
    const PILOT_ALLOWED = ["IN_PROGRESS", "CAPTURE_COMPLETE"];
    if (!body.status || !PILOT_ALLOWED.includes(body.status)) {
      return NextResponse.json({ error: "Pilots may only set IN_PROGRESS or CAPTURE_COMPLETE" }, { status: 403 });
    }
    const pilot = await prisma.pilot.findFirst({ where: { user: { id: session.user.id } } });
    if (!pilot) return NextResponse.json({ error: "Pilot not found" }, { status: 404 });
    const assignment = await prisma.jobAssignment.findFirst({ where: { jobId: id, pilotId: pilot.id } });
    if (!assignment) return NextResponse.json({ error: "Not assigned to this job" }, { status: 403 });

    const updated = await prisma.job.update({ where: { id }, data: { status: body.status } });
    return NextResponse.json(updated);
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const updated = await prisma.job.update({
      where: { id },
      data: {
        ...(body.status && { status: body.status }),
        ...(body.title && { title: body.title }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.location !== undefined && { location: body.location }),
        ...(body.completedDate !== undefined && {
          completedDate: body.completedDate ? new Date(body.completedDate) : null,
        }),
        ...(body.clientPrice !== undefined && { clientPrice: body.clientPrice }),
      },
    });
    // Fire-and-forget status email to assigned pilot
    if (body.status) {
      prisma.jobAssignment
        .findFirst({
          where: { jobId: id },
          include: { pilot: { include: { user: { select: { email: true, name: true } } } } },
        })
        .then((assignment) => {
          const email = assignment?.pilot?.user?.email;
          if (email) {
            sendJobStatusEmail({
              pilotEmail: email,
              pilotName: assignment!.pilot.user?.name ?? "Pilot",
              jobTitle: updated.title,
              newStatus: body.status,
              jobId: updated.id,
            });
          }
        })
        .catch(() => {});
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update job" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: Props) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.job.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
