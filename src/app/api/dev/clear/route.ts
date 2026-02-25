import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * DELETE /api/dev/clear
 * Wipes all operational data while preserving ADMIN user accounts.
 * Pass ?mode=demo to only delete records tagged [DEMO] (safer option).
 */
export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = new URL(req.url).searchParams.get("mode");
  const demoOnly = mode === "demo";

  const counts: Record<string, number> = {};

  if (demoOnly) {
    // ── Demo-only mode: delete records with [DEMO] tag ─────────────────────
    const demoJobs = await prisma.job.findMany({ where: { title: { startsWith: "[DEMO]" } }, select: { id: true } });
    const demoJobIds = demoJobs.map((j: { id: string }) => j.id);

    if (demoJobIds.length > 0) {
      counts.pilotFiles =     (await prisma.jobFile.deleteMany({       where: { jobId: { in: demoJobIds } } })).count;
      counts.assignments =    (await prisma.jobAssignment.deleteMany({ where: { jobId: { in: demoJobIds } } })).count;
      counts.invoices =       (await prisma.invoice.deleteMany({       where: { jobId: { in: demoJobIds } } })).count;
      counts.jobs =           (await prisma.job.deleteMany({           where: { id:    { in: demoJobIds } } })).count;
    }

    counts.contracts = (await prisma.contract.deleteMany({ where: { title: { startsWith: "[DEMO]" } } })).count;

    // Delete demo users (pilots/clients tagged test.local)
    const demoUsers = await prisma.user.findMany({
      where: { email: { endsWith: "@test.local" } },
      select: { id: true, role: true, pilot: { select: { id: true } }, client: { select: { id: true } } },
    });
    for (const u of demoUsers) {
      if (u.pilot) {
        await prisma.pilotMarket.deleteMany({    where: { pilotId: u.pilot.id } });
        await prisma.equipment.deleteMany({      where: { pilotId: u.pilot.id } });
        await prisma.complianceDoc.deleteMany({  where: { pilotId: u.pilot.id } });
        await prisma.jobAssignment.deleteMany({  where: { pilotId: u.pilot.id } });
        await prisma.pilot.delete({ where: { id: u.pilot.id } });
      }
      if (u.client) {
        await prisma.client.delete({ where: { id: u.client.id } });
      }
      await prisma.user.delete({ where: { id: u.id } });
    }
    counts.demoUsers = demoUsers.length;

    return NextResponse.json({
      success: true,
      message: "Demo data cleared",
      deleted: counts,
    });
  }

  // ── Full clear (keep ADMIN users) ─────────────────────────────────────────
  counts.activities =    (await prisma.activity.deleteMany()).count;
  counts.complianceDocs= (await prisma.complianceDoc.deleteMany()).count;
  counts.payments =      (await prisma.pilotPayment.deleteMany()).count;
  counts.files =         (await prisma.jobFile.deleteMany()).count;
  counts.assignments =   (await prisma.jobAssignment.deleteMany()).count;
  counts.contracts =     (await prisma.contract.deleteMany()).count;
  counts.invoices =      (await prisma.invoice.deleteMany()).count;
  counts.leads =         (await prisma.lead.deleteMany()).count;
  counts.jobs =          (await prisma.job.deleteMany()).count;
  counts.equipment =     (await prisma.equipment.deleteMany()).count;
  counts.markets =       (await prisma.pilotMarket.deleteMany()).count;
  counts.pilots =        (await prisma.pilot.deleteMany()).count;
  counts.clients =       (await prisma.client.deleteMany()).count;

  // Delete non-admin users
  const nonAdmins = await prisma.user.deleteMany({ where: { role: { not: "ADMIN" } } });
  counts.users = nonAdmins.count;

  return NextResponse.json({
    success: true,
    message: "All data cleared (admin accounts preserved)",
    deleted: counts,
  });
}
