import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Briefcase, DollarSign, CheckCircle2, Clock, ChevronRight, AlertTriangle } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { DroneWeatherWidget } from "@/components/ui/weather-widget";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:              { label: "Draft",       color: "#94a3b8", bg: "rgba(148,163,184,0.1)"  },
  PENDING_ASSIGNMENT: { label: "Needs Pilot", color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  ASSIGNED:           { label: "Assigned",    color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  IN_PROGRESS:        { label: "In Progress", color: "#00d4ff", bg: "rgba(0,212,255,0.1)"   },
  CAPTURE_COMPLETE:   { label: "Captured",    color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  DELIVERED:          { label: "Delivered",   color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  COMPLETED:          { label: "Completed",   color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  CANCELLED:          { label: "Cancelled",   color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}33` }}
    >
      {c.label}
    </span>
  );
}

export default async function PilotDashboard() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      jobAssignments: {
        include: {
          job: { include: { client: { select: { companyName: true } } } },
          payment: true,
        },
        orderBy: { assignedAt: "desc" },
      },
      complianceDocs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!pilot) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.1)" }}
      >
        <p className="text-sm" style={{ color: "rgba(0,212,255,0.5)" }}>
          Your pilot profile is being set up. Check back soon.
        </p>
      </div>
    );
  }

  const assignments = pilot.jobAssignments;
  const activeJobs    = assignments.filter((a) => ["ASSIGNED","IN_PROGRESS"].includes(a.job.status));
  const completedJobs = assignments.filter((a) => a.job.status === "COMPLETED").length;
  const totalEarned   = assignments.filter((a) => a.payment?.status === "PAID").reduce((s, a) => s + Number(a.payment!.amount), 0);
  const pendingPay    = assignments.filter((a) => ["PENDING","APPROVED"].includes(a.payment?.status ?? "")).reduce((s, a) => s + Number(a.payment?.amount ?? 0), 0);
  const recentJobs    = assignments.slice(0, 6);

  const docTypes  = ["FAA_PART107", "INSURANCE_COI", "W9"] as const;
  const docLabels: Record<string, string> = { FAA_PART107: "FAA Part 107", INSURANCE_COI: "Insurance COI", W9: "W-9" };
  const missingDocs = docTypes.filter((t) => !pilot.complianceDocs.find((d) => d.type === t));
  const firstName = session.user.name?.split(" ")[0] ?? "Pilot";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: "#d8e8f4" }}>
          Hey, {firstName} ✈️
        </h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
          Lumin Aerial — Pilot Portal
        </p>
      </div>

      {/* Compliance warning */}
      {missingDocs.length > 0 && (
        <Link href="/pilot/documents">
          <div
            className="flex items-center gap-3 rounded-xl p-3.5"
            style={{ background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.25)" }}
          >
            <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "#fbbf24" }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold" style={{ color: "#fbbf24" }}>Documents missing</p>
              <p className="text-xs" style={{ color: "rgba(251,191,36,0.7)" }}>
                {missingDocs.map((t) => docLabels[t]).join(", ")} — tap to upload
              </p>
            </div>
            <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "#fbbf24" }} />
          </div>
        </Link>
      )}

      {/* Stats 2x2 */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Active Jobs",  value: activeJobs.length,           icon: Clock,        color: "#00d4ff" },
          { label: "Completed",    value: completedJobs,                icon: CheckCircle2, color: "#34d399" },
          { label: "Total Earned", value: formatCurrency(totalEarned),  icon: DollarSign,   color: "#34d399", isStr: true },
          { label: "Pending Pay",  value: formatCurrency(pendingPay),   icon: DollarSign,   color: "#fbbf24", isStr: true },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.08)" }}
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.45)" }}>{s.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}15` }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-2xl font-black" style={{ color: s.color }}>
                {s.isStr ? s.value : (s.value as number).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>

      {/* Drone Weather Widget */}
      <DroneWeatherWidget />

      {/* Active missions */}
      {activeJobs.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.12)" }}>
          <div className="px-4 py-3 flex items-center justify-between"
            style={{ background: "rgba(0,212,255,0.05)", borderBottom: "1px solid rgba(0,212,255,0.08)" }}
          >
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00d4ff" }}>Active Missions</p>
          </div>
          <div className="divide-y" style={{ borderColor: "rgba(0,212,255,0.05)" }}>
            {activeJobs.map((a) => (
              <Link key={a.id} href={`/pilot/jobs/${a.job.id}`}>
                <div className="px-4 py-3.5 flex items-center gap-3" style={{ background: "rgba(0,212,255,0.02)" }}>
                  <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: "#00d4ff" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#d8e8f4" }}>{a.job.title}</p>
                    <p className="text-xs mt-0.5 truncate" style={{ color: "rgba(0,212,255,0.4)" }}>
                      {a.job.client.companyName}{a.job.scheduledDate ? ` · ${formatDate(a.job.scheduledDate)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusPill status={a.job.status} />
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(0,212,255,0.3)" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Recent jobs */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.07)" }}>
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(0,212,255,0.06)" }}
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(0,212,255,0.5)" }}>Recent Assignments</p>
          <Link href="/pilot/jobs" className="text-xs" style={{ color: "rgba(0,212,255,0.4)" }}>All jobs →</Link>
        </div>
        {recentJobs.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "rgba(0,212,255,0.3)" }}>No jobs assigned yet.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: "rgba(0,212,255,0.04)" }}>
            {recentJobs.map((a) => (
              <Link key={a.id} href={`/pilot/jobs/${a.job.id}`}>
                <div className="px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "#d8e8f4" }}>{a.job.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.38)" }}>
                      {a.job.client.companyName}{a.job.scheduledDate ? ` · ${formatDate(a.job.scheduledDate)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {a.payment?.amount && (
                      <span className="text-xs font-bold" style={{ color: "#34d399" }}>{formatCurrency(a.payment.amount)}</span>
                    )}
                    <StatusPill status={a.job.status} />
                    <ChevronRight className="w-3.5 h-3.5" style={{ color: "rgba(0,212,255,0.2)" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Compliance badges */}
      <div className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.06)" }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(0,212,255,0.5)" }}>Compliance</p>
          <Link href="/pilot/documents" className="text-xs" style={{ color: "rgba(0,212,255,0.4)" }}>Manage →</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {docTypes.map((type) => {
            const doc = pilot.complianceDocs.find((d) => d.type === type);
            const color = !doc ? "#f87171" : doc.status === "APPROVED" ? "#34d399" : doc.status === "EXPIRED" ? "#f87171" : "#fbbf24";
            return (
              <div key={type} className="flex items-center gap-1.5 rounded-full px-3 py-1"
                style={{ background: `${color}10`, border: `1px solid ${color}30` }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-xs font-semibold" style={{ color }}>{docLabels[type]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
