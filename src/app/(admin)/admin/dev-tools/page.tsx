"use client";

import { useState, useRef, type ReactNode } from "react";
import {
  Beaker, Trash2, Loader2, CheckCircle, AlertTriangle,
  RefreshCw, ChevronDown, ChevronRight, Info, Undo2, ShieldAlert,
} from "lucide-react";

// ── Shared styles ─────────────────────────────────────────────────────────────

const sectionHeader = {
  background: "rgba(255,255,255,0.02)",
  borderBottom: "1px solid rgba(0,212,255,0.06)",
  padding: "0.75rem 1.25rem",
  borderRadius: "0.875rem 0.875rem 0 0",
} as const;

type ActionResult = {
  message?: string;
  results?: string[];
  credentials?: Record<string, { email: string; password: string }>;
  deleted?: Record<string, number>;
};

// ── Result log ────────────────────────────────────────────────────────────────

function ResultLog({ result }: { result: ActionResult }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="mt-3">
      <button
        className="w-full flex items-center justify-between text-xs px-3 py-2 rounded-t-lg"
        style={{ background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.15)", color: "#34d399" }}
        onClick={() => setExpanded(!expanded)}
      >
        <span className="flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5" />
          {result.message ?? "Done"}
        </span>
        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {expanded && (
        <div
          className="rounded-b-lg px-3 py-3 space-y-1.5 text-xs font-mono max-h-64 overflow-y-auto"
          style={{ background: "rgba(0,0,0,0.3)", border: "1px solid rgba(52,211,153,0.1)", borderTop: "none" }}
        >
          {result.results?.map((line, i) => (
            <p key={i} style={{ color: line.startsWith("✓") ? "#34d399" : "#94a3b8" }}>{line}</p>
          ))}
          {result.credentials && (
            <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
              <p className="text-[10px] mb-1.5 uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.4)" }}>Test logins</p>
              {Object.entries(result.credentials).map(([role, creds]) => (
                <p key={role} style={{ color: "#d8e8f4" }}>
                  <span style={{ color: "#00d4ff" }}>{role}:</span> {creds.email} / {creds.password}
                </p>
              ))}
            </div>
          )}
          {result.deleted && (
            <div className="mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,212,255,0.08)" }}>
              {Object.entries(result.deleted).map(([key, count]) => (
                <p key={key} style={{ color: count > 0 ? "#f87171" : "#94a3b8" }}>
                  {key}: {count} deleted
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Standard action card (seed / low-risk) ────────────────────────────────────

function ActionCard({
  title,
  description,
  buttonLabel,
  buttonColor,
  onAction,
  afterAction,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  buttonColor: string;
  onAction: () => Promise<ActionResult>;
  afterAction?: (result: ActionResult) => ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ActionResult | null>(null);
  const [error, setError]     = useState("");

  async function run() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await onAction();
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: "1px solid rgba(0,212,255,0.1)", background: "rgba(255,255,255,0.015)" }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>{title}</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(0,212,255,0.4)" }}>{description}</p>
          </div>
          <button
            onClick={run}
            disabled={loading}
            className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-bold disabled:opacity-50"
            style={{ background: `${buttonColor}15`, border: `1px solid ${buttonColor}35`, color: buttonColor }}
          >
            {loading
              ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Working...</>
              : <><RefreshCw className="w-3.5 h-3.5" /> {buttonLabel}</>}
          </button>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </div>
        )}
        {result && <ResultLog result={result} />}
        {result && afterAction?.(result)}
      </div>
    </div>
  );
}

// ── Two-step confirm card (medium risk: clear demo) ───────────────────────────

function TwoStepCard({
  title,
  description,
  buttonLabel,
  confirmDescription,
  onAction,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  confirmDescription: string;
  onAction: () => Promise<ActionResult>;
}) {
  const [step, setStep]       = useState<"idle" | "confirm" | "done">("idle");
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<ActionResult | null>(null);
  const [error, setError]     = useState("");

  async function run() {
    setLoading(true);
    setError("");
    try {
      const res = await onAction();
      setResult(res);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{ border: step === "confirm" ? "1px solid rgba(251,191,36,0.35)" : "1px solid rgba(251,191,36,0.15)", background: "rgba(255,255,255,0.015)" }}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>{title}</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(0,212,255,0.4)" }}>{description}</p>
          </div>
          {step === "idle" && (
            <button
              onClick={() => setStep("confirm")}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-bold"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24" }}
            >
              <Trash2 className="w-3.5 h-3.5" /> {buttonLabel}
            </button>
          )}
        </div>

        {/* Step 2: inline confirmation */}
        {step === "confirm" && (
          <div className="mt-4 rounded-lg p-4"
            style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.25)" }}>
            <p className="text-xs font-bold mb-1" style={{ color: "#fbbf24" }}>
              Warning: Are you sure?
            </p>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: "#94a3b8" }}>{confirmDescription}</p>
            <div className="flex gap-2">
              <button
                onClick={run}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                style={{ background: "rgba(251,191,36,0.15)", border: "1px solid rgba(251,191,36,0.4)", color: "#fbbf24" }}
              >
                {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</> : "Yes, delete demo data"}
              </button>
              <button
                onClick={() => setStep("idle")}
                disabled={loading}
                className="text-xs px-4 py-2 rounded-lg font-semibold"
                style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8" }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </div>
        )}
        {result && step === "done" && <ResultLog result={result} />}

        {/* Undo: re-seed after demo clear */}
        {step === "done" && result && (
          <UndoReseed />
        )}
      </div>
    </div>
  );
}

