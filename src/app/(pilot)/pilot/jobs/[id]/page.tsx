"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Briefcase, MapPin, Calendar, DollarSign, FileText, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { formatDate, formatCurrency } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  DRAFT:              { label: "Draft",           color: "#94a3b8", bg: "rgba(148,163,184,0.1)"  },
  PENDING_ASSIGNMENT: { label: "Needs Pilot",     color: "#fbbf24", bg: "rgba(251,191,36,0.1)"  },
  ASSIGNED:           { label: "Assigned",        color: "#60a5fa", bg: "rgba(96,165,250,0.1)"  },
  IN_PROGRESS:        { label: "In Progress",     color: "#00d4ff", bg: "rgba(0,212,255,0.1)"   },
  CAPTURE_COMPLETE:   { label: "Captured",        color: "#a78bfa", bg: "rgba(167,139,250,0.1)" },
  DELIVERED:          { label: "Delivered",       color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  COMPLETED:          { label: "Completed",       color: "#34d399", bg: "rgba(52,211,153,0.1)"  },
  CANCELLED:          { label: "Cancelled",       color: "#f87171", bg: "rgba(248,113,113,0.1)" },
};

function StatusPill({ status }: { status: string }) {
  const c = STATUS_CONFIG[status] ?? { label: status, color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
  return (
    <span
      className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide"
      style={{ color: c.color, background: c.bg, border: `1px solid ${c.color}33` }}
    >
      {c.label}
    </span>
  );
}

interface JobFile {
  id: string;
  name: string;
  url: string;
  type: string;
  sizeMb: number | null;
  isDelivered: boolean;
  deliveredAt: string | null;
  createdAt: string;
}

interface JobDetail {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  address: string | null;
  city: string | null;
  state: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  deliverables: string | null;
  clientPrice: number;
  pilotPayout: number;
  client: { companyName: string };
  files: JobFile[];
}

export default function PilotJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error("Job not found");
      const data = await res.json();
      setJob(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function updateStatus(newStatus: string) {
    if (!job) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      const updated = await res.json();
      setJob((prev) => prev ? { ...prev, status: updated.status } : prev);
    } catch {
      alert("Could not update job status. Please try again.");
    } finally {
      setActionLoading(false);
    }
  }

  const glassCard = {
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(0,212,255,0.08)",
    borderRadius: "0.875rem",
  } as const;

  const sectionHeader = {
    background: "rgba(255,255,255,0.02)",
    borderBottom: "1px solid rgba(0,212,255,0.06)",
    padding: "0.75rem 1rem",
  } as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24" style={{ color: "rgba(0,212,255,0.5)" }}>
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rounded-xl p-10 text-center" style={glassCard}>
        <p className="text-sm" style={{ color: "#f87171" }}>{error ?? "Job not found."}</p>
        <Link href="/pilot/jobs" className="text-xs mt-3 inline-block" style={{ color: "rgba(0,212,255,0.5)" }}>
          ← Back to Jobs
        </Link>
      </div>
    );
  }

  const canStart    = job.status === "ASSIGNED";
  const canCapture  = job.status === "IN_PROGRESS";

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Back + header */}
      <div>
        <Link
          href="/pilot/jobs"
          className="inline-flex items-center gap-1.5 text-xs mb-4"
          style={{ color: "rgba(0,212,255,0.45)" }}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Jobs
        </Link>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#d8e8f4" }}>{job.title}</h1>
            <p className="text-xs mt-1" style={{ color: "rgba(0,212,255,0.38)" }}>
              {job.client.companyName} · {job.type}
            </p>
          </div>
          <StatusPill status={job.status} />
        </div>
      </div>

      {/* Status action buttons */}
      {(canStart || canCapture) && (
        <div
          className="rounded-xl p-4 flex items-center justify-between gap-4 flex-wrap"
          style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)" }}
        >
          <div>
            <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>
              {canStart ? "Ready to fly?" : "Shoot complete?"}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.38)" }}>
              {canStart
                ? "Tap below when you arrive on site."
                : "Tap below when footage capture is done."}
            </p>
          </div>
          {canStart && (
            <button
              onClick={() => updateStatus("IN_PROGRESS")}
              disabled={actionLoading}
              className="px-5 py-2 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: "rgba(96,165,250,0.15)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.4)" }}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "▶ Start Job"}
            </button>
          )}
          {canCapture && (
            <button
              onClick={() => updateStatus("CAPTURE_COMPLETE")}
              disabled={actionLoading}
              className="px-5 py-2 rounded-full text-sm font-bold transition-opacity disabled:opacity-50"
              style={{ background: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.4)" }}
            >
              {actionLoading ? <Loader2 className="w-4 h-4 animate-spin inline" /> : "✔ Mark Captured"}
            </button>
          )}
        </div>
      )}

      {/* Job details */}
      <div style={glassCard}>
        <div style={sectionHeader}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(0,212,255,0.55)" }}>
            Job Details
          </p>
        </div>
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {job.address && (
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "rgba(0,212,255,0.4)" }} />
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>Location</p>
                <p className="text-sm" style={{ color: "#d8e8f4" }}>{job.address}</p>
                {job.city && (
                  <p className="text-xs" style={{ color: "rgba(0,212,255,0.38)" }}>{job.city}{job.state ? `, ${job.state}` : ""}</p>
                )}
              </div>
            </div>
          )}

          {job.scheduledDate && (
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "rgba(0,212,255,0.4)" }} />
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>Scheduled</p>
                <p className="text-sm" style={{ color: "#d8e8f4" }}>{formatDate(job.scheduledDate)}</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5">
            <DollarSign className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#34d399" }} />
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>Your Payout</p>
              <p className="text-sm font-bold" style={{ color: "#34d399" }}>{formatCurrency(job.pilotPayout)}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Briefcase className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "rgba(0,212,255,0.4)" }} />
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>Job Type</p>
              <p className="text-sm" style={{ color: "#d8e8f4" }}>{job.type.replace(/_/g, " ")}</p>
            </div>
          </div>
        </div>

        {job.description && (
          <div className="px-4 pb-4">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(0,212,255,0.35)" }}>Description</p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(216,232,244,0.75)" }}>{job.description}</p>
          </div>
        )}

        {job.deliverables && (
          <div className="px-4 pb-4">
            <p className="text-[10px] uppercase tracking-wider mb-1" style={{ color: "rgba(0,212,255,0.35)" }}>Deliverable Requirements</p>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(216,232,244,0.75)" }}>{job.deliverables}</p>
          </div>
        )}
      </div>

      {/* Files */}
      <div style={glassCard}>
        <div style={sectionHeader}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(0,212,255,0.55)" }}>
            Files ({job.files.length})
          </p>
        </div>
        {job.files.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm" style={{ color: "rgba(0,212,255,0.3)" }}>No files uploaded yet.</p>
          </div>
        ) : (
          <div>
            {job.files.map((file) => (
              <div
                key={file.id}
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderBottom: "1px solid rgba(0,212,255,0.04)" }}
              >
                <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(0,212,255,0.4)" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate" style={{ color: "#d8e8f4" }}>{file.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>
                    {file.type}
                    {file.sizeMb ? ` · ${file.sizeMb.toFixed(1)} MB` : ""}
                    {" · "}{formatDate(file.deliveredAt ?? file.createdAt)}
                  </p>
                </div>
                {file.isDelivered && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                    style={{ color: "#34d399", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                    Delivered
                  </span>
                )}
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                  style={{ color: "rgba(0,212,255,0.4)" }}
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed date */}
      {job.completedDate && (
        <p className="text-xs text-center pb-4" style={{ color: "rgba(0,212,255,0.25)" }}>
          Completed {formatDate(job.completedDate)}
        </p>
      )}
    </div>
  );
}
