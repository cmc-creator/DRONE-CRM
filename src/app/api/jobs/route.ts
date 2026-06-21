import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendJobAssignmentEmail } from "@/lib/email";
import { notifyJobAssigned } from "@/lib/notify";

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

  // Auto-create a DRAFT invoice when clientPrice is provided
  if (clientPrice && Number(clientPrice) > 0) {
    const year = new Date().getFullYear();
    const count = await prisma.invoice.count();
    const invoiceNumber = `NY-${year}-${String(count + 1).padStart(4, "0")}`;
    await prisma.invoice.create({
      data: {
        clientId,
        jobId: job.id,
        invoiceNumber,
        status: "DRAFT",
        amount: clientPrice,
        totalAmount: clientPrice,
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        lineItems: [{ description: job.title, qty: 1, unitPrice: Number(clientPrice), total: Number(clientPrice) }],
      },
    }).catch(() => {}); // non-fatal
  }

  // Fire-and-forget assignment email + Slack/Teams/SMS
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
            payout: job.pilotPayout ? Number(job.pilotPayout) : null,
          });
        }
        // Slack / Teams / SMS notifications
        notifyJobAssigned({
          jobTitle:      job.title,
          pilotName:     pilot?.user?.name ?? "Pilot",
          pilotPhone:    (pilot as { phone?: string | null } | null)?.phone,
          clientName:    (job.client as { companyName?: string })?.companyName ?? "N/A",
          city:          job.city,
          state:         job.state,
          scheduledDate: job.scheduledDate,
          jobId:         job.id,
        });
      })
      .catch(() => {}); // silently ignore
  }

  return NextResponse.json(job, { status: 201 });
}
