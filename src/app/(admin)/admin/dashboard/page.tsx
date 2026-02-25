import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users, Briefcase, Building2, DollarSign,
  CheckCircle2, AlertCircle,
  Target, TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { DashboardCharts } from "@/components/admin/dashboard-charts";
import { CommandCenterHeader } from "@/components/admin/command-center-header";
import { QuickActions } from "./QuickActions";
import { DroneWeatherWidget } from "@/components/ui/weather-widget";

async function getDashboardStats() {
  const [
    totalPilots, activePilots,
    totalClients, activeClients,
    totalJobs, jobsInProgress,
    completedJobs, pendingJobs,
    totalRevenue, pendingInvoices,
  ] = await Promise.all([
    prisma.pilot.count(),
    prisma.pilot.count({ where: { status: "ACTIVE" } }),
    prisma.client.count(),
    prisma.client.count({ where: { status: "ACTIVE" } }),
    prisma.job.count(),
    prisma.job.count({ where: { status: "IN_PROGRESS" } }),
    prisma.job.count({ where: { status: "COMPLETED" } }),
    prisma.job.count({ where: { status: "PENDING_ASSIGNMENT" } }),
    prisma.invoice.aggregate({ where: { status: "PAID" }, _sum: { totalAmount: true } }),
    prisma.invoice.aggregate({ where: { status: { in: ["SENT", "OVERDUE"] } }, _sum: { totalAmount: true } }),
  ]);

  // Lead table added after initial deploy — guard against missing table in production
  let openLeads = 0;
  try {
    openLeads = await prisma.lead.count({ where: { status: { notIn: ["WON", "LOST"] } } });
  } catch { /* table not yet migrated in this environment */ }

  return {
    totalPilots, activePilots, totalClients, activeClients,
    totalJobs, jobsInProgress, completedJobs, pendingJobs,
    totalRevenue: Number(totalRevenue._sum.totalAmount ?? 0),
    pendingInvoices: Number(pendingInvoices._sum.totalAmount ?? 0),
    openLeads,
  };
}

async function getChartData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const paidInvoices = await prisma.invoice.findMany({
    where: { status: "PAID", paidDate: { gte: sixMonthsAgo } },
    select: { paidDate: true, totalAmount: true },
    orderBy: { paidDate: "asc" },
  });

  const monthMap: Record<string, { revenue: number; invoices: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const key = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    monthMap[key] = { revenue: 0, invoices: 0 };
  }
  for (const inv of paidInvoices) {
    if (!inv.paidDate) continue;
    const key = new Date(inv.paidDate).toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    if (monthMap[key]) {
      monthMap[key].revenue += Number(inv.totalAmount);
      monthMap[key].invoices += 1;
    }
  }
  const monthlyRevenue = Object.entries(monthMap).map(([month, v]) => ({ month, ...v }));

  const allStatuses = ["DRAFT","PENDING_ASSIGNMENT","ASSIGNED","IN_PROGRESS","CAPTURE_COMPLETE","DELIVERED","COMPLETED","CANCELLED"];
  const jobCounts = await prisma.job.groupBy({ by: ["status"], _count: { _all: true } });
  const countMap = Object.fromEntries(jobCounts.map((j) => [j.status, j._count._all]));
  const jobsByStatus = allStatuses.map((s) => ({ status: s, count: countMap[s] ?? 0 }));

  return { monthlyRevenue, jobsByStatus };
}

async function getRecentJobs() {
  return prisma.job.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      assignments: {
        include: { pilot: { include: { user: { select: { name: true } } } } },
      },
    },
  });
}

async function getRecentActivities() {
  // Activity table added after initial deploy — guard against missing table in production
  try {
    return await prisma.activity.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { companyName: true } },
        lead: { select: { companyName: true } },
      },
    });
  } catch {
    return [];
  }
}

