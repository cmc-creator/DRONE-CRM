import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChevronRight, Briefcase } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

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
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}33` }}>
      {c.label}
    </span>
  );
}

export default async function PilotJobsPage() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({ where: { user: { id: session.user.id } } });
  if (!pilot) return <p className="text-sm" style={{ color: "rgba(0,212,255,0.4)" }}>Profile not found.</p>;

  const assignments = await prisma.jobAssignment.findMany({
    where: { pilotId: pilot.id },
    orderBy: { assignedAt: "desc" },
    include: {
      job: { include: { client: { select: { companyName: true } } } },
      payment: true,
    },
  });

  const active    = assignments.filter((a) => ["ASSIGNED","IN_PROGRESS","CAPTURE_COMPLETE"].includes(a.job.status));
  const completed = assignments.filter((a) => ["COMPLETED","DELIVERED"].includes(a.job.status));
  const other     = assignments.filter((a) => ![...active, ...completed].includes(a));

  function JobCard({ a }: { a: typeof assignments[number] }) {
    return (
      <Link href={`/pilot/jobs/${a.job.id}`}>
        <div className="px-4 py-3.5 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(0,212,255,0.04)" }}
        >
          <Briefcase className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(0,212,255,0.4)" }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#d8e8f4" }}>{a.job.title}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.38)" }}>
              {a.job.client.companyName}
              {a.job.city ? ` · ${a.job.city}, ${a.job.state ?? ""}` : ""}
              {a.job.scheduledDate ? ` · ${formatDate(a.job.scheduledDate)}` : ""}
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
    );
  }

  function Section({ title, items, color }: { title: string; items: typeof assignments; color: string }) {
    if (items.length === 0) return null;
    return (
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.08)" }}>
        <div className="px-4 py-3" style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(0,212,255,0.06)" }}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color }}>
            {title} ({items.length})
          </p>
        </div>
        {items.map((a) => <JobCard key={a.id} a={a} />)}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black" style={{ color: "#d8e8f4" }}>My Jobs</h1>
        <p className="text-sm mt-0.5" style={{ color: "rgba(0,212,255,0.38)" }}>{assignments.length} total assignments</p>
      </div>

      {assignments.length === 0 ? (
        <div className="rounded-xl p-10 text-center" style={{ background: "rgba(0,212,255,0.02)", border: "1px solid rgba(0,212,255,0.08)" }}>
          <p className="text-sm" style={{ color: "rgba(0,212,255,0.35)" }}>No jobs assigned yet. Check back soon.</p>
        </div>
      ) : (
        <>
          <Section title="Active" items={active} color="#00d4ff" />
          <Section title="Completed" items={completed} color="#34d399" />
          <Section title="Other" items={other} color="#94a3b8" />
        </>
      )}
    </div>
  );
}

