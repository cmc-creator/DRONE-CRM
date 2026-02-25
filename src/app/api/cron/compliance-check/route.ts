import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendComplianceExpiryEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/compliance-check
 * Runs daily at 09:00 UTC (see vercel.json).
 * 1. Finds all pilot compliance docs expiring within 30 days.
 * 2. Sends targeted email alerts at 30 / 14 / 7 / 1 day thresholds.
 * 3. Marks docs with past expiry as EXPIRED.
 */
export async function GET(req: NextRequest) {
  // Protect cron from public access
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  // Fetch all non-expired compliance docs expiring within 30 days
  const docs = await prisma.complianceDoc.findMany({
    where: {
      expiresAt: { gte: now, lte: in30Days },
      status: { not: "EXPIRED" },
    },
    include: {
      pilot: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  // Fetch already-expired docs and mark them
  const expired = await prisma.complianceDoc.findMany({
    where: {
      expiresAt: { lt: now },
      status: { not: "EXPIRED" },
    },
    select: { id: true },
  });

  let markedExpired = 0;
  if (expired.length > 0) {
    await prisma.complianceDoc.updateMany({
      where: { id: { in: expired.map((d) => d.id) } },
      data: { status: "EXPIRED" },
    });
    markedExpired = expired.length;
  }

  const ALERT_DAYS = [30, 14, 7, 1];
  const emailsSent: string[] = [];

  for (const doc of docs) {
    const msLeft = (doc.expiresAt?.getTime() ?? 0) - now.getTime();
    const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

    // Only alert on specific threshold days to avoid daily spam
    if (!ALERT_DAYS.includes(daysLeft)) continue;

    const pilotEmail = doc.pilot?.user?.email;
    const pilotName = doc.pilot?.user?.name ?? "Pilot";

    if (!pilotEmail || !doc.expiresAt) continue;

    await sendComplianceExpiryEmail({
      pilotEmail,
      pilotName,
      docType: String(doc.type),
      expiresAt: doc.expiresAt,
      daysLeft,
    });

    emailsSent.push(`${pilotName} — ${doc.type} (${daysLeft}d)`);
  }

  return NextResponse.json(
    {
      ok: true,
      scanned: docs.length,
      emailsSent: emailsSent.length,
      markedExpired,
      details: emailsSent,
    },
    { status: 200 }
  );
}
