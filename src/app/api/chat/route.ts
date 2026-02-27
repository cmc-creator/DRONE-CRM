import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const SYSTEM_PROMPT = `You are Volo (Latin: "I fly"), the AI assistant and personal co-pilot for Bailey Sargent — founder and sole operator of NyxAerial, a nationwide FAA Part 107 drone pilot network. Bailey goes by "BoBo" with close friends and family.

YOUR PERSONALITY:
- Sharp, funny, and occasionally sassy or sarcastic — but always warm and supportive
- You genuinely care about Bailey's success and aren't afraid to call him out (lovingly) when he's overcomplicating things
- Once in a while, throw in an unexpected mom joke or "don't forget your mother loves you, BoBo" — but only occasionally, not every message
- Direct — no corporate fluff, no "Certainly!" — just real talk and real help
- Dry and witty but you ALWAYS get the actual work done
- Call Bailey "BoBo" occasionally, naturally — not every message, just when it fits
- Genuine passion for drones, airspace, and aviation

YOUR EXPERTISE (be specific and actionable):
- Drone operations, FAA Part 107 regulations, airspace classifications (Class B/C/D/E/G), LAANC authorization, waivers
- Managing drone pilots: scheduling, dispatch, compliance docs (FAA cert, COI, W-9), payouts
- Aerial photography and inspection: real estate, construction, marketing, mapping, events
- CRM operations: jobs, invoices, contracts, leads, deliverables workflow, pilot management
- Business strategy for a growing nationwide drone network
- Client relations, pricing, proposals, contract negotiations

NyxAerial CONTEXT:
- Bailey runs the whole operation solo right now
- CRM routes worth mentioning: /admin/dashboard (Command Center), /admin/jobs, /admin/pilots, /admin/clients, /admin/leads (pipeline), /admin/invoices, /admin/calendar, /admin/analytics, /admin/notifications
- Job status flow: DRAFT > PENDING_ASSIGNMENT > ASSIGNED > IN_PROGRESS > CAPTURE_COMPLETE > DELIVERED > COMPLETED

HOW TO HELP:
- Be specific and actionable — if Bailey asks what to work on, actually tell him prioritized steps
- You have a LIVE CRM SNAPSHOT appended below your system prompt — use those real numbers when giving advice. Reference specific jobs, leads, and amounts by name when available.
- Guide him to CRM pages when relevant (e.g., "Check /admin/leads to see your open pipeline")
- Keep responses concise unless depth is genuinely needed
- Never make up data beyond what's in the snapshot

TONE EXAMPLES:
- Good: "Three jobs are sitting in PENDING_ASSIGNMENT right now — head to /admin/jobs and get those dispatched, BoBo."
- Good: "That proposal template should lead with the deliverables first. Clients care about what they're getting, not your gear list."
- Occasional easter egg: respond to "remind me my mom loves me" with an enthusiastic, funny confirmation that yes, his mother absolutely adores him.
- Bad: "Certainly! I'd be happy to assist you with that today!"`;

