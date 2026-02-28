/**
 * POST /api/jobs/[id]/files/[fileId]/request-revision
 * Client requests a revision on a delivered file.
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string; fileId: string }> }

export async function POST(_req: Request, { params }: Props) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, fileId } = await params;

  // Validate ownership for clients
  if (session.user.role === "CLIENT") {
    const client = await prisma.client.findFirst({ where: { user: { id: session.user.id } } });
    if (!client) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const job = await prisma.job.findUnique({ where: { id }, select: { clientId: true } });
    if (!job || job.clientId !== client.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  } else if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.jobFile.update({
    where: { id: fileId },
    data:  { approvalStatus: "REVISION_REQUESTED", reviewedAt: new Date() },
  });

  // Redirect back to the project page
  return NextResponse.redirect(
    new URL(`/client/projects/${id}`, process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
    303
  );
}
