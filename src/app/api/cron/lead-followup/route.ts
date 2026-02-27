import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendLeadFollowUpEmail } from "@/lib/email";

const CRON_SECRET = process.env.CRON_SECRET;

/**
 * GET /api/cron/lead-followup
 * Runs daily at 07:00 UTC (see vercel.json).
 * Finds all open leads where nextFollowUp has passed and emails the admin.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const adminEmail = process.env.ADMIN_EMAIL ?? "ops@nyxaerial.com";

  const overdueLeads = await prisma.lead.findMany({
    where: {
      nextFollowUp: { lt: now },
      status: { notIn: ["WON", "LOST"] },
    },
    orderBy: { nextFollowUp: "asc" },
  });

  if (overdueLeads.length === 0) {
    return NextResponse.json({ emailsSent: 0 });
  }

  let emailsSent = 0;
  for (const lead of overdueLeads) {
    const msOverdue = now.getTime() - (lead.nextFollowUp?.getTime() ?? now.getTime());
    const daysOverdue = Math.max(1, Math.floor(msOverdue / (1000 * 60 * 60 * 24)));

    await sendLeadFollowUpEmail({
      adminEmail,
      leadId: lead.id,
      companyName: lead.companyName,
      contactName: lead.contactName,
      daysOverdue,
      notes: lead.notes,
    });
    emailsSent++;
  }

  return NextResponse.json({ overdueLeads: overdueLeads.length, emailsSent });
}
