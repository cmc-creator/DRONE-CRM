/**
 * GET  /api/messages?jobId=...   — list messages for a job
 * POST /api/messages             — send a message
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const jobId = req.nextUrl.searchParams.get("jobId");
  if (!jobId) return NextResponse.json({ error: "jobId required" }, { status: 400 });

  // Clients can only read messages for their own jobs
  if (session.user.role === "CLIENT") {
    const client = await prisma.client.findFirst({ where: { user: { id: session.user.id } } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    const job = await prisma.job.findUnique({ where: { id: jobId }, select: { clientId: true } });
    if (!job || job.clientId !== client.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const messages = await prisma.message.findMany({
    where: { jobId },
    orderBy: { createdAt: "asc" },
  });

  // Mark unread messages as read for this user's role
  const unread = messages
    .filter((m) => !m.readAt && m.senderRole !== session.user.role)
    .map((m) => m.id);

  if (unread.length > 0) {
    await prisma.message.updateMany({
      where: { id: { in: unread } },
      data:  { readAt: new Date() },
    });
  }

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { jobId, body: messageBody } = await req.json();
  if (!messageBody?.trim()) return NextResponse.json({ error: "Message body required" }, { status: 400 });

  // Clients can only message on their own jobs
  if (session.user.role === "CLIENT") {
    const client = await prisma.client.findFirst({ where: { user: { id: session.user.id } } });
    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });
    if (jobId) {
      const job = await prisma.job.findUnique({ where: { id: jobId }, select: { clientId: true } });
      if (!job || job.clientId !== client.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }
  }

  const message = await prisma.message.create({
    data: {
      jobId:      jobId ?? null,
      senderId:   session.user.id,
      senderName: session.user.name ?? session.user.email ?? "Unknown",
      senderRole: session.user.role,
      body:       messageBody.trim(),
    },
  });

  return NextResponse.json(message, { status: 201 });
}
