import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Target, DollarSign, TrendingUp, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import LeadsKanbanBoard from "./LeadsKanbanBoard";

export default async function LeadsPage() {
  let leads: Awaited<ReturnType<typeof prisma.lead.findMany>> = [];
  let dbError: string | null = null;

  try {
    leads = await prisma.lead.findMany({
      orderBy: { createdAt: "desc" },
      include: { activities: { take: 1, orderBy: { createdAt: "desc" } } },
    });
  } catch (err) {
    console.error("[LeadsPage] Failed to load leads:", err);
    dbError = err instanceof Error ? err.message : "Database error";
  }

  if (dbError) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1
            className="text-2xl font-black tracking-wide"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #fbbf24 60%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Lead Pipeline
          </h1>
        </div>
        <div
          className="rounded-xl p-6 text-center"
          style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.2)" }}
        >
          <p className="text-sm font-semibold mb-1" style={{ color: "#f87171" }}>
            Unable to load leads
          </p>
          <p className="text-xs" style={{ color: "rgba(248,113,113,0.6)" }}>
            {dbError}
          </p>
        </div>
      </div>
    );
  }

  const openLeads  = leads.filter((l) => !["WON","LOST"].includes(l.status));
  const totalValue = openLeads.reduce((sum, l) => sum + (l.value ?? 0), 0);
  const wonLeads   = leads.filter((l) => l.status === "WON");
  const wonValue   = wonLeads.reduce((sum, l) => sum + (l.value ?? 0), 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-wide"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #fbbf24 60%, #f97316 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Lead Pipeline
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
            Track and convert drone service prospects
          </p>
        </div>
        <Link href="/admin/leads/new">
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </Link>
      </div>

      {/* Pipeline stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Open Leads",    value: openLeads.length,         icon: Target,     color: "#fbbf24", sub: "active pipeline" },
          { label: "Pipeline Value",value: formatCurrency(totalValue), icon: DollarSign, color: "#00d4ff", sub: "estimated revenue", isStr: true },
          { label: "Won This Year", value: wonLeads.length,           icon: TrendingUp, color: "#34d399", sub: "closed deals" },
          { label: "Won Revenue",   value: formatCurrency(wonValue),  icon: Users,      color: "#a78bfa", sub: "closed value", isStr: true },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.07)" }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="label-cyan mb-1">{s.label}</p>
                  <p className="text-2xl font-black" style={{ color: s.color }}>
                    {s.isStr ? s.value : (s.value as number).toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(0,212,255,0.3)" }}>{s.sub}</p>
                </div>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: s.color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban pipeline */}
      <LeadsKanbanBoard leads={leads} />
    </div>
  );
}