async function getLiveCRMContext(): Promise<string> {
  try {
    const now = new Date();
    const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [
      totalPilots, activePilots,
      totalClients,
      totalJobs, inProgressJobs, pendingJobs,
      overdueInvoices, unpaidTotal,
      unassignedJobs,
    ] = await Promise.all([
      prisma.pilot.count(),
      prisma.pilot.count({ where: { status: "ACTIVE" } }),
      prisma.client.count(),
      prisma.job.count(),
      prisma.job.count({ where: { status: "IN_PROGRESS" } }),
      prisma.job.count({ where: { status: "PENDING_ASSIGNMENT" } }),
      prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] }, dueDate: { lt: now } } }),
      prisma.invoice.aggregate({ where: { status: { in: ["SENT", "OVERDUE"] } }, _sum: { totalAmount: true } }),
      prisma.job.findMany({
        where: { status: "PENDING_ASSIGNMENT" },
        select: { title: true, scheduledDate: true, client: { select: { companyName: true } } },
        take: 5,
        orderBy: { createdAt: "asc" },
      }),
    ]);

    // Lead and activity counts (guarded — table may not exist yet)
    let openLeads = 0;
    let hotLeads: { companyName: string; contactName: string; status: string }[] = [];
    let overdueFollowUps = 0;
    try {
      [openLeads, hotLeads, overdueFollowUps] = await Promise.all([
        prisma.lead.count({ where: { status: { notIn: ["WON", "LOST"] } } }),
        prisma.lead.findMany({
          where: { status: { in: ["PROPOSAL_SENT", "NEGOTIATING"] } },
          select: { companyName: true, contactName: true, status: true },
          take: 5,
          orderBy: { updatedAt: "desc" },
        }),
        prisma.lead.count({ where: { nextFollowUp: { lt: now }, status: { notIn: ["WON", "LOST"] } } }),
      ]);
    } catch { /* table not yet in this env */ }

    // Expiring compliance docs
    let expiringDocs: { type: string; pilot: { user: { name: string | null } } | null }[] = [];
    try {
      expiringDocs = await prisma.complianceDoc.findMany({
        where: { expiresAt: { gte: now, lte: thirtyDaysOut } },
        select: { type: true, pilot: { select: { user: { select: { name: true } } } } },
        take: 5,
      });
    } catch { /* ignore */ }

    const lines: string[] = [
      "LIVE CRM SNAPSHOT (as of right now):",
      `- Pilots: ${activePilots} active out of ${totalPilots} on roster`,
      `- Clients: ${totalClients} total`,
      `- Jobs: ${inProgressJobs} in-flight, ${pendingJobs} waiting for a pilot, ${totalJobs} total`,
    ];

    if (pendingJobs > 0) {
      lines.push(`- NEEDS ATTENTION: ${pendingJobs} job(s) unassigned:`);
      for (const j of unassignedJobs) {
        const date = j.scheduledDate ? ` — scheduled ${new Date(j.scheduledDate).toLocaleDateString()}` : "";
        lines.push(`    • "${j.title}" for ${j.client?.companyName ?? "unknown client"}${date}`);
      }
    }

    if (overdueInvoices > 0) {
      const amt = Number(unpaidTotal._sum.totalAmount ?? 0).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
      lines.push(`- OVERDUE INVOICES: ${overdueInvoices} overdue totaling ${amt}`);
    }

    if (openLeads > 0) {
      lines.push(`- Lead pipeline: ${openLeads} open leads, ${overdueFollowUps} follow-up(s) overdue`);
    }
    if (hotLeads.length > 0) {
      lines.push(`- Hot leads right now: ${hotLeads.map((l) => `${l.companyName} (${l.status.replace(/_/g, " ")})`).join(", ")}`);
    }

    if (expiringDocs.length > 0) {
      lines.push(`- Compliance docs expiring in 30 days: ${expiringDocs.map((d) => `${d.pilot?.user?.name ?? "unknown"} ${d.type.replace(/_/g, " ")}`).join(", ")}`);
    }

    return "\n\n" + lines.join("\n");
  } catch {
    return ""; // never let context fetch crash the chat
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI assistant not configured. Contact Bailey to enable.", code: "NO_API_KEY" },
      { status: 503 }
    );
  }

  let body: { messages?: { role: string; content: string }[]; isAdmin?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  // Fetch live CRM data for admin users so Volo can give real, specific advice
  const liveContext = body.isAdmin ? await getLiveCRMContext() : "";
  const systemContent = SYSTEM_PROMPT + liveContext;

  const allowedRoles = new Set(["user", "assistant", "system"]);
  const cleaned = messages.filter((m) => allowedRoles.has(m.role)).slice(-20); // keep last 20

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: systemContent }, ...cleaned],
      max_tokens: 700,
      temperature: 0.85,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "AI service unavailable. Try again later." }, { status: 502 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ reply });
}
