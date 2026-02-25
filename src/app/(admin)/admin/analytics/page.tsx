import { prisma } from "@/lib/prisma";
import { BarChart2, TrendingUp, DollarSign, Users, Target, Briefcase } from "lucide-react";
import AnalyticsCharts from "@/components/admin/analytics-charts";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function AnalyticsPage() {
  const now   = new Date();
  const year  = now.getFullYear();
  const start = new Date(year, 0, 1);

  const [jobs, invoices, pilots, clients] = await Promise.all([
    prisma.job.findMany({
      where:   { createdAt: { gte: start } },
      select:  { createdAt: true, status: true, type: true, clientPrice: true },
    }),
    prisma.invoice.findMany({
      where:   { createdAt: { gte: start } },
      select:  { createdAt: true, status: true, totalAmount: true, clientId: true },
    }),
    prisma.pilot.count(),
    prisma.client.count(),
  ]);

  // Lead table added after initial deploy — guard against missing table in production
  let leads: { status: string; value: number | null; createdAt: Date }[] = [];
  try {
    leads = await prisma.lead.findMany({
      select: { status: true, value: true, createdAt: true },
    });
  } catch { /* table not yet migrated */ }

  // ── Revenue by month ──────────────────────────────────────────────
  const currentMonth = now.getMonth(); // 0-indexed
  const revenueByMonth = Array.from({ length: 12 }, (_, i) => ({
    name: MONTH_NAMES[i],
    revenue: 0,
    jobs: 0,
    forecast: null as number | null,
  }));
  for (const inv of invoices) {
    if (inv.status === "PAID") {
      const m = new Date(inv.createdAt).getMonth();
      revenueByMonth[m].revenue += Number(inv.totalAmount);
    }
  }
  for (const job of jobs) {
    const m = new Date(job.createdAt).getMonth();
    revenueByMonth[m].jobs += 1;
  }

  // ── Revenue forecast (linear projection) ─────────────────────────
  // Use completed months to compute an average monthly growth rate,
  // then project forward for the rest of the year.
  const completedMonths = revenueByMonth.slice(0, currentMonth + 1).filter((m) => m.revenue > 0);
  if (completedMonths.length >= 2) {
    // Simple linear regression: y = a + b*x
    const n = completedMonths.length;
    const xs = completedMonths.map((_, i) => i);
    const ys = completedMonths.map((m) => m.revenue);
    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
    const sumX2 = xs.reduce((s, x) => s + x * x, 0);
    const denom = n * sumX2 - sumX * sumX;
    const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
    const intercept = (sumY - slope * sumX) / n;
    // Project remaining months (currentMonth+1 through 11)
    for (let m = currentMonth + 1; m < 12; m++) {
      const x = m - (currentMonth - completedMonths.length + 1);
      revenueByMonth[m].forecast = Math.max(0, Math.round(intercept + slope * x));
    }
    // Also mark current month as forecast baseline for visual continuity
    revenueByMonth[currentMonth].forecast = revenueByMonth[currentMonth].revenue;
  }

  // ── Revenue by job type ──────────────────────────────────────────
  const byType: Record<string, number> = {};
  for (const job of jobs) {
    byType[job.type] = (byType[job.type] ?? 0) + Number(job.clientPrice ?? 0);
  }
  const jobTypeData = Object.entries(byType)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([name, value]) => ({ name: name.replace("_"," "), value }));

  // ── Lead conversion funnel ────────────────────────────────────────
  const leadFunnel = [
    { stage: "Total",    count: leads.length },
    { stage: "Contacted",  count: leads.filter((l) => ["CONTACTED","QUALIFIED","PROPOSAL_SENT","NEGOTIATING","WON"].includes(l.status)).length },
    { stage: "Qualified",  count: leads.filter((l) => ["QUALIFIED","PROPOSAL_SENT","NEGOTIATING","WON"].includes(l.status)).length },
    { stage: "Proposal",   count: leads.filter((l) => ["PROPOSAL_SENT","NEGOTIATING","WON"].includes(l.status)).length },
    { stage: "Won",        count: leads.filter((l) => l.status === "WON").length },
  ];

  // ── Top clients by revenue ────────────────────────────────────────
  const clientRevenue: Record<string, number> = {};
  for (const inv of invoices) {
    if (inv.status === "PAID") {
      clientRevenue[inv.clientId] = (clientRevenue[inv.clientId] ?? 0) + Number(inv.totalAmount);
    }
  }
  const topClientIds = Object.entries(clientRevenue).sort(([,a],[,b]) => b-a).slice(0,5).map(([id]) => id);
  const topClientData = topClientIds.length > 0
    ? await prisma.client.findMany({ where: { id: { in: topClientIds } }, select: { id: true, companyName: true } })
    : [];
  const topClients = topClientData
    .map((c) => ({ name: c.companyName, revenue: clientRevenue[c.id] ?? 0 }))
    .sort((a, b) => b.revenue - a.revenue);

  // ── Summary stats ──────────────────────────────────────────────────
  const totalRevenue     = invoices.filter((i) => i.status === "PAID").reduce((s, i) => s + Number(i.totalAmount), 0);
  const pipelineValue    = leads.filter((l) => !["WON","LOST"].includes(l.status)).reduce((s, l) => s + (l.value ?? 0), 0);
  const completedJobs    = jobs.filter((j) => j.status === "COMPLETED").length;
  const leadConversionPct = leads.length > 0 ? Math.round((leads.filter((l) => l.status === "WON").length / leads.length) * 100) : 0;

  const stats = [
    { label: "YTD Revenue",     value: formatCurrency(totalRevenue), isStr: true, icon: DollarSign, color: "#34d399" },
    { label: "Pipeline Value",  value: formatCurrency(pipelineValue), isStr: true, icon: Target,    color: "#fbbf24" },
    { label: "Completed Jobs",  value: completedJobs,                               icon: Briefcase,  color: "#00d4ff" },
    { label: "Lead Conv. Rate", value: `${leadConversionPct}%`,     isStr: true,  icon: TrendingUp, color: "#a78bfa" },
    { label: "Active Pilots",   value: pilots,                                       icon: Users,      color: "#60a5fa" },
    { label: "Total Clients",   value: clients,                                       icon: Users,      color: "#fb923c" },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-wide flex items-center gap-3"
          style={{ background: "linear-gradient(135deg,#fff 0%,#a78bfa 60%,#00d4ff 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>
          <BarChart2 className="w-6 h-6 flex-shrink-0" style={{ color:"#a78bfa", WebkitTextFillColor:"#a78bfa" }} />
          Analytics
        </h1>
        <p className="text-xs mt-0.5" style={{ color:"rgba(0,212,255,0.4)" }}>Business intelligence for Lumin Aerial — {year}</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-4" style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(0,212,255,0.07)" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${s.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color:s.color }} />
                </div>
              </div>
              <p className="text-xl font-black leading-none" style={{ color:s.color }}>
                {s.isStr ? s.value as string : (s.value as number).toLocaleString()}
              </p>
              <p className="label-cyan mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Charts section */}
      <AnalyticsCharts
        revenueByMonth={revenueByMonth}
        jobTypeData={jobTypeData}
        leadFunnel={leadFunnel}
        topClients={topClients}
      />
    </div>
  );
}
