import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  const leadId   = searchParams.get("leadId");
  const jobId    = searchParams.get("jobId");
  const pilotId  = searchParams.get("pilotId");

  const activities = await prisma.activity.findMany({
    where: {
      ...(clientId && { clientId }),
      ...(leadId   && { leadId }),
      ...(jobId    && { jobId }),
      ...(pilotId  && { pilotId }),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      client: { select: { companyName: true } },
      lead:   { select: { companyName: true } },
    },
  });
  return NextResponse.json(activities);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { type, title, body: bodyText, dueDate, clientId, leadId, jobId, pilotId } = body;

  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const activity = await prisma.activity.create({
    data: {
      type: type ?? "NOTE",
      title,
      body: bodyText,
      dueDate: dueDate ? new Date(dueDate) : null,
      createdById: session.user.id as string,
      ...(clientId && { clientId }),
      ...(leadId   && { leadId }),
      ...(jobId    && { jobId }),
      ...(pilotId  && { pilotId }),
    },
  });
  return NextResponse.json(activity, { status: 201 });
}
