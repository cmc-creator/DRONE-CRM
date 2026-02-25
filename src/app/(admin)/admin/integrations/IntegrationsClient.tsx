"use client";

import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download, Upload, FileText, Users, Building2, FileSignature,
  HardDrive, CheckCircle, XCircle, AlertCircle, ExternalLink,
  Copy, ChevronDown, ChevronRight, RefreshCw, Plug,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ImportResult {
  created: number;
  skipped: number;
  results: { row: number; status: "created" | "skipped"; reason?: string; email?: string; company?: string; invoiceNumber?: string }[];
}

interface Props { gdriveConnected: boolean }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
      style={ok
        ? { background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.25)" }
        : { background: "rgba(248,113,113,0.1)", color: "#f87171", border: "1px solid rgba(248,113,113,0.2)" }
      }
    >
      {ok ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {label}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-sm font-black uppercase tracking-widest mb-4"
      style={{ color: "rgba(0,212,255,0.6)" }}
    >
      {children}
    </h2>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl p-5 ${className}`}
      style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(0,212,255,0.1)" }}
    >
      {children}
    </div>
  );
}

function CodeBox({ children }: { children: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div
      className="relative rounded-lg p-3 text-xs font-mono mt-2"
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,212,255,0.15)", color: "#94a3b8" }}
    >
      {children}
      <button
        onClick={() => { navigator.clipboard.writeText(children); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
        className="absolute right-2 top-2 p-1 rounded hover:opacity-80 transition-opacity"
        style={{ color: copied ? "#34d399" : "rgba(0,212,255,0.5)" }}
      >
        {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

// ─── Import card with file upload + results ──────────────────────────────────

function ImportCard({
  label, icon: Icon, endpoint, templateEndpoint, entityColor,
}: {
  label: string;
  icon: React.ElementType;
  endpoint: string;
  templateEndpoint?: string;
  entityColor: string;
}) {
  const [result, setResult]     = useState<ImportResult | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [open, setOpen]         = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    setError("");
    setResult(null);

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch(endpoint, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Import failed"); return; }
      setResult(data);
      setOpen(true);
    } catch {
      setError("Network error — please try again");
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [endpoint]);

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${entityColor}15` }}>
          <Icon className="w-4.5 h-4.5" style={{ color: entityColor }} />
        </div>
        <div>
          <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>{label}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Export */}
        <a
          href={`/api/export/${endpoint.split("/import/")[1]}`}
          download
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
          style={{ background: `${entityColor}12`, border: `1px solid ${entityColor}30`, color: entityColor }}
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </a>

        {/* Template */}
        {templateEndpoint && (
          <a
            href={templateEndpoint}
            download
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={{ background: "rgba(148,163,184,0.08)", border: "1px solid rgba(148,163,184,0.2)", color: "#94a3b8" }}
          >
            <FileText className="w-3.5 h-3.5" /> Template
          </a>
        )}

        {/* Import trigger */}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all disabled:opacity-50"
          style={{ background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}
        >
          {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {loading ? "Importing…" : "Import CSV"}
        </button>

        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
      </div>

      {error && (
        <div className="mt-3 text-xs px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </div>
      )}

      {result && (
        <div className="mt-3 rounded-lg overflow-hidden" style={{ border: "1px solid rgba(0,212,255,0.1)" }}>
          <button
            className="w-full flex items-center justify-between px-3 py-2 text-xs"
            style={{ background: "rgba(0,0,0,0.2)", color: "#94a3b8" }}
            onClick={() => setOpen(!open)}
          >
            <span>
              <span style={{ color: "#34d399" }}>{result.created} imported</span>
              {result.skipped > 0 && <span style={{ color: "#f87171" }}> · {result.skipped} skipped</span>}
            </span>
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          {open && (
            <div className="max-h-40 overflow-y-auto">
              {result.results.map((r, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-1.5 text-xs border-t"
                  style={{ borderColor: "rgba(0,212,255,0.06)", color: r.status === "created" ? "#34d399" : "#f87171" }}>
                  <span className="w-4 opacity-50">#{r.row}</span>
                  <span className="flex-1 truncate">{r.email ?? r.company ?? r.invoiceNumber}</span>
                  <span>{r.status === "skipped" ? r.reason : "✓"}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function IntegrationsClient({ gdriveConnected }: Props) {
  const searchParams  = useSearchParams();
  const gdriveStatus  = searchParams.get("gdrive");

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1
          className="text-2xl font-black tracking-wide"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 60%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Integrations &amp; Data
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
          Import / export data, connect Google Drive, Adobe Sign, and Wix Invoicing
        </p>
      </div>

      {/* Google Drive OAuth result toast */}
      {gdriveStatus === "connected" && (
        <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
          style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)", color: "#34d399" }}>
          <CheckCircle className="w-4 h-4" /> Google Drive connected successfully!
        </div>
      )}
      {gdriveStatus === "error" && (
        <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
          style={{ background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}>
          <XCircle className="w-4 h-4" /> Google Drive connection failed: {searchParams.get("msg") ?? "unknown error"}
        </div>
      )}

      {/* ── Data Import & Export ─────────────────────────────────────────── */}
      <section>
        <SectionTitle>Data Import &amp; Export</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <ImportCard
            label="Invoices"
            icon={FileText}
            endpoint="/api/import/invoices"
            templateEndpoint="/api/import/invoices"
            entityColor="#00d4ff"
          />

          <ImportCard
            label="Clients"
            icon={Building2}
            endpoint="/api/import/clients"
            templateEndpoint="/api/import/clients"
            entityColor="#a78bfa"
          />

          <ImportCard
            label="Pilot Network (Batch)"
            icon={Users}
            endpoint="/api/import/pilots"
            templateEndpoint="/api/import/pilots"
            entityColor="#fbbf24"
          />

          {/* Contracts — export only (importing contract bodies is text-heavy) */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(248,113,113,0.1)" }}>
                <FileSignature className="w-4.5 h-4.5" style={{ color: "#f87171" }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>Contracts</p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>
                  Export roster — Adobe Sign handles signing workflows
                </p>
              </div>
            </div>
            <a
              href="/api/export/contracts"
              download
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#f87171" }}
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </a>
          </Card>
        </div>
      </section>

      {/* ── Google Drive ─────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Google Drive</SectionTitle>
        <Card>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(66,133,244,0.12)", border: "1px solid rgba(66,133,244,0.2)" }}>
                <HardDrive className="w-5 h-5" style={{ color: "#4285F4" }} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>Google Drive</p>
                  <StatusBadge ok={gdriveConnected} label={gdriveConnected ? "Connected" : "Not connected"} />
                </div>
                <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>
                  Store and share drone footage, photos, and deliverables
                </p>
              </div>
            </div>
            <a
              href="/api/integrations/google-drive/auth"
              className="inline-flex items-center gap-2 text-sm px-4 py-2 rounded-lg font-semibold transition-all flex-shrink-0"
              style={{ background: "rgba(66,133,244,0.1)", border: "1px solid rgba(66,133,244,0.25)", color: "#4285F4" }}
            >
              <Plug className="w-4 h-4" />
              {gdriveConnected ? "Reconnect" : "Connect Drive"}
            </a>
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* What it does */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(0,212,255,0.5)" }}>
                What this enables
              </p>
              {[
                "Browse your Drive folders from within the CRM",
                "Upload deliverables directly to a shared client folder",
                "Store aerial footage and photos — Drive handles large files",
                "Share folder links with clients for instant delivery",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 mb-1.5">
                  <CheckCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#34d399" }} />
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Setup steps */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "rgba(0,212,255,0.5)" }}>
                Setup (one-time)
              </p>
              {[
                { step: "1", text: "Create a project in Google Cloud Console" },
                { step: "2", text: "Enable the Google Drive API" },
                { step: "3", text: "Create OAuth 2.0 credentials (Web application)" },
                { step: "4", text: "Add Authorized Redirect URI:" },
                { step: "5", text: "Set GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET in Vercel" },
              ].map((s) => (
                <div key={s.step} className="flex items-start gap-2 mb-1">
                  <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(66,133,244,0.2)", color: "#4285F4" }}>
                    {s.step}
                  </span>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{s.text}</p>
                </div>
              ))}
              <CodeBox>{`${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/integrations/google-drive/callback`}</CodeBox>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Adobe Acrobat Sign ───────────────────────────────────────────── */}
      <section>
        <SectionTitle>Adobe Acrobat Sign</SectionTitle>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(250,40,40,0.1)", border: "1px solid rgba(250,40,40,0.2)" }}>
              <FileSignature className="w-5 h-5" style={{ color: "#fa2828" }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>Adobe Acrobat Sign</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>
                Auto-update contracts to SIGNED when Adobe notifies us
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(0,212,255,0.5)" }}>
                Webhook URL — paste into Adobe Admin
              </p>
              <CodeBox>{`${typeof window !== "undefined" ? window.location.origin : "https://your-domain.com"}/api/webhooks/adobe-sign`}</CodeBox>
              <div className="mt-4 space-y-1.5">
                <p className="text-xs font-semibold" style={{ color: "#94a3b8" }}>Adobe Console → Webhooks → New Webhook:</p>
                {[
                  "Name: Lumin Aerial CRM",
                  "Scope: Account",
                  "URL: (above)",
                  "Events: AGREEMENT_ACTION_COMPLETED",
                ].map((s) => (
                  <div key={s} className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(0,212,255,0.3)" }} />
                    <p className="text-xs font-mono" style={{ color: "#94a3b8" }}>{s}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(0,212,255,0.5)" }}>
                How it works
              </p>
              {[
                "Create a contract in the CRM and send via Adobe Sign as usual",
                "When the document is signed, Adobe calls our webhook automatically",
                "The CRM finds the matching contract by name and marks it SIGNED",
                "Tip: add ADOBE:<agreementId> in the contract Notes field for exact matching",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 mb-2">
                  <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(250,40,40,0.15)", color: "#fa2828" }}>
                    {i + 1}
                  </span>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{item}</p>
                </div>
              ))}
              <a
                href="https://secure.adobesign.com/account/homePageContent"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs mt-2"
                style={{ color: "#fa2828" }}
              >
                Open Adobe Sign Console <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </Card>
      </section>

      {/* ── Wix Invoicing ────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Wix Invoicing</SectionTitle>
        <Card>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.2)" }}>
              <FileText className="w-5 h-5" style={{ color: "#fbbf24" }} />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>Wix Invoicing</p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>
                Import your existing Wix invoices into the CRM
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(0,212,255,0.5)" }}>
                Export from Wix
              </p>
              {[
                "Wix Dashboard → Invoices → ⋯ menu → Export",
                "Download the CSV file",
                "Upload it using the Invoices import card above",
                "Client matches are found by email or company name",
                "Unmatched clients are created automatically as stubs",
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-2 mb-1.5">
                  <span className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}>
                    {i + 1}
                  </span>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{s}</p>
                </div>
              ))}
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "rgba(0,212,255,0.5)" }}>
                Supported Wix columns
              </p>
              {[
                ["Invoice Number", "invoiceNumber"],
                ["Customer Name",  "companyName"],
                ["Customer Email", "email"],
                ["Issue Date",     "createdAt"],
                ["Due Date",       "dueDate"],
                ["Amount",         "totalAmount"],
                ["Tax",            "tax"],
                ["Status",         "status (PAID → PAID)"],
              ].map(([wix, crm]) => (
                <div key={wix} className="flex items-center gap-2 py-0.5">
                  <span className="text-xs font-mono w-36 flex-shrink-0" style={{ color: "#fbbf24" }}>{wix}</span>
                  <ChevronRight className="w-3 h-3 flex-shrink-0" style={{ color: "rgba(0,212,255,0.3)" }} />
                  <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>{crm}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* ── Google Workspace ────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Google Workspace</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: "Google Calendar",
              color: "#34d399",
              desc: "Sync job schedules to Google Calendar. Add GOOGLE_CALENDAR_ID to enable two-way sync.",
              href: "https://calendar.google.com",
              status: "Configurable",
            },
            {
              title: "Google Sheets",
              color: "#fbbf24",
              desc: "Download any CSV export above and open in Google Sheets for pivot tables and reporting.",
              href: null,
              status: "Via CSV Export",
            },
            {
              title: "Gmail",
              color: "#4285F4",
              desc: "Transactional emails (invoice receipts, contract links) use the Resend integration. Configure RESEND_API_KEY in Vercel.",
              href: null,
              status: "Via Resend",
            },
          ].map((g) => (
            <Card key={g.title}>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>{g.title}</p>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{ background: `${g.color}15`, color: g.color, border: `1px solid ${g.color}25` }}>
                  {g.status}
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#94a3b8" }}>{g.desc}</p>
              {g.href && (
                <a href={g.href} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs"
                  style={{ color: g.color }}>
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* ── Env Vars Checklist ───────────────────────────────────────────── */}
      <section>
        <SectionTitle>Environment Variables</SectionTitle>
        <Card>
          <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>
            Add these to your Vercel project settings → Environment Variables
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "GOOGLE_CLIENT_ID",          desc: "Google OAuth — Drive & Calendar" },
              { key: "GOOGLE_CLIENT_SECRET",       desc: "Google OAuth — Drive & Calendar" },
              { key: "ADOBE_SIGN_WEBHOOK_SECRET",  desc: "Adobe Sign webhook verification" },
              { key: "RESEND_API_KEY",             desc: "Transactional email (invoices, contracts)" },
              { key: "NEXTAUTH_SECRET",            desc: "NextAuth — already required" },
              { key: "DATABASE_URL",               desc: "PostgreSQL — Railway" },
            ].map((e) => (
              <div key={e.key} className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{ background: "rgba(0,0,0,0.25)", border: "1px solid rgba(0,212,255,0.07)" }}>
                <code className="text-xs font-mono flex-1" style={{ color: "#00d4ff" }}>{e.key}</code>
                <span className="text-xs" style={{ color: "rgba(0,212,255,0.3)" }}>{e.desc}</span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