const JOB_STATUS_COLORS: Record<string, { text: string; bg: string }> = {
  DRAFT:              { text: "#94a3b8", bg: "rgba(148,163,184,0.1)" },
  PENDING_ASSIGNMENT: { text: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  ASSIGNED:           { text: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  IN_PROGRESS:        { text: "#00d4ff", bg: "rgba(0,212,255,0.1)"   },
  CAPTURE_COMPLETE:   { text: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  DELIVERED:          { text: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  COMPLETED:          { text: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  CANCELLED:          { text: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

function StatusPill({ status }: { status: string }) {
  const c = JOB_STATUS_COLORS[status] ?? { text: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ color: c.text, background: c.bg, border: `1px solid ${c.text}33` }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

const ACTIVITY_ICONS: Record<string, string> = {
  CALL: "📞", EMAIL: "✉️", NOTE: "📝", MEETING: "🤝",
  TASK: "✅", QUOTE_SENT: "📄", FLIGHT_COMPLETED: "🚁",
};

const EMPTY_STATS = {
  totalPilots: 0, activePilots: 0, totalClients: 0, activeClients: 0,
  totalJobs: 0, jobsInProgress: 0, completedJobs: 0, pendingJobs: 0,
  totalRevenue: 0, pendingInvoices: 0, openLeads: 0,
};

export default async function AdminDashboard() {
  const [stats, recentJobs, chartData, recentActivities] = await Promise.all([
    getDashboardStats().catch(() => EMPTY_STATS),
    getRecentJobs().catch(() => []),
    getChartData().catch(() => ({ monthlyRevenue: [], jobsByStatus: [] })),
    getRecentActivities().catch(() => []),
  ]);

  const statCards = [
    { label: "Active Pilots",    value: stats.activePilots,   sub: `${stats.totalPilots} on roster`,      icon: Users,        color: "#00d4ff" },
    { label: "Active Clients",   value: stats.activeClients,  sub: `${stats.totalClients} total`,          icon: Building2,    color: "#a78bfa" },
    { label: "Open Leads",       value: stats.openLeads,      sub: "in pipeline",                          icon: Target,       color: "#fbbf24", href: "/admin/leads" },
    { label: "In-Flight Jobs",   value: stats.jobsInProgress, sub: `${stats.pendingJobs} pending dispatch`,icon: Briefcase,    color: "#60a5fa" },
    { label: "Completed Jobs",   value: stats.completedJobs,  sub: `${stats.totalJobs} total`,             icon: CheckCircle2, color: "#34d399" },
    { label: "Total Revenue",    value: formatCurrency(stats.totalRevenue), sub: "all paid invoices", icon: DollarSign, color: "#34d399", isStr: true },
    { label: "Pending Invoices", value: formatCurrency(stats.pendingInvoices), sub: "outstanding",    icon: AlertCircle, color: "#fbbf24", isStr: true },
    { label: "Avg. Jobs/Month",  value: stats.totalJobs > 0 ? Math.round(stats.totalJobs / 6) : 0, sub: "last 6 months", icon: TrendingUp, color: "#00d4ff" },
  ];



  return (
    <div className="space-y-6">
      {/* Cinematic page header */}
      <CommandCenterHeader />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3">
        {statCards.map((s) => {
          const Icon = s.icon;
          const card = (
            <div
              key={s.label}
              className="rounded-xl p-4 relative overflow-hidden transition-all duration-200 group cursor-pointer hover:bg-white/5 hover:border-white/20"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(0,212,255,0.08)",
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="label-cyan mb-1">{s.label}</p>
                  <p
                    className="text-3xl font-black"
                    style={{ color: s.color, textShadow: `0 0 20px ${s.color}55` }}
                  >
                    {s.isStr ? s.value : (s.value as number).toLocaleString()}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "rgba(0,212,255,0.35)" }}>
                    {s.sub}
                  </p>
                </div>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: `${s.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          );
          return s.href ? (
            <Link key={s.label} href={s.href} className="block">{card}</Link>
          ) : (
            <div key={s.label}>{card}</div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Drone Weather */}
      <DroneWeatherWidget />

      {/* Two-column: Charts + Activity Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          <DashboardCharts monthlyRevenue={chartData.monthlyRevenue} jobsByStatus={chartData.jobsByStatus} />
        </div>

        {/* Activity Feed */}
        <div
          className="rounded-xl p-4"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.07)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <p className="label-cyan">Activity Feed</p>
            <Link href="/admin/leads" className="text-xs" style={{ color: "rgba(0,212,255,0.5)" }}>
              View all →
            </Link>
          </div>
          {recentActivities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs" style={{ color: "rgba(0,212,255,0.3)" }}>
                No activity yet. Log calls, notes, and meetings from client or lead pages.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((a) => (
                <div
                  key={a.id}
                  className="flex gap-3 items-start"
                  style={{ borderLeft: "1px solid rgba(0,212,255,0.1)", paddingLeft: "10px" }}
                >
                  <span className="text-base leading-none mt-0.5 flex-shrink-0">
                    {ACTIVITY_ICONS[a.type] ?? "📋"}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#d8e8f4" }}>
                      {a.title}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(0,212,255,0.4)" }}>
                      {a.client?.companyName ?? a.lead?.companyName ?? "General"} · {new Date(a.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Missions */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid rgba(0,212,255,0.07)" }}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.06)", background: "rgba(0,212,255,0.03)" }}
        >
          <p className="label-cyan">Recent Missions</p>
          <Link href="/admin/jobs" className="text-xs" style={{ color: "rgba(0,212,255,0.5)" }}>
            View all jobs →
          </Link>
        </div>
        <div className="divide-y" style={{ borderColor: "rgba(0,212,255,0.04)" }}>
          {recentJobs.length === 0 ? (
            <p className="px-5 py-6 text-sm text-center" style={{ color: "rgba(0,212,255,0.3)" }}>
              No jobs yet.
            </p>
          ) : (
            recentJobs.map((job) => {
              const pilot = job.assignments?.[0]?.pilot?.user?.name;
              return (
                <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block">
                  <div className="flex items-center gap-4 px-5 py-3 transition-colors duration-100 hover:bg-[rgba(0,212,255,0.03)]">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "#d8e8f4" }}>
                        {job.title}
                      </p>
                      <p className="text-xs" style={{ color: "rgba(0,212,255,0.38)" }}>
                        {job.client?.companyName ?? "—"}
                        {pilot ? ` · Pilot: ${pilot}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: "rgba(0,212,255,0.3)" }}>
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                      <StatusPill status={job.status} />
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
