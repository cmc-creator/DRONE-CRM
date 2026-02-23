"use client";
import { useEffect, useState } from "react";

interface DashboardData {
  totalClients: number;
  totalPilots: number;
  totalLeads: number;
  totalJobs: number;
  completedJobs: number;
  activeJobs: number;
  totalRevenue: number;
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center gap-4">
      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{label}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then(setData);
  }, []);

  if (!data) {
    return (
      <div className="p-8 flex items-center justify-center h-64">
        <p className="text-slate-500 animate-pulse">Loading dashboard…</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here&apos;s your business overview.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard label="Total Clients" value={data.totalClients} icon="🏢" color="bg-blue-50" />
        <StatCard label="Drone Pilots" value={data.totalPilots} icon="🚁" color="bg-sky-50" />
        <StatCard label="Active Leads" value={data.totalLeads} icon="🎯" color="bg-amber-50" />
        <StatCard label="Total Jobs" value={data.totalJobs} icon="💼" color="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard label="Active Jobs" value={data.activeJobs} icon="⚡" color="bg-green-50" />
        <StatCard label="Completed Jobs" value={data.completedJobs} icon="✅" color="bg-emerald-50" />
        <StatCard
          label="Total Commission Earned"
          value={`$${data.totalRevenue.toFixed(2)}`}
          icon="💰"
          color="bg-yellow-50"
        />
      </div>

      <div className="mt-10 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-700 mb-3">Quick Tips</h2>
        <ul className="text-slate-500 text-sm space-y-1.5 list-disc list-inside">
          <li>Add new <strong>Clients</strong> who need drone services.</li>
          <li>Register <strong>Pilots</strong> with their certifications and locations.</li>
          <li>Track potential clients as <strong>Leads</strong> through the sales pipeline.</li>
          <li>Create <strong>Jobs</strong> to connect pilots with clients and track commissions.</li>
          <li>Manage <strong>Contracts</strong> tied to each job.</li>
        </ul>
      </div>
    </div>
  );
}
