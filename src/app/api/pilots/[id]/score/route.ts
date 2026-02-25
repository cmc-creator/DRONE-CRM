import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/pilots/[id]/score
 * Recalculates a pilot's quality rating (1.0–5.0) based on:
 *   - Job completion rate (40%)
 *   - Compliance doc status (30%)
 *   - FAA cert validity (15%)
 *   - Insurance validity (15%)
 * Updates Pilot.rating and returns the new score.
 *
 * POST /api/pilots/score-all  (id = "score-all") recalculates every pilot.
 */
export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const all = id === "score-all";

  const where = all ? {} : { id };
  const pilots = await prisma.pilot.findMany({
    where,
    include: {
      jobAssignments: {
        include: { job: { select: { status: true, scheduledDate: true } } },
      },
      complianceDocs: { select: { status: true, expiresAt: true } },
    },
  });

  const now = new Date();
  const results: { pilotId: string; rating: number }[] = [];

  for (const pilot of pilots) {
    const assignments = pilot.jobAssignments;
    const totalJobs = assignments.length;
    const completedJobs = assignments.filter(
      (a) => a.job.status === "COMPLETED" || a.job.status === "DELIVERED"
    ).length;

    // 1. Completion rate score (0–2.0 pts)
    const completionRate = totalJobs > 0 ? completedJobs / totalJobs : 0.5;
    const completionScore = completionRate * 2.0;

    // 2. Compliance docs score (0–1.5 pts)
    const docs = pilot.complianceDocs;
    let complianceScore = 1.5;
    if (docs.length > 0) {
      const approved = docs.filter((d) => d.status === "APPROVED").length;
      const expired = docs.filter((d) => d.status === "EXPIRED").length;
      const expiringSoon = docs.filter((d) => {
        if (!d.expiresAt) return false;
        const days = (d.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return days >= 0 && days <= 30;
      }).length;
      complianceScore = (approved / docs.length) * 1.5;
      complianceScore -= expired * 0.3;
      complianceScore -= expiringSoon * 0.1;
      complianceScore = Math.max(0, complianceScore);
    }

    // 3. FAA cert validity (0–0.75 pts)
    let faaScore = 0.75;
    if (pilot.faaExpiry) {
      const daysToExpiry = (pilot.faaExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysToExpiry < 0) faaScore = 0;
      else if (daysToExpiry < 30) faaScore = 0.25;
      else if (daysToExpiry < 90) faaScore = 0.5;
    } else {
      faaScore = 0.25; // no cert on file is a light penalty
    }

    // 4. Insurance validity (0–0.75 pts)
    let insuranceScore = 0.75;
    if (pilot.insuranceExpiry) {
      const daysToExpiry = (pilot.insuranceExpiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      if (daysToExpiry < 0) insuranceScore = 0;
      else if (daysToExpiry < 30) insuranceScore = 0.25;
      else if (daysToExpiry < 60) insuranceScore = 0.5;
    } else {
      insuranceScore = 0.25;
    }

    const rawScore = completionScore + complianceScore + faaScore + insuranceScore; // max 5.0
    const rating = Math.round(Math.min(5.0, Math.max(1.0, rawScore)) * 10) / 10;

    await prisma.pilot.update({ where: { id: pilot.id }, data: { rating } });
    results.push({ pilotId: pilot.id, rating });
  }

  return NextResponse.json({ ok: true, updated: results.length, results });
}
