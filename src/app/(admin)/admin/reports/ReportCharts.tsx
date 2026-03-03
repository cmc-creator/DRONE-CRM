"use client";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#00d4ff", "#a78bfa", "#fbbf24", "#34d399", "#fb923c", "#f472b6", "#60a5fa"];

const darkTooltip = {
  contentStyle: {
    background: "#070f1a",
    border: "1px solid rgba(0,212,255,0.15)",
    borderRadius: 8,
    color: "#d8e8f4",
    fontSize: 12,
  },
  labelStyle: { color: "rgba(0,212,255,0.7)", fontWeight: 700 },
};

export interface SourceRow {
  source: string;
  label: string;
  total: number;
  won: number;
  lost: number;
  open: number;
  value: number;
  wonValue: number;
  convRate: number;
}

export interface MonthlyRevRow {
  month: string;
  thisYear: number;
  lastYear: number;
}

export interface QtrRow {
  qtr: string;
  revenue: number;
  jobs: number;
}

interface Props {
  sourceRows: SourceRow[];
  monthlyRev: MonthlyRevRow[];
  qtrRows: QtrRow[];
  pipelineValue: number;
  wonValue: number;
}

export function ReportCharts({ sourceRows, monthlyRev, qtrRows, pipelineValue, wonValue }: Props) {
  const pieData = sourceRows.map((r) => ({ name: r.label, value: r.total }));
  const convData = sourceRows.map((r) => ({ name: r.label, rate: Math.round(r.convRate) }));
  const valueData = sourceRows.map((r) => ({
    name: r.label,
    pipeline: r.value,
    won: r.wonValue,
  }));

  return (
    <div className="space-y-8">
      {/* ── Source attribution row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie: leads by source */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-widest">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${Math.round(percent * 100)}%`} labelLine={false} fontSize={10}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip {...darkTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: conversion rate by source */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-widest">Win Rate by Source</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={convData} layout="vertical" margin={{ left: 16, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: "#8ca3b8", fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8ca3b8", fontSize: 10 }} width={90} />
              <Tooltip {...darkTooltip} formatter={(v) => [`${v}%`, "Win Rate"]} />
              <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
                {convData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bar: pipeline + won value by source */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-widest">Pipeline Value by Source</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={valueData} layout="vertical" margin={{ left: 16, right: 20 }}>
              <XAxis type="number" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#8ca3b8", fontSize: 10 }} />
              <YAxis type="category" dataKey="name" tick={{ fill: "#8ca3b8", fontSize: 10 }} width={90} />
              <Tooltip {...darkTooltip} formatter={(v: number) => [formatCurrency(v)]} />
              <Bar dataKey="pipeline" name="Pipeline" fill="#a78bfa" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="won" name="Won" fill="#34d399" radius={[0, 4, 4, 0]} stackId="a" />
              <Legend wrapperStyle={{ fontSize: 10, color: "#8ca3b8" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Revenue row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Year-over-year monthly revenue */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-widest">Revenue — YoY</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyRev}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: "#8ca3b8", fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#8ca3b8", fontSize: 10 }} />
              <Tooltip {...darkTooltip} formatter={(v: number) => [formatCurrency(v)]} />
              <Legend wrapperStyle={{ fontSize: 10, color: "#8ca3b8" }} />
              <Line type="monotone" dataKey="thisYear" name="This Year" stroke="#00d4ff" strokeWidth={2} dot={{ r: 3, fill: "#00d4ff" }} />
              <Line type="monotone" dataKey="lastYear" name="Last Year" stroke="#a78bfa" strokeWidth={2} strokeDasharray="4 3" dot={{ r: 3, fill: "#a78bfa" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quarterly revenue */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-sm font-semibold mb-4 text-muted-foreground uppercase tracking-widest">Revenue by Quarter</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={qtrRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="qtr" tick={{ fill: "#8ca3b8", fontSize: 10 }} />
              <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: "#8ca3b8", fontSize: 10 }} />
              <Tooltip {...darkTooltip} formatter={(v: number) => [formatCurrency(v)]} />
              <Bar dataKey="revenue" name="Revenue" fill="#fbbf24" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