// ── Undo helper shown after demo clear ───────────────────────────────────────

function UndoReseed() {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);

  async function reseed() {
    setLoading(true);
    await fetch("/api/dev/seed", { method: "POST" });
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <p className="mt-3 text-xs flex items-center gap-1.5" style={{ color: "#34d399" }}>
        <CheckCircle className="w-3.5 h-3.5" /> Demo data restored.
      </p>
    );
  }

  return (
    <button
      onClick={reseed}
      disabled={loading}
      className="mt-3 inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
      style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Undo2 className="w-3.5 h-3.5" />}
      {loading ? "Restoring..." : "Undo — re-add demo data"}
    </button>
  );
}

// ── Type-to-confirm nuclear card (high risk: clear everything) ────────────────

function NuclearCard() {
  const [step, setStep]         = useState<"idle" | "confirm" | "done">("idle");
  const [typed, setTyped]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<ActionResult | null>(null);
  const [error, setError]       = useState("");
  const inputRef                = useRef<HTMLInputElement>(null);
  const REQUIRED                = "DELETE ALL";
  const matches                 = typed.trim().toUpperCase() === REQUIRED;

  function openConfirm() {
    setStep("confirm");
    setTyped("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  async function run() {
    if (!matches) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dev/clear", { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      const data = await res.json();
      setResult(data);
      setStep("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
      setStep("idle");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl overflow-hidden"
      style={{
        border: step === "confirm" ? "1px solid rgba(248,113,113,0.5)" : "1px solid rgba(248,113,113,0.2)",
        background: "rgba(255,255,255,0.015)",
      }}>
      <div className="p-5">
        {/* Title + idle button */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>Clear Everything</p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "rgba(248,113,113,0.6)" }}>
              Permanently deletes ALL clients, pilots, jobs, invoices, contracts, and leads.
              Your admin login is preserved. <strong style={{ color: "#f87171" }}>This cannot be undone.</strong>
            </p>
          </div>
          {step === "idle" && (
            <button
              onClick={openConfirm}
              className="flex-shrink-0 inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-bold"
              style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.35)", color: "#f87171" }}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> Delete All Data
            </button>
          )}
        </div>

        {/* Step 2: type-to-confirm */}
        {step === "confirm" && (
          <div className="mt-4 rounded-lg p-4"
            style={{ background: "rgba(248,113,113,0.05)", border: "1px solid rgba(248,113,113,0.3)" }}>
            <p className="text-sm font-bold mb-1" style={{ color: "#f87171" }}>
              Final warning — this will wipe everything
            </p>
            <p className="text-xs mb-4 leading-relaxed" style={{ color: "#94a3b8" }}>
              All clients, pilots, jobs, invoices, contracts, and leads will be permanently deleted.
              Your admin accounts are safe. There is no automatic backup — if you have real data you want to keep,
              export it from the Integrations page first.
            </p>
            <p className="text-xs mb-2" style={{ color: "#94a3b8" }}>
              Type <code style={{ color: "#f87171", background: "rgba(248,113,113,0.1)", padding: "0 4px", borderRadius: 3 }}>DELETE ALL</code> to confirm:
            </p>
            <input
              ref={inputRef}
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && matches && run()}
              placeholder="Type DELETE ALL"
              className="w-full text-xs px-3 py-2 rounded-lg font-mono outline-none mb-4"
              style={{
                background: "rgba(0,0,0,0.4)",
                border: `1px solid ${matches ? "rgba(248,113,113,0.6)" : "rgba(148,163,184,0.2)"}`,
                color: matches ? "#f87171" : "#d8e8f4",
              }}
            />
            <div className="flex gap-2">
              <button
                onClick={run}
                disabled={!matches || loading}
                className="inline-flex items-center gap-1.5 text-xs px-4 py-2 rounded-lg font-bold disabled:opacity-40"
                style={{ background: "rgba(248,113,113,0.15)", border: "1px solid rgba(248,113,113,0.5)", color: "#f87171" }}
              >
                {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Deleting...</> : <><Trash2 className="w-3.5 h-3.5" /> Confirm Delete All</>}
              </button>
              <button
                onClick={() => { setStep("idle"); setTyped(""); }}
                disabled={loading}
                className="text-xs px-4 py-2 rounded-lg font-semibold"
                style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8" }}
              >
                Cancel — keep my data
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs px-3 py-2 rounded-lg"
            style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
            <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
          </div>
        )}
        {result && step === "done" && <ResultLog result={result} />}
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
        <h1 className="text-2xl font-black" style={{ color: "#d8e8f4" }}>Developer Tools</h1>
        <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.38)" }}>
          Seed demo data for testing or clean the database for a fresh start
        </p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-xl p-4"
        style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.2)" }}>
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

          <TwoStepCard
            title="Remove Demo Data Only"
            description="Deletes all records tagged [DEMO] and users with @test.local emails. Your real data is untouched. You can re-add demo data at any time."
            buttonLabel="Clear Demo Data"
            confirmDescription="This will delete all demo clients, pilots, jobs, invoices, and contracts (anything tagged [DEMO] or using @test.local emails). Your real data will NOT be touched. You can undo this by clicking 'Re-add demo data' afterward."
            onAction={async () => {
              const res = await fetch("/api/dev/clear?mode=demo", { method: "DELETE" });
              if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
              return res.json();
            }}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(248,113,113,0.15)" }}>
        <div style={{ ...sectionHeader, background: "rgba(248,113,113,0.04)", borderBottom: "1px solid rgba(248,113,113,0.1)" }}>
          <p className="text-xs font-bold uppercase tracking-widest flex items-center gap-2" style={{ color: "rgba(248,113,113,0.7)" }}>
            <Trash2 className="w-3.5 h-3.5" /> Danger Zone
          </p>
        </div>
        <div className="p-5">
          <NuclearCard />
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
                desc: "Clean code branch. Both branches share the same live database — changing the Vercel deployment branch doesn't affect your data, only which version of the app is live.",
              },
            ].map((b) => (
              <div key={b.name} className="rounded-lg p-3.5"
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
            <p className="mt-2" style={{ color: "#94a3b8" }}>Then in Vercel → Project Settings → Git → set Production Branch to <code style={{ color: "#00d4ff" }}>production</code>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
