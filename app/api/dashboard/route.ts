import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [totalClients, totalPilots, totalLeads, jobs] = await Promise.all([
    prisma.client.count(),
    prisma.pilot.count(),
    prisma.lead.count(),
    prisma.job.findMany({ select: { status: true, commissionAmount: true } }),
  ]);

  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((j) => j.status === "completed").length;
  const activeJobs = jobs.filter((j) =>
    ["pending", "assigned", "in_progress"].includes(j.status)
  ).length;
  const totalRevenue = jobs
    .filter((j) => j.status === "completed")
    .reduce((sum, j) => sum + (j.commissionAmount ?? 0), 0);

  return NextResponse.json({
    totalClients,
    totalPilots,
    totalLeads,
    totalJobs,
    completedJobs,
    activeJobs,
    totalRevenue,
  });
}
