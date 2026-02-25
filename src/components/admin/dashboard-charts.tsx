"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface MonthlyRevenue { month: string; revenue: number; invoices: number }
interface JobStatusCount { status: string; count: number }

interface Props {
  monthlyRevenue: MonthlyRevenue[];
  jobsByStatus: JobStatusCount[];
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "#94a3b8",
  PENDING_ASSIGNMENT: "#f97316",
  ASSIGNED: "#3b82f6",
  IN_PROGRESS: "#a855f7",
  CAPTURE_COMPLETE: "#6366f1",
  DELIVERED: "#14b8a6",
  COMPLETED: "#22c55e",
  CANCELLED: "#ef4444",
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
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg text-sm">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: { name: string; value: number }, i: number) => (
          <p key={i} style={{ color: p.name === "revenue" ? "#3b82f6" : "#22c55e" }}>
            {p.name === "revenue" ? formatCurrency(p.value) : `${p.value} invoices`}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export function DashboardCharts({ monthlyRevenue, jobsByStatus }: Props) {
  const pieData = jobsByStatus.filter((d) => d.count > 0).map((d) => ({
    name: STATUS_LABELS[d.status] ?? d.status,
    value: d.count,
    color: STATUS_COLORS[d.status] ?? "#94a3b8",
  }));

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      {/* Monthly Revenue Bar Chart */}
      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle className="text-base">Monthly Revenue (Last 6 Months)</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {monthlyRevenue.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No revenue data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRevenue} margin={{ top: 4, right: 12, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="revenue" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Jobs by Status Pie Chart */}
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="text-base">Jobs by Status</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No jobs yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span style={{ fontSize: 11 }}>{value}</span>}
                  iconSize={8}
                />
                <Tooltip formatter={(value) => [`${value} jobs`]} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
