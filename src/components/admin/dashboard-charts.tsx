"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthlyRevenue { month: string; revenue: number; invoices: number }
interface JobStatusCount { status: string; count: number }

interface Props {
  monthlyRevenue: MonthlyRevenue[];
  jobsByStatus: JobStatusCount[];
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#475569",
  PENDING_ASSIGNMENT: "#fbbf24",
  ASSIGNED: "#60a5fa",
  IN_PROGRESS: "#00d4ff",
  CAPTURE_COMPLETE: "#a78bfa",
  DELIVERED: "#34d399",
  COMPLETED: "#34d399",
  CANCELLED: "#f87171",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_ASSIGNMENT: "Pending",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  CAPTURE_COMPLETE: "Captured",
  DELIVERED: "Delivered",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        className="text-sm rounded-xl px-3 py-2"
        style={{
          background: "rgba(4,8,15,0.95)",
          border: "1px solid rgba(0,212,255,0.2)",
          backdropFilter: "blur(8px)",
          color: "#d8e8f4",
        }}
      >
        <p className="font-semibold mb-1" style={{ color: "#00d4ff" }}>{label}</p>
        {payload.map((p: { name: string; value: number }, i: number) => (
          <p key={i} style={{ color: p.name === "revenue" ? "#00d4ff" : "#34d399" }}>
            {p.name === "revenue" ? formatCurrency(p.value) : `${p.value} invoices`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function DashboardCharts({ monthlyRevenue, jobsByStatus }: Props) {
  const pieData = jobsByStatus
    .filter((d) => d.count > 0)
    .map((d) => ({
      name: STATUS_LABELS[d.status] ?? d.status,
      value: d.count,
      color: STATUS_COLORS[d.status] ?? "#94a3b8",
    }));

  const panelStyle = {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(0,212,255,0.07)",
    borderRadius: "0.75rem",
    padding: "1rem 1.25rem",
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
      {/* Monthly Revenue */}
      <div className="xl:col-span-3" style={panelStyle}>
        <p className="label-cyan mb-3">Monthly Revenue — Last 6 Months</p>
        {monthlyRevenue.length === 0 ? (
          <div className="flex items-center justify-center h-44" style={{ color: "rgba(0,212,255,0.3)" }}>
            No revenue data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyRevenue} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,212,255,0.05)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "rgba(0,212,255,0.4)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "rgba(0,212,255,0.4)" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" fill="#00d4ff" radius={[4, 4, 0, 0]} name="revenue" fillOpacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Jobs by Status */}
      <div className="xl:col-span-2" style={panelStyle}>
        <p className="label-cyan mb-3">Jobs by Status</p>
        {pieData.length === 0 ? (
          <div className="flex items-center justify-center h-44" style={{ color: "rgba(0,212,255,0.3)" }}>
            No jobs yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="42%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.9} />
                ))}
              </Pie>
              <Legend
                formatter={(value) => (
                  <span style={{ fontSize: 11, color: "rgba(0,212,255,0.55)" }}>{value}</span>
                )}
                iconSize={8}
              />
              <Tooltip
                formatter={(value) => [`${value} jobs`]}
                contentStyle={{
                  background: "rgba(4,8,15,0.95)",
                  border: "1px solid rgba(0,212,255,0.2)",
                  borderRadius: "0.5rem",
                  color: "#d8e8f4",
                  fontSize: 12,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
