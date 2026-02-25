"use client";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, FunnelChart, Funnel, LabelList, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const CYAN   = "#00d4ff";
const PURPLE = "#a78bfa";
const GOLD   = "#fbbf24";
const GREEN  = "#34d399";
const BLUE   = "#60a5fa";
const ORANGE = "#fb923c";
const PIE_COLORS = [CYAN, PURPLE, GOLD, GREEN, BLUE, ORANGE];

const panelStyle = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(0,212,255,0.08)",
  borderRadius: 16,
  padding: "20px",
};

type RevenuePoint   = { name: string; revenue: number; jobs: number };
type TypePoint      = { name: string; value: number };
type FunnelPoint    = { stage: string; count: number };
type ClientPoint    = { name: string; revenue: number };

interface Props {
  revenueByMonth: RevenuePoint[];
  jobTypeData:    TypePoint[];
  leadFunnel:     FunnelPoint[];
  topClients:     ClientPoint[];
}

const darkTooltip = {
  contentStyle: { background: "#070f1a", border: "1px solid rgba(0,212,255,0.2)", borderRadius: 8, color: "#d8e8f4", fontSize: 12 },
  labelStyle:   { color: "rgba(0,212,255,0.7)", fontWeight: 700 },
};

export default function AnalyticsCharts({ revenueByMonth, jobTypeData, leadFunnel, topClients }: Props) {
  return (
    <div className="space-y-4">
      {/* Revenue + jobs by month */}
      <div style={panelStyle}>
        <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "rgba(0,212,255,0.5)" }}>
          Revenue & Jobs — Month by Month
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={revenueByMonth} barGap={2}>
            <XAxis dataKey="name" tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              yAxisId="revenue" orientation="left"
              tick={{ fill: "rgba(0,212,255,0.4)", fontSize: 10 }}
              tickFormatter={(v: number) => `$${(v/1000).toFixed(0)}k`}
              axisLine={false} tickLine={false}
            />
            <YAxis yAxisId="jobs" orientation="right" tick={{ fill: "rgba(251,191,36,0.4)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip
              {...darkTooltip}
              formatter={(val: number, name: string) =>
                name === "revenue"
                  ? ([formatCurrency(val), "Revenue"] as [string, string])
                  : ([String(val), "Jobs"] as [string, string])
              }
            />
            <Legend wrapperStyle={{ color: "rgba(0,212,255,0.5)", fontSize: 11 }} />
            <Bar yAxisId="revenue" dataKey="revenue" fill={CYAN}   radius={[4,4,0,0]} opacity={0.85} name="revenue" />
            <Bar yAxisId="jobs"    dataKey="jobs"    fill={GOLD}   radius={[4,4,0,0]} opacity={0.75} name="jobs" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Job type breakdown */}
        <div style={panelStyle}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "rgba(0,212,255,0.5)" }}>
            Revenue by Job Type
          </p>
          {jobTypeData.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "rgba(0,212,255,0.2)" }}>No data yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={jobTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} paddingAngle={3}>
                    {jobTypeData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...darkTooltip} formatter={(v: unknown) => [formatCurrency(Number(v)), "Revenue"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {jobTypeData.map((entry, i) => (
                  <div key={entry.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ color: "rgba(216,232,244,0.7)" }}>{entry.name}</span>
                    </div>
                    <span style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{formatCurrency(entry.value)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Lead funnel */}
        <div style={panelStyle}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "rgba(0,212,255,0.5)" }}>
            Lead Conversion Funnel
          </p>
          {leadFunnel[0].count === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "rgba(0,212,255,0.2)" }}>No leads yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <FunnelChart>
                  <Tooltip {...darkTooltip} />
                  <Funnel dataKey="count" data={leadFunnel} isAnimationActive>
                    {leadFunnel.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                    <LabelList position="right" fill="rgba(0,212,255,0.6)" style={{ fontSize: 11 }} dataKey="stage" />
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {leadFunnel.map((f, i) => (
                  <div key={f.stage} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span style={{ color: "rgba(216,232,244,0.7)" }}>{f.stage}</span>
                    </div>
                    <span style={{ color: PIE_COLORS[i % PIE_COLORS.length] }}>{f.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Top clients */}
        <div style={panelStyle}>
          <p className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "rgba(0,212,255,0.5)" }}>
            Top Clients by Revenue
          </p>
          {topClients.length === 0 ? (
            <p className="text-xs text-center py-8" style={{ color: "rgba(0,212,255,0.2)" }}>No paid invoices yet</p>
          ) : (
            <div className="space-y-3">
              {topClients.map((c, i) => {
                const maxRev = topClients[0]?.revenue ?? 1;
                const pct    = maxRev > 0 ? (c.revenue / maxRev) * 100 : 0;
                return (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1">
                      <span style={{ color: "rgba(216,232,244,0.8)" }}>
                        <span className="font-bold mr-1.5" style={{ color: "rgba(0,212,255,0.5)" }}>#{i + 1}</span>
                        {c.name}
                      </span>
                      <span style={{ color: GREEN }}>{formatCurrency(c.revenue)}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,212,255,0.08)" }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${CYAN}, ${GREEN})` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
