"use client";

import { useState } from "react";
import {
  Beaker, Trash2, Loader2, CheckCircle, AlertTriangle,
  RefreshCw, ChevronDown, ChevronRight, Info,
} from "lucide-react";

// ── Shared styles ─────────────────────────────────────────────────────────────

const glassCard = {
  background: "rgba(255,255,255,0.025)",
  border: "1px solid rgba(0,212,255,0.1)",
  borderRadius: "0.875rem",
  padding: "1.25rem",
} as const;

const sectionHeader = {
  background: "rgba(255,255,255,0.02)",
  borderBottom: "1px solid rgba(0,212,255,0.06)",
  padding: "0.75rem 1.25rem",
  borderRadius: "0.875rem 0.875rem 0 0",
} as const;

// ── Individual action card ────────────────────────────────────────────────────

function ActionCard({
  title,
  description,
  buttonLabel,
  buttonColor,
  confirmMessage,
  onAction,
  warningLevel = "low",
}: {
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor: string;
  confirmMessage?: string;
  onAction: () => Promise<{ message?: string; results?: string[]; credentials?: Record<string, {email:string;password:string}>; deleted?: Record<string,number> }>;
  warningLevel?: "low" | "medium" | "high";
}) {
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState<ReturnType<typeof onAction> extends Promise<infer T> ? T : never | null>(null);
  const [error, setError]         = useState("");
  const [expanded, setExpanded]   = useState(false);

  const borderColor =
    warningLevel === "high"   ? "rgba(248,113,113,0.15)" :
    warningLevel === "medium" ? "rgba(251,191,36,0.15)"  : "rgba(0,212,255,0.1)";

  async function run() {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await onAction();
      setResult(res as never);
      setExpanded(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${borderColor}`, background: "rgba(255,255,255,0.015)" }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>{title}</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(0,212,255,0.4)" }}>{description}</p>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-bold transition-all disabled:opacity-50"
            style={{ background: `${buttonColor}15`, border: `1px solid ${buttonColor}35`, color: buttonColor }}
          >
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Working…</>
              : <>{warningLevel === "high" ? <Trash2 className="w-3.5 h-3.5" /> : <RefreshCw className="w-3.5 h-3.5" />} {buttonLabel}</>
            }
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </div>
        )}

        {result && !error && (
          <div className="mt-3">
            <button
              className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-t-lg"
              style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)", color: "#34d399" }}
              onClick={() => setExpanded(!expanded)}
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                {(result as { message?: string }).message ?? "Done"}
              </span>
              {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
            {expanded && (
              <div
                className="rounded-b-lg px-3 py-3 space-y-1.5 text-xs font-mono max-h-64 overflow-y-auto"
                style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(52,211,153,0.1)", borderTop: "none" }}
              >
                {/* Seed results */}
                {(result as { results?: string[] }).results?.map((line, i) => (
                  <p key={i} style={{ color: line.startsWith("✓") ? "#34d399" : "#94a3b8" }}>{line}</p>
                ))}

                {/* Credentials */}
                {(result as { credentials?: Record<string,{email:string;password:string}> }).credentials && (
                  <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                    <p className="text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.4)" }}>Test logins</p>
                    {Object.entries((result as { credentials: Record<string,{email:string;password:string}> }).credentials).map(([role, creds]) => (
                      <p key={role} style={{ color: "#d8e8f4" }}>
                        <span style={{ color: "#00d4ff" }}>{role}:</span> {creds.email} / {creds.password}
                      </p>
                    ))}
                  </div>
                )}

                {/* Delete counts */}
                {(result as { deleted?: Record<string,number> }).deleted && (
                  <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
                    {Object.entries((result as { deleted: Record<string,number> }).deleted).map(([key, count]) => (
                      <p key={key} style={{ color: count > 0 ? "#f87171" : "#94a3b8" }}>
                        {key}: {count} deleted
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function DevToolsPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black" style={{ color: "#d8e8f4" }}>
          Developer Tools
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.38)" }}>
          Seed demo data for testing or clean the database for a fresh start
        </p>
      </div>

      {/* Info banner */}
      <div
        className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}
      >
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#fbbf24" }} />
        <div className="text-xs leading-relaxed space-y-1" style={{ color: "#94a3b8" }}>
          <p><span style={{ color: "#fbbf24", fontWeight: 700 }}>Development environment tools.</span> Use these to quickly populate the database with test data or wipe it clean.</p>
          <p>All demo records are prefixed with <code className="text-xs" style={{ color: "#00d4ff" }}>[DEMO]</code> and demo users use <code className="text-xs" style={{ color: "#00d4ff" }}>@test.local</code> emails, making them easy to identify and remove.</p>
          <p>Your real admin account is <strong style={{ color: "#d8e8f4" }}>never deleted</strong> — even by &quot;Clear Everything.&quot;</p>
        </div>
      </div>

      {/* Demo data section */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.08)" }}>
        <div style={sectionHeader}>
          <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "rgba(0,212,255,0.55)" }}>
            <Beaker className="w-3.5 h-3.5" /> Demo Data
          </p>
        </div>
        <div className="p-5 space-y-4">
          <ActionCard
            title="Seed Demo Data"
            description="Creates 2 demo clients, 1 demo pilot, 2 demo jobs, 1 demo invoice, and 1 demo contract. Safe to run multiple times — skips records that already exist."
            buttonLabel="Add Demo Data"
            buttonColor="#34d399"
            onAction={async () => {
              const res = await fetch("/api/dev/seed", { method: "POST" });
              if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
              return res.json();
            }}
          />

          <ActionCard
            title="Remove Demo Data Only"
            description="Deletes all records tagged [DEMO] and users with @test.local emails. Your real data is untouched."
            buttonLabel="Clear Demo Data"
            buttonColor="#fbbf24"
            confirmMessage="Remove all demo data? Your real clients, jobs, and pilots will NOT be affected."
            warningLevel="medium"
            onAction={async () => {
              const res = await fetch("/api/dev/clear?mode=demo", { method: "DELETE" });
              if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
              return res.json();
            }}
          />
        </div>
      </div>

      {/* Nuclear option */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(248,113,113,0.15)" }}>
        <div style={{ ...sectionHeader, background: "rgba(248,113,113,0.04)", borderBottom: "1px solid rgba(248,113,113,0.1)" }}>
          <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "rgba(248,113,113,0.7)" }}>
            <Trash2 className="w-3.5 h-3.5" /> Danger Zone
          </p>
        </div>
        <div className="p-5">
          <ActionCard
            title="Clear Everything"
            description="Permanently deletes ALL clients, pilots, jobs, invoices, contracts, and leads. Your admin login accounts are preserved. This CANNOT be undone."
            buttonLabel="Delete All Data"
            buttonColor="#f87171"
            confirmMessage="⚠️ WARNING: This will permanently delete ALL data (clients, pilots, jobs, invoices, contracts, leads).\n\nYour admin accounts will be preserved.\n\nAre you absolutely sure? Type OK to confirm."
            warningLevel="high"
            onAction={async () => {
              const res = await fetch("/api/dev/clear", { method: "DELETE" });
              if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
              return res.json();
            }}
          />
        </div>
      </div>

      {/* Branch strategy info */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.08)" }}>
        <div style={sectionHeader}>
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(0,212,255,0.55)" }}>
            Branch Strategy — How the Code is Organized
          </p>
        </div>
        <div className="p-5 space-y-3 text-xs" style={{ color: "#94a3b8" }}>
          <p>The GitHub repo uses two branches to keep development and production separate:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {[
              {
                name: "main",
                color: "#fbbf24",
                role: "Development",
                desc: "Active development branch. Demo data, test users, and in-progress features live here. Use this day-to-day.",
              },
              {
                name: "production",
                color: "#34d399",
                role: "Live / Clean",
                desc: "Clean branch — no demo data, no test accounts. When you're ready to go live, deploy from this branch. Only merge stable, tested changes into it.",
              },
            ].map((b) => (
              <div key={b.name}
                className="rounded-lg p-3.5"
                style={{ background: `${b.color}08`, border: `1px solid ${b.color}20` }}>
                <p className="text-sm font-bold mb-0.5" style={{ color: b.color }}>
                  <code>{b.name}</code>
                  <span className="ml-2 text-[10px] font-semibold uppercase tracking-wider opacity-70">{b.role}</span>
                </p>
                <p style={{ color: "#94a3b8" }}>{b.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg p-3" style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(0,212,255,0.08)" }}>
            <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(0,212,255,0.4)" }}>To push a fix to production:</p>
            <pre className="text-xs font-mono leading-relaxed" style={{ color: "#00d4ff" }}>
{`git checkout production
git merge main
git push origin production`}
            </pre>
            <p className="mt-2" style={{ color: "#94a3b8" }}>Then set Vercel to deploy from <code style={{ color: "#00d4ff" }}>production</code> branch in your project settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
