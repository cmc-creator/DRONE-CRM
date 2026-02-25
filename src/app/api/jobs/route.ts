import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendJobAssignmentEmail } from "@/lib/email";

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      assignments: {
        include: { pilot: { include: { user: { select: { name: true } } } } },
      },
    },
  });

  return NextResponse.json(jobs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    clientId,
    title,
    description,
    type,
    city,
    state,
    zip,
    address,
    scheduledDate,
    duration,
    deliverables,
    clientPrice,
    pilotPayout,
    priority,
    internalNotes,
    pilotId,
  } = body;

  if (!clientId || !title || !city || !state) {
    return NextResponse.json(
      { error: "Client, title, city, and state are required" },
      { status: 400 }
    );
  }

  const job = await prisma.job.create({
    data: {
      clientId,
      title,
      description,
      type: type ?? "OTHER",
      status: pilotId ? "ASSIGNED" : "PENDING_ASSIGNMENT",
      city,
      state,
      zip,
      address,
      scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
      duration,
      deliverables,
      clientPrice,
      pilotPayout,
      priority: priority ?? 2,
      internalNotes,
      assignments: pilotId
        ? { create: { pilotId } }
        : undefined,
    },
    include: {
      client: true,
      assignments: true,
    },
  });

  // Fire-and-forget assignment email (never blocks response)
  if (pilotId) {
    prisma.pilot
      .findUnique({
        where: { id: pilotId },
        include: { user: { select: { email: true, name: true } } },
      })
      .then((pilot) => {
        if (pilot?.user?.email) {
          sendJobAssignmentEmail({
            pilotEmail: pilot.user.email,
            pilotName: pilot.user.name ?? "Pilot",
            jobTitle: job.title,
            clientName: (job.client as { companyName?: string })?.companyName ?? "N/A",
            city: job.city,
            state: job.state,
            scheduledDate: job.scheduledDate,
            jobId: job.id,
            payout: job.pilotPayout != null ? Number(job.pilotPayout) : null,
          });
        }
      })
      .catch(() => {}); // silently ignore lookup errors
  }

  return NextResponse.json(job, { status: 201 });
}
