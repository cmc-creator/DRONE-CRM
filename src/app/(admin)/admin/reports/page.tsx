import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { BarChart2, TrendingUp, Target, DollarSign, Download, Users, Briefcase, ArrowUpRight, ArrowDownRight } from "lucide-react";
import Link from "next/link";
import { ReportCharts } from "./ReportCharts";
import type { SourceRow, MonthlyRevRow, QtrRow } from "./ReportCharts";

export const dynamic = "force-dynamic";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const SOURCE_LABELS: Record<string, string> = {
  REFERRAL:      "Referral",
  WEBSITE:       "Website",
  SOCIAL_MEDIA:  "Social Media",
  COLD_OUTREACH: "Cold Outreach",
  REPEAT_CLIENT: "Repeat Client",
  TRADE_SHOW:    "Trade Show",
  OTHER:         "Other",
};

export default async function ReportsPage() {
  const now       = new Date();
  const thisYear  = now.getFullYear();
  const lastYear  = thisYear - 1;
  const thisStart = new Date(thisYear, 0, 1);
  const lastStart = new Date(lastYear, 0, 1);
  const lastEnd   = new Date(thisYear, 0, 1);

  // ── Data queries ─────────────────────────────────────────────────────────
  const [leads, invoicesThis, invoicesLast, clients, jobs] = await Promise.all([
    prisma.lead.findMany({
      select: { source: true, status: true, value: true, createdAt: true },
    }).catch(() => [] as { source: string; status: string; value: number | null; createdAt: Date }[]),

    prisma.invoice.findMany({
      where:  { status: "PAID", createdAt: { gte: thisStart } },
      select: { totalAmount: true, createdAt: true },
    }),

    prisma.invoice.findMany({
      where:  { status: "PAID", createdAt: { gte: lastStart, lt: lastEnd } },
      select: { totalAmount: true, createdAt: true },
    }),

    prisma.client.findMany({
      select: { source: true, status: true, createdAt: true, _count: { select: { jobs: true } } },
    }),

    prisma.job.findMany({
      where:  { createdAt: { gte: thisStart } },
      select: { createdAt: true, status: true, clientPrice: true },
    }),
  ]);

  // ── Source attribution ────────────────────────────────────────────────────
  const sourceMap = new Map<string, SourceRow>();

  for (const lead of leads) {
    const key = lead.source as string;
    if (!sourceMap.has(key)) {
      sourceMap.set(key, {
        source: key,
        label: SOURCE_LABELS[key] ?? key,
        total: 0, won: 0, lost: 0, open: 0,
        value: 0, wonValue: 0, convRate: 0,
      });
    }
    const row = sourceMap.get(key)!;
    row.total++;
    row.value += lead.value ?? 0;
    if (lead.status === "WON")  { row.won++;  row.wonValue += lead.value ?? 0; }
    else if (lead.status === "LOST") row.lost++;
    else row.open++;
  }

  const sourceRows: SourceRow[] = Array.from(sourceMap.values())
    .map((r) => ({
      ...r,
      convRate: r.total > 0 ? (r.won / r.total) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // ── Monthly revenue (YoY) ─────────────────────────────────────────────────
  const monthlyRev: MonthlyRevRow[] = MONTH_NAMES.map((m) => ({
    month: m, thisYear: 0, lastYear: 0,
  }));

  for (const inv of invoicesThis) {
    monthlyRev[new Date(inv.createdAt).getMonth()].thisYear += Number(inv.totalAmount);
  }
  for (const inv of invoicesLast) {
    monthlyRev[new Date(inv.createdAt).getMonth()].lastYear += Number(inv.totalAmount);
  }

  // ── Quarterly ─────────────────────────────────────────────────────────────
  const qtrTotals = [0, 0, 0, 0];
  for (const inv of invoicesThis) {
    const m = new Date(inv.createdAt).getMonth();
    qtrTotals[Math.floor(m / 3)] += Number(inv.totalAmount);
  }
  const qtrRows: QtrRow[] = qtrTotals.map((revenue, i) => ({
    qtr: `Q${i + 1} ${thisYear}`,
    revenue,
    jobs: jobs.filter((j) => Math.floor(new Date(j.createdAt).getMonth() / 3) === i).length,
  }));

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalRevThis  = invoicesThis.reduce((s, i) => s + Number(i.totalAmount), 0);
  const totalRevLast  = invoicesLast.reduce((s, i) => s + Number(i.totalAmount), 0);
  const revGrowth     = totalRevLast > 0 ? ((totalRevThis - totalRevLast) / totalRevLast) * 100 : null;
  const pipelineValue = leads.filter((l) => !["WON","LOST"].includes(l.status)).reduce((s, l) => s + (l.value ?? 0), 0);
  const wonValue      = leads.filter((l) => l.status === "WON").reduce((s, l) => s + (l.value ?? 0), 0);
  const leadConvRate  = leads.length > 0 ? (leads.filter((l) => l.status === "WON").length / leads.length) * 100 : 0;
  const activeClients = clients.filter((c) => c.status === "ACTIVE").length;
  const totalJobs     = jobs.length;

  // ── Client source table ───────────────────────────────────────────────────
  const clientSourceMap = new Map<string, { count: number; jobs: number }>();
  for (const c of clients) {
    const key = c.source ?? "Unknown";
    const entry = clientSourceMap.get(key) ?? { count: 0, jobs: 0 };
    entry.count++;
    entry.jobs += c._count.jobs;
    clientSourceMap.set(key, entry);
  }
  const clientSources = Array.from(clientSourceMap.entries())
    .map(([source, data]) => ({ source, ...data }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart2 className="w-7 h-7" /> Reports
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Referral source attribution, revenue trends, and lead conversion analysis
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <a href="/api/export/clients" download>
            <button className="inline-flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-sm hover:bg-muted/30 transition-colors">
              <Download className="w-4 h-4" /> Clients CSV
            </button>
          </a>
          <a href="/api/export/invoices" download>
            <button className="inline-flex items-center gap-1.5 border border-border rounded-md px-3 py-1.5 text-sm hover:bg-muted/30 transition-colors">
              <Download className="w-4 h-4" /> Invoices CSV
            </button>
          </a>
        </div>
      </div>

      {/* ── KPI row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue YTD",
            value: formatCurrency(totalRevThis),
            sub: revGrowth !== null
              ? `${revGrowth >= 0 ? "+" : ""}${revGrowth.toFixed(1)}% vs last year`
              : "No prior year data",
            up: revGrowth !== null ? revGrowth >= 0 : null,
            icon: DollarSign,
            color: "text-primary",
          },
          {
            label: "Lead Pipeline",
            value: formatCurrency(pipelineValue),
            sub: `${leads.filter((l) => !["WON","LOST"].includes(l.status)).length} open leads`,
            up: null,
            icon: Target,
            color: "text-amber-500",
          },
          {
            label: "Overall Win Rate",
            value: `${leadConvRate.toFixed(1)}%`,
            sub: `${leads.filter((l) => l.status === "WON").length} of ${leads.length} leads won`,
            up: null,
            icon: TrendingUp,
            color: "text-green-500",
          },
          {
            label: "Active Clients",
            value: String(activeClients),
            sub: `${totalJobs} jobs this year`,
            up: null,
            icon: Users,
            color: "text-foreground",
          },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                {kpi.up !== null && (
                  kpi.up
                    ? <ArrowUpRight className="w-3 h-3 text-green-500" />
                    : <ArrowDownRight className="w-3 h-3 text-destructive" />
                )}
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Charts ──────────────────────────────────────────────────────── */}
      <ReportCharts
        sourceRows={sourceRows}
        monthlyRev={monthlyRev}
        qtrRows={qtrRows}
        pipelineValue={pipelineValue}
        wonValue={wonValue}
      />

      {/* ── Lead Source Attribution Table ───────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-500" /> Referral Source Attribution
            </CardTitle>
            <Link href="/admin/leads" className="text-xs text-primary hover:underline">
              Manage Leads →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Set the <strong>Source</strong> field when creating or editing a lead to track where business comes from.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {sourceRows.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">
              No leads yet. <Link href="/admin/leads/new" className="text-primary hover:underline">Add your first lead</Link> and set its source.
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Leads</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Open</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Won</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Lost</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Win %</th>
                  <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pipeline</th>
                  <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Won Value</th>
                </tr>
              </thead>
              <tbody>
                {sourceRows.map((row) => (
                  <tr key={row.source} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-6 font-medium">{row.label}</td>
                    <td className="py-3 px-4 text-center">{row.total}</td>
                    <td className="py-3 px-4 text-center text-muted-foreground">{row.open}</td>
                    <td className="py-3 px-4 text-center text-green-500 font-medium">{row.won}</td>
                    <td className="py-3 px-4 text-center text-destructive">{row.lost}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-500 rounded-full"
                            style={{ width: `${row.convRate}%` }}
                          />
                        </div>
                        <span className={row.convRate > 0 ? "text-green-500 font-medium" : "text-muted-foreground"}>
                          {row.convRate.toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-6 text-right text-muted-foreground">{formatCurrency(row.value)}</td>
                    <td className="py-3 px-6 text-right font-semibold text-green-500">{formatCurrency(row.wonValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* ── Client Source Table ─────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> Client Source Breakdown
            </CardTitle>
            <Link href="/admin/clients" className="text-xs text-primary hover:underline">
              Manage Clients →
            </Link>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Set the <strong>Source / How They Found Us</strong> field on each client profile to populate this table.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {clientSources.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground">No client source data yet.</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Source</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Clients</th>
                  <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Jobs</th>
                  <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg Jobs / Client</th>
                </tr>
              </thead>
              <tbody>
                {clientSources.map((row) => (
                  <tr key={row.source} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-6 font-medium">{row.source || "—"}</td>
                    <td className="py-3 px-4 text-center">{row.count}</td>
                    <td className="py-3 px-4 text-center">{row.jobs}</td>
                    <td className="py-3 px-6 text-right text-muted-foreground">
                      {row.count > 0 ? (row.jobs / row.count).toFixed(1) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* ── Quarterly summary ───────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-500" /> Quarterly Summary — {thisYear}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Quarter</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jobs</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Revenue</th>
                <th className="text-right py-3 px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wide">% of Year</th>
              </tr>
            </thead>
            <tbody>
              {qtrRows.map((row) => (
                <tr key={row.qtr} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-6 font-medium">{row.qtr}</td>
                  <td className="py-3 px-4 text-center">{row.jobs}</td>
                  <td className="py-3 px-6 text-right font-semibold">{formatCurrency(row.revenue)}</td>
                  <td className="py-3 px-6 text-right text-muted-foreground">
                    {totalRevThis > 0 ? `${((row.revenue / totalRevThis) * 100).toFixed(1)}%` : "—"}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/20">
                <td className="py-3 px-6 font-bold">Total {thisYear}</td>
                <td className="py-3 px-4 text-center font-bold">{totalJobs}</td>
                <td className="py-3 px-6 text-right font-bold text-primary">{formatCurrency(totalRevThis)}</td>
                <td className="py-3 px-6 text-right text-muted-foreground">100%</td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
