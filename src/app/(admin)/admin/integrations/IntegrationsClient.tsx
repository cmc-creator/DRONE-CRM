"use client";

import { useCallback, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle, Building2, ChevronDown, ChevronRight, CheckCircle,
  Download, ExternalLink, FileSignature, FileText, HardDrive,
  Plug, RefreshCw, Upload, Users, XCircle,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type ImportResult = {
  created: number;
  skipped: number;
  results: {
    row: number;
    email?: string;
    company?: string;
    invoiceNumber?: string;
    status: string;
    reason?: string;
  }[];
};

type Props = {
  gdriveConnected: boolean;
  oneDriveConnected: boolean;
};

// ─── Helper components ────────────────────────────────────────────────────────

function StatusBadge({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
      style={{
        background: ok ? "rgba(52,211,153,0.12)" : "rgba(148,163,184,0.1)",
        color: ok ? "#34d399" : "#94a3b8",
        border: `1px solid ${ok ? "rgba(52,211,153,0.25)" : "rgba(148,163,184,0.2)"}`,
      }}
    >
      {label}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-xs font-bold uppercase tracking-widest mb-4"
      style={{ color: "rgba(0,212,255,0.5)", letterSpacing: "0.12em" }}
    >
      {children}
    </h2>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        background: "rgba(10,20,40,0.6)",
        border: "1px solid rgba(0,212,255,0.08)",
        backdropFilter: "blur(8px)",
      }}
    >
      {children}
    </div>
  );
}

function CodeBox({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);
  const text = typeof children === "string" ? children : "";
  return (
    <div
      className="relative mt-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono overflow-x-auto"
      style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(0,212,255,0.12)", color: "#00d4ff" }}
    >
      <span className="flex-1 break-all">{children}</span>
      {text && (
        <button
          onClick={() => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-[10px] px-2 py-0.5 rounded flex-shrink-0"
          style={{ background: "rgba(0,212,255,0.1)", color: copied ? "#34d399" : "#00d4ff" }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      )}
    </div>
  );
}

function IntegrationCard({
  title,
  description,
  color,
  connected,
  connectHref,
  docsHref,
  children,
}: {
  title: string;
  description: string;
  color: string;
  connected?: boolean;
  connectHref?: string;
  docsHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>
              {title}
            </p>
            {connected !== undefined && (
              <StatusBadge
                ok={connected}
                label={connected ? "Connected" : "Not connected"}
              />
            )}
          </div>
          <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>
            {description}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {docsHref && (
            <a
              href={docsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{
                background: "rgba(148,163,184,0.07)",
                border: "1px solid rgba(148,163,184,0.15)",
                color: "#94a3b8",
              }}
            >
              Docs <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {connectHref && (
            <a
              href={connectHref}
              className="inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg font-semibold"
              style={{ background: `${color}12`, border: `1px solid ${color}30`, color }}
            >
              <Plug className="w-3.5 h-3.5" />
              {connected ? "Reconnect" : "Connect"}
            </a>
          )}
        </div>
      </div>
      {children}
    </Card>
  );
}

function ConfigField({
  label,
  envKey,
  placeholder,
}: {
  label: string;
  envKey: string;
  placeholder?: string;
}) {
  return (
    <div>
      <p
        className="text-[10px] font-semibold uppercase tracking-wider mb-1"
        style={{ color: "rgba(0,212,255,0.4)" }}
      >
        {label}
      </p>
      <div className="flex items-center gap-2">
        <code
          className="text-xs font-mono px-2 py-1.5 rounded-lg flex-1"
          style={{
            background: "rgba(0,0,0,0.3)",
            border: "1px solid rgba(0,212,255,0.1)",
            color: "#00d4ff",
          }}
        >
          {envKey}
        </code>
        {placeholder && (
          <span className="text-xs" style={{ color: "rgba(148,163,184,0.5)" }}>
            {placeholder}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Import/Export Card ───────────────────────────────────────────────────────

function ImportCard({
  label,
  icon: Icon,
  endpoint,
  templateEndpoint,
  entityColor,
  exportEndpoint,
  extraNote,
}: {
  label: string;
  icon: React.ElementType;
  endpoint: string;
  templateEndpoint?: string;
  entityColor: string;
  exportEndpoint?: string;
  extraNote?: string;
}) {
  const [result, setResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setLoading(true);
      setError("");
      setResult(null);
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch(endpoint, { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Import failed");
          return;
        }
        setResult(data);
        setOpen(true);
      } catch {
        setError("Network error — please try again");
      } finally {
        setLoading(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    },
    [endpoint]
  );

  return (
    <Card>
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${entityColor}15` }}
        >
          <Icon className="w-4.5 h-4.5" style={{ color: entityColor }} />
        </div>
        <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>
          {label}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={exportEndpoint ?? `/api/export/${endpoint.split("/import/")[1]}`}
          download
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
          style={{
            background: `${entityColor}12`,
            border: `1px solid ${entityColor}30`,
            color: entityColor,
          }}
        >
          <Download className="w-3.5 h-3.5" /> Export CSV
        </a>
        {templateEndpoint && (
          <a
            href={templateEndpoint}
            download
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold"
            style={{
              background: "rgba(148,163,184,0.08)",
              border: "1px solid rgba(148,163,184,0.2)",
              color: "#94a3b8",
            }}
          >
            <FileText className="w-3.5 h-3.5" /> Template
          </a>
        )}
        <button
          onClick={() => fileRef.current?.click()}
          disabled={loading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
          style={{
            background: "rgba(0,212,255,0.08)",
            border: "1px solid rgba(0,212,255,0.2)",
            color: "#00d4ff",
          }}
        >
          {loading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5" />
          )}
          {loading ? "Importing…" : "Import CSV"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
      </div>

      {extraNote && (
        <p className="mt-3 text-xs leading-relaxed" style={{ color: "rgba(0,212,255,0.35)" }}>
          {extraNote}
        </p>
      )}
      {error && (
        <div
          className="mt-3 text-xs px-3 py-2 rounded-lg flex items-center gap-2"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#f87171",
          }}
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {error}
        </div>
      )}
      {result && (
        <div
          className="mt-3 rounded-lg overflow-hidden"
          style={{ border: "1px solid rgba(0,212,255,0.1)" }}
        >
          <button
            className="w-full flex items-center justify-between px-3 py-2 text-xs"
            style={{ background: "rgba(0,0,0,0.2)", color: "#94a3b8" }}
            onClick={() => setOpen(!open)}
          >
            <span>
              <span style={{ color: "#34d399" }}>{result.created} imported</span>
              {result.skipped > 0 && (
                <span style={{ color: "#f87171" }}> · {result.skipped} skipped</span>
              )}
            </span>
            {open ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
          {open && (
            <div className="max-h-40 overflow-y-auto">
              {result.results.map((r, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs border-t"
                  style={{
                    borderColor: "rgba(0,212,255,0.06)",
                    color: r.status === "created" ? "#34d399" : "#f87171",
                  }}
                >
                  <span className="w-4 opacity-50">#{r.row}</span>
                  <span className="flex-1 truncate">
                    {r.email ?? r.company ?? r.invoiceNumber}
                  </span>
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

// ─── Main page ────────────────────────────────────────────────────────────────

export default function IntegrationsClient({ gdriveConnected, oneDriveConnected }: Props) {
  const searchParams = useSearchParams();
  const gdriveStatus = searchParams.get("gdrive");
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://your-domain.com";

  return (
    <div className="space-y-10 max-w-5xl">
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
          Connect your tools — cloud storage, e-signatures, Microsoft 365, communications,
          accounting, and automation
        </p>
      </div>

      {/* OAuth result toasts */}
      {gdriveStatus === "connected" && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
          style={{
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
            color: "#34d399",
          }}
        >
          <CheckCircle className="w-4 h-4" /> Google Drive connected successfully!
        </div>
      )}
      {gdriveStatus === "error" && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
          style={{
            background: "rgba(248,113,113,0.08)",
            border: "1px solid rgba(248,113,113,0.2)",
            color: "#f87171",
          }}
        >
          <XCircle className="w-4 h-4" /> Google Drive connection failed:{" "}
          {searchParams.get("msg") ?? "unknown error"}
        </div>
      )}
      {searchParams.get("onedrive") === "connected" && (
        <div
          className="flex items-center gap-2 text-sm px-4 py-3 rounded-lg"
          style={{
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.2)",
            color: "#34d399",
          }}
        >
          <CheckCircle className="w-4 h-4" /> Microsoft OneDrive connected successfully!
        </div>
      )}

      {/* ── Document Signing ─────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Document Signing</SectionTitle>
        <div className="space-y-4">

          {/* Adobe Acrobat Sign */}
          <IntegrationCard
            title="Adobe Acrobat Sign"
            description="Webhook-based auto-update — contracts marked SIGNED when Adobe notifies us"
            color="#fa2828"
            docsHref="https://secure.adobesign.com/account/homePageContent"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Webhook URL — paste into Adobe Admin
                </p>
                <CodeBox>{`${origin}/api/webhooks/adobe-sign`}</CodeBox>
                <div className="mt-3 space-y-1">
                  {[
                    "Name: NyxAerial CRM",
                    "Scope: Account",
                    "URL: (above)",
                    "Events: AGREEMENT_ACTION_COMPLETED",
                  ].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <ChevronRight
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: "rgba(0,212,255,0.3)" }}
                      />
                      <p className="text-xs font-mono" style={{ color: "#94a3b8" }}>
                        {s}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  How it works
                </p>
                {[
                  "Send contract via Adobe Sign as usual",
                  "Adobe calls our webhook when document is signed",
                  "CRM finds the contract and marks it SIGNED",
                  "Add ADOBE:<agreementId> in contract Notes for exact match",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(250,40,40,0.15)", color: "#fa2828" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </IntegrationCard>

          {/* DocuSign */}
          <IntegrationCard
            title="DocuSign"
            description="Auto-update contracts to SIGNED via DocuSign Connect webhook"
            color="#F5A623"
            docsHref="https://developers.docusign.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  DocuSign Connect Webhook URL
                </p>
                <CodeBox>{`${origin}/api/webhooks/docusign`}</CodeBox>
                <div className="mt-3 space-y-2">
                  <ConfigField
                    label="API Integration Key"
                    envKey="DOCUSIGN_INTEGRATION_KEY"
                    placeholder="Client ID from DocuSign Apps"
                  />
                  <ConfigField
                    label="Account ID"
                    envKey="DOCUSIGN_ACCOUNT_ID"
                    placeholder="Your DocuSign Account GUID"
                  />
                  <ConfigField
                    label="HMAC Secret"
                    envKey="DOCUSIGN_HMAC_SECRET"
                    placeholder="Connect webhook HMAC key"
                  />
                  <ConfigField
                    label="Base URL"
                    envKey="DOCUSIGN_BASE_URL"
                    placeholder="https://na4.docusign.net/restapi"
                  />
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  DocuSign Admin Setup
                </p>
                {[
                  "DocuSign Admin → Integrations → Connect",
                  "New Configuration → Custom",
                  "URL: (webhook URL above)",
                  "Trigger Events: Envelope Completed",
                  "Include: Envelope Data, Document Fields",
                  "Add DOCUSIGN:<envelopeId> to contract Notes",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(245,166,35,0.15)", color: "#F5A623" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </IntegrationCard>

          {/* PandaDoc */}
          <IntegrationCard
            title="PandaDoc"
            description="Auto-complete contracts when proposals are signed in PandaDoc"
            color="#34c89a"
            docsHref="https://developers.pandadoc.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Webhook URL
                </p>
                <CodeBox>{`${origin}/api/webhooks/pandadoc`}</CodeBox>
                <div className="mt-3 space-y-2">
                  <ConfigField
                    label="API Key"
                    envKey="PANDADOC_API_KEY"
                    placeholder="From PandaDoc → Settings → API"
                  />
                  <ConfigField
                    label="Webhook Secret"
                    envKey="PANDADOC_WEBHOOK_SECRET"
                    placeholder="Webhook signature secret"
                  />
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  PandaDoc Setup
                </p>
                {[
                  "PandaDoc → Settings → Integrations → Webhooks",
                  "Add endpoint URL (above)",
                  "Trigger: document.completed",
                  "Optionally subscribe to document.viewed, proposal.rejected",
                  "Add PANDADOC:<documentId> in contract Notes",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(52,200,154,0.15)", color: "#34c89a" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </IntegrationCard>
        </div>
      </section>

      {/* ── Cloud Storage ─────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Cloud Storage</SectionTitle>
        <div className="space-y-4">

          {/* Google Drive */}
          <IntegrationCard
            title="Google Drive"
            description="Store and share drone footage, photos, and deliverables from your Drive"
            color="#4285F4"
            connected={gdriveConnected}
            connectHref="/api/integrations/google-drive/auth"
            docsHref="https://console.cloud.google.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  What this enables
                </p>
                {[
                  "Browse Drive folders from within the CRM",
                  "Upload deliverables to shared client folders",
                  "Store aerial footage — Drive handles large files",
                  "Share folder links with clients for instant delivery",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: "#34d399" }}
                    />
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  OAuth Redirect URI
                </p>
                <CodeBox>{`${origin}/api/integrations/google-drive/callback`}</CodeBox>
                <div className="mt-3 space-y-2">
                  <ConfigField label="Client ID" envKey="GOOGLE_CLIENT_ID" />
                  <ConfigField label="Client Secret" envKey="GOOGLE_CLIENT_SECRET" />
                </div>
              </div>
            </div>
          </IntegrationCard>

          {/* Microsoft OneDrive */}
          <IntegrationCard
            title="Microsoft OneDrive"
            description="Store deliverables in OneDrive — ideal for Microsoft 365 clients and enterprises"
            color="#0078D4"
            connected={oneDriveConnected}
            connectHref="/api/integrations/onedrive/auth"
            docsHref="https://portal.azure.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  What this enables
                </p>
                {[
                  "Upload deliverables directly to client OneDrive",
                  "Browse shared folders from within the CRM",
                  "Works with Business and Personal accounts",
                  "Integrates with SharePoint document libraries",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: "#34d399" }}
                    />
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  OAuth Redirect URI
                </p>
                <CodeBox>{`${origin}/api/integrations/onedrive/callback`}</CodeBox>
                <div className="mt-3 space-y-2">
                  <ConfigField
                    label="Azure App Client ID"
                    envKey="MICROSOFT_CLIENT_ID"
                    placeholder="From Azure App Registration"
                  />
                  <ConfigField
                    label="Azure App Client Secret"
                    envKey="MICROSOFT_CLIENT_SECRET"
                    placeholder="Secret created in Azure portal"
                  />
                  <ConfigField
                    label="Tenant ID"
                    envKey="MICROSOFT_TENANT_ID"
                    placeholder="common  OR  your-tenant-guid"
                  />
                </div>
              </div>
            </div>
          </IntegrationCard>

          {/* Dropbox */}
          <IntegrationCard
            title="Dropbox"
            description="OAuth-based deliverable storage and sharing via Dropbox Business"
            color="#0061FF"
            docsHref="https://www.dropbox.com/developers"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Setup
                </p>
                {[
                  "Create an app at dropbox.com/developers",
                  "Set redirect URI to the URL below",
                  "Copy App Key and App Secret to env vars",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(0,97,255,0.15)", color: "#0061FF" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
                <CodeBox>{`${origin}/api/integrations/dropbox/callback`}</CodeBox>
              </div>
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Env Vars
                </p>
                <ConfigField label="App Key" envKey="DROPBOX_APP_KEY" />
                <ConfigField label="App Secret" envKey="DROPBOX_APP_SECRET" />
              </div>
            </div>
          </IntegrationCard>

          {/* Box */}
          <IntegrationCard
            title="Box"
            description="Enterprise cloud storage — popular with media agencies and construction firms"
            color="#0061D5"
            docsHref="https://developer.box.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  OAuth Redirect URI
                </p>
                <CodeBox>{`${origin}/api/integrations/box/callback`}</CodeBox>
              </div>
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Env Vars
                </p>
                <ConfigField label="Client ID" envKey="BOX_CLIENT_ID" />
                <ConfigField label="Client Secret" envKey="BOX_CLIENT_SECRET" />
              </div>
            </div>
          </IntegrationCard>

          {/* Amazon S3 / Cloudflare R2 */}
          <IntegrationCard
            title="Amazon S3 / Cloudflare R2"
            description="Self-hosted file storage — deliverables and drone footage at scale with zero CDN limits"
            color="#FF9900"
            docsHref="https://aws.amazon.com/s3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Env Vars
                </p>
                <ConfigField label="Access Key ID" envKey="S3_ACCESS_KEY_ID" />
                <ConfigField label="Secret Access Key" envKey="S3_SECRET_ACCESS_KEY" />
                <ConfigField
                  label="Bucket Name"
                  envKey="S3_BUCKET"
                  placeholder="your-bucket-name"
                />
                <ConfigField
                  label="Region"
                  envKey="S3_REGION"
                  placeholder="us-east-1"
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Cloudflare R2 (optional override)
                </p>
                <ConfigField
                  label="Endpoint"
                  envKey="S3_ENDPOINT"
                  placeholder="https://xxx.r2.cloudflarestorage.com"
                />
                <p className="text-xs mt-3" style={{ color: "#94a3b8" }}>
                  R2 is S3-compatible with zero egress fees — ideal for large drone video
                  deliverables. Leave <code style={{ color: "#00d4ff" }}>S3_ENDPOINT</code> empty
                  to use standard AWS S3.
                </p>
              </div>
            </div>
          </IntegrationCard>
        </div>
      </section>

      {/* ── Microsoft 365 ─────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Microsoft 365</SectionTitle>
        <div className="space-y-4">

          {/* SharePoint */}
          <IntegrationCard
            title="SharePoint"
            description="Sync contracts and deliverables to SharePoint document libraries"
            color="#038387"
            docsHref="https://learn.microsoft.com/en-us/sharepoint/dev/"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Configuration
                </p>
                <ConfigField
                  label="Azure Client ID"
                  envKey="MICROSOFT_CLIENT_ID"
                  placeholder="Shared with OneDrive"
                />
                <ConfigField label="Azure Client Secret" envKey="MICROSOFT_CLIENT_SECRET" />
                <ConfigField label="Tenant ID" envKey="MICROSOFT_TENANT_ID" />
                <ConfigField
                  label="SharePoint Site URL"
                  envKey="SHAREPOINT_SITE_URL"
                  placeholder="https://contoso.sharepoint.com/sites/drone"
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  What it enables
                </p>
                {[
                  "Upload signed contracts to a SharePoint library",
                  "Organize deliverables by client in document libraries",
                  "Browse and link SharePoint folders from job cards",
                  "Sync job metadata as SharePoint list items",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: "#34d399" }}
                    />
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </IntegrationCard>

          {/* Microsoft Teams */}
          <IntegrationCard
            title="Microsoft Teams"
            description="Push job assignments, status updates, and alerts to Teams channels"
            color="#5B5FC7"
            docsHref="https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Teams Incoming Webhook Setup
                </p>
                {[
                  "In Teams: open channel → ⋯ → Connectors",
                  "Search for Incoming Webhook → Configure",
                  "Name it NyxAerial CRM, optionally upload logo",
                  "Copy the generated webhook URL",
                  "Paste into TEAMS_WEBHOOK_URL env var",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(91,95,199,0.2)", color: "#5B5FC7" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Env Var
                </p>
                <ConfigField
                  label="Webhook URL"
                  envKey="TEAMS_WEBHOOK_URL"
                  placeholder="https://xxx.webhook.office.com/..."
                />
                <p className="text-xs mt-3" style={{ color: "#94a3b8" }}>
                  Notifications fire for: new job dispatch, status changes, overdue invoices,
                  new quote submitted, and compliance expiring within 30 days.
                </p>
              </div>
            </div>
          </IntegrationCard>

          {/* Outlook / Graph API */}
          <IntegrationCard
            title="Outlook / Microsoft Graph Email"
            description="Send transactional emails from your own Outlook or Exchange mailbox via Graph API"
            color="#0F78D4"
            docsHref="https://learn.microsoft.com/en-us/graph/api/user-sendmail"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Env Vars
                </p>
                <ConfigField label="Azure Client ID" envKey="MICROSOFT_CLIENT_ID" />
                <ConfigField label="Azure Client Secret" envKey="MICROSOFT_CLIENT_SECRET" />
                <ConfigField label="Tenant ID" envKey="MICROSOFT_TENANT_ID" />
                <ConfigField
                  label="Send-From Address"
                  envKey="OUTLOOK_SENDER_EMAIL"
                  placeholder="ops@yourdomain.com"
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Azure App Permissions Required
                </p>
                {[
                  "Mail.Send (Application permission)",
                  "User.Read (Delegated permission)",
                  "Azure → App Registrations → API Permissions",
                  "Grant admin consent for your tenant",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(15,120,212,0.15)", color: "#0F78D4" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </IntegrationCard>

          {/* Azure AD SSO */}
          <IntegrationCard
            title="Azure Active Directory / Entra ID"
            description="Enterprise SSO — let your team log in with their Microsoft 365 credentials"
            color="#0078D4"
            docsHref="https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Azure App Redirect URI
                </p>
                <CodeBox>{`${origin}/api/auth/callback/azure-ad`}</CodeBox>
                <div className="mt-3 space-y-2">
                  <ConfigField label="Azure Client ID" envKey="MICROSOFT_CLIENT_ID" />
                  <ConfigField label="Azure Client Secret" envKey="MICROSOFT_CLIENT_SECRET" />
                  <ConfigField
                    label="Tenant ID"
                    envKey="MICROSOFT_TENANT_ID"
                    placeholder="contoso.onmicrosoft.com or GUID"
                  />
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  NextAuth Setup
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  Add the Azure AD provider to your NextAuth config and set the env vars. Users
                  log in with their work Microsoft account; roles are mapped by Entra group
                  membership.
                </p>
                <a
                  href="https://next-auth.js.org/providers/azure-ad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs mt-3"
                  style={{ color: "#0078D4" }}
                >
                  NextAuth Azure AD docs <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </IntegrationCard>
        </div>
      </section>

      {/* ── Google Workspace ──────────────────────────────────────────────── */}
      <section>
        <SectionTitle>Google Workspace</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Google Calendar",
              color: "#34d399",
              desc: "Sync job schedules to Google Calendar. Set GOOGLE_CALENDAR_ID to enable two-way sync.",
              href: "https://calendar.google.com",
              status: "Configurable",
            },
            {
              title: "Google Maps",
              color: "#FF6B35",
              desc: "Job location maps and pilot proximity search. Set NEXT_PUBLIC_GOOGLE_MAPS_KEY for production use.",
              href: null,
              status: "Built-in",
            },
            {
              title: "Google Sheets",
              color: "#fbbf24",
              desc: "Download any CSV export and open in Google Sheets for pivot tables, reporting, and sharing.",
              href: null,
              status: "Via CSV Export",
            },
            {
              title: "Gmail",
              color: "#4285F4",
              desc: "Transactional emails use Resend by default. Configure RESEND_API_KEY in Vercel env vars.",
              href: null,
              status: "Via Resend",
            },
            {
              title: "Google Analytics",
              color: "#E37400",
              desc: "Track client portal usage and pricing page visits. Add NEXT_PUBLIC_GA_MEASUREMENT_ID.",
              href: "https://analytics.google.com",
              status: "Configurable",
            },
            {
              title: "Google Workspace SSO",
              color: "#34A853",
              desc: "Allow team sign-in with Google. Add GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET and enable the NextAuth Google provider.",
              href: null,
              status: "Configurable",
            },
          ].map((g) => (
            <Card key={g.title}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>
                  {g.title}
                </p>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: `${g.color}15`,
                    color: g.color,
                    border: `1px solid ${g.color}25`,
                  }}
                >
                  {g.status}
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-2" style={{ color: "#94a3b8" }}>
                {g.desc}
              </p>
              {g.href && (
                <a
                  href={g.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs"
                  style={{ color: g.color }}
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* ── Communication & Notifications ─────────────────────────────────── */}
      <section>
        <SectionTitle>Communication &amp; Notifications</SectionTitle>
        <div className="space-y-4">

          {/* Slack */}
          <IntegrationCard
            title="Slack"
            description="Push real-time notifications to any Slack channel — jobs, invoices, compliance alerts"
            color="#4A154B"
            docsHref="https://api.slack.com/messaging/webhooks"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Slack Incoming Webhook Setup
                </p>
                {[
                  "api.slack.com/apps → Create New App → From Scratch",
                  "Incoming Webhooks → Activate → Add to Workspace",
                  "Choose channel (e.g. #nyx-alerts)",
                  "Copy the Webhook URL",
                  "Paste into SLACK_WEBHOOK_URL env var",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(74,21,75,0.3)", color: "#E01E5A" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <ConfigField
                  label="Webhook URL"
                  envKey="SLACK_WEBHOOK_URL"
                  placeholder="https://hooks.slack.com/services/..."
                />
                <p className="text-xs mt-3" style={{ color: "#94a3b8" }}>
                  Fires for: new job dispatch, status changes, overdue invoices, new quote
                  submitted, compliance expiring within 30 days.
                </p>
              </div>
            </div>
          </IntegrationCard>

          {/* Twilio SMS */}
          <IntegrationCard
            title="Twilio SMS"
            description="Text pilots and clients when jobs are assigned, confirmed, or completed"
            color="#F22F46"
            docsHref="https://console.twilio.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Env Vars
                </p>
                <ConfigField label="Account SID" envKey="TWILIO_ACCOUNT_SID" />
                <ConfigField label="Auth Token" envKey="TWILIO_AUTH_TOKEN" />
                <ConfigField
                  label="From Number"
                  envKey="TWILIO_FROM_NUMBER"
                  placeholder="+12025551234"
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  SMS triggers
                </p>
                {[
                  "Pilot: job assignment with address and time",
                  "Pilot: job status change reminders",
                  "Client: deliverables ready notification",
                  "Admin: overdue payment alert",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: "#F22F46" }}
                    />
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </IntegrationCard>

          {/* SendGrid */}
          <IntegrationCard
            title="SendGrid"
            description="Alternative to Resend for transactional email — full marketing list and template support"
            color="#1A82E2"
            docsHref="https://sendgrid.com/docs"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ConfigField
                  label="API Key"
                  envKey="SENDGRID_API_KEY"
                  placeholder="SG.xxxxxxxxxx"
                />
                <ConfigField
                  label="From Email"
                  envKey="EMAIL_FROM"
                  placeholder="noreply@yourdomain.com"
                />
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Set SENDGRID_API_KEY and the email module automatically switches from Resend to
                SendGrid. Unsubscribe groups and marketing lists available via the SendGrid
                Marketing API.
              </p>
            </div>
          </IntegrationCard>

          {/* Mailchimp */}
          <IntegrationCard
            title="Mailchimp"
            description="Sync client contacts to Mailchimp audiences for email marketing campaigns"
            color="#FFE01B"
            docsHref="https://mailchimp.com/developer"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ConfigField
                  label="API Key"
                  envKey="MAILCHIMP_API_KEY"
                  placeholder="xxxxxxxx-us21"
                />
                <ConfigField label="Audience / List ID" envKey="MAILCHIMP_LIST_ID" />
                <ConfigField
                  label="Server Prefix"
                  envKey="MAILCHIMP_SERVER"
                  placeholder="us21"
                />
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                New leads and converted clients are automatically added to your Mailchimp
                audience. Tag them by lead source, service type, or market for segmented
                campaigns.
              </p>
            </div>
          </IntegrationCard>
        </div>
      </section>

      {/* ── Accounting & Finance ──────────────────────────────────────────── */}
      <section>
        <SectionTitle>Accounting &amp; Finance</SectionTitle>
        <div className="space-y-4">

          {/* Stripe */}
          <IntegrationCard
            title="Stripe"
            description="Payment processing — Checkout sessions, payment links, and webhook auto-sync"
            color="#6772E5"
            docsHref="https://dashboard.stripe.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Env Vars
                </p>
                <ConfigField label="Secret Key" envKey="STRIPE_SECRET_KEY" placeholder="sk_live_..." />
                <ConfigField
                  label="Publishable Key"
                  envKey="NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
                  placeholder="pk_live_..."
                />
                <ConfigField
                  label="Webhook Secret"
                  envKey="STRIPE_WEBHOOK_SECRET"
                  placeholder="whsec_..."
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Webhook URL
                </p>
                <CodeBox>{`${origin}/api/webhooks/stripe`}</CodeBox>
                <div className="mt-2 space-y-1">
                  {[
                    "checkout.session.completed",
                    "invoice.paid",
                    "invoice.payment_failed",
                  ].map((e) => (
                    <div key={e} className="flex items-center gap-2">
                      <ChevronRight
                        className="w-3 h-3"
                        style={{ color: "rgba(0,212,255,0.3)" }}
                      />
                      <code className="text-xs" style={{ color: "#94a3b8" }}>
                        {e}
                      </code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </IntegrationCard>

          {/* QuickBooks */}
          <IntegrationCard
            title="QuickBooks Online"
            description="Export invoices, clients, and pilot payouts to QuickBooks for your accountant"
            color="#2CA01C"
            docsHref="https://developer.intuit.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  OAuth Redirect URI
                </p>
                <CodeBox>{`${origin}/api/integrations/quickbooks/callback`}</CodeBox>
                <div className="mt-3 space-y-2">
                  <ConfigField label="Client ID" envKey="QUICKBOOKS_CLIENT_ID" />
                  <ConfigField label="Client Secret" envKey="QUICKBOOKS_CLIENT_SECRET" />
                  <ConfigField
                    label="Environment"
                    envKey="QUICKBOOKS_ENV"
                    placeholder="sandbox | production"
                  />
                </div>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Features
                </p>
                {[
                  "Sync invoices as QuickBooks Invoices",
                  "Map clients to QuickBooks Customers",
                  "Push pilot payouts as Vendor Bills",
                  "Reconcile payment status automatically",
                ].map((s) => (
                  <div key={s} className="flex items-start gap-2 mb-1.5">
                    <CheckCircle
                      className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                      style={{ color: "#34d399" }}
                    />
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </IntegrationCard>

          {/* FreshBooks */}
          <IntegrationCard
            title="FreshBooks"
            description="Alternative accounting for solo operators and small agencies"
            color="#0075DD"
            docsHref="https://www.freshbooks.com/api"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ConfigField label="Client ID" envKey="FRESHBOOKS_CLIENT_ID" />
                <ConfigField label="Client Secret" envKey="FRESHBOOKS_CLIENT_SECRET" />
                <p className="text-[10px]" style={{ color: "rgba(0,212,255,0.4)" }}>
                  Redirect URI
                </p>
                <CodeBox>{`${origin}/api/integrations/freshbooks/callback`}</CodeBox>
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Sync invoices, client records, and pilot expense reports to FreshBooks. Ideal for
                solo pilots using FreshBooks for personal tax prep.
              </p>
            </div>
          </IntegrationCard>

          {/* Xero */}
          <IntegrationCard
            title="Xero"
            description="Popular with UK and Australian drone operators — multi-currency invoice and contact sync"
            color="#13B5EA"
            docsHref="https://developer.xero.com"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ConfigField label="Client ID" envKey="XERO_CLIENT_ID" />
                <ConfigField label="Client Secret" envKey="XERO_CLIENT_SECRET" />
                <p className="text-[10px]" style={{ color: "rgba(0,212,255,0.4)" }}>
                  Redirect URI
                </p>
                <CodeBox>{`${origin}/api/integrations/xero/callback`}</CodeBox>
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Sync paid invoices, create Xero Contacts from CRM clients, push pilot payouts as
                Bills. Multi-currency support is ideal for international drone networks.
              </p>
            </div>
          </IntegrationCard>
        </div>
      </section>

      {/* ── Automation & Webhooks ─────────────────────────────────────────── */}
      <section>
        <SectionTitle>Automation &amp; Webhooks</SectionTitle>
        <div className="space-y-4">

          {/* Zapier */}
          <IntegrationCard
            title="Zapier"
            description="Connect any app via Zapier — trigger Zaps on new jobs, invoices, leads, and more"
            color="#FF4A00"
            docsHref="https://zapier.com/app/zaps"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Outbound (CRM → Zapier)
                </p>
                <ConfigField
                  label="Zapier Catch Hook URL"
                  envKey="ZAPIER_WEBHOOK_URL"
                  placeholder="https://hooks.zapier.com/hooks/catch/..."
                />
                <p className="text-xs mt-3" style={{ color: "#94a3b8" }}>
                  Build Zaps to create Airtable rows, send emails, update Google Sheets, or
                  trigger any of Zapier&apos;s 6,000+ apps.
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Inbound (Zapier → CRM)
                </p>
                <CodeBox>{`${origin}/api/webhooks/zapier`}</CodeBox>
                <div className="mt-3 space-y-2">
                  <ConfigField
                    label="Inbound Secret"
                    envKey="ZAPIER_INBOUND_SECRET"
                    placeholder="Random string for request verification"
                  />
                </div>
                <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>
                  Zapier can POST to the CRM to create leads, update job status, or import new
                  clients.
                </p>
              </div>
            </div>
          </IntegrationCard>

          {/* Make */}
          <IntegrationCard
            title="Make (Integromat)"
            description="Visual automation builder — more powerful than Zapier for complex drone workflows"
            color="#6D00CC"
            docsHref="https://www.make.com/en/integrations"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ConfigField
                  label="Make Webhook URL"
                  envKey="MAKE_WEBHOOK_URL"
                  placeholder="https://hook.eu1.make.com/..."
                />
                <p className="text-[10px]" style={{ color: "rgba(0,212,255,0.4)" }}>
                  Inbound URL
                </p>
                <CodeBox>{`${origin}/api/webhooks/make`}</CodeBox>
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Build multi-step automations: new job → create Google Drive folder → notify pilot
                via SMS → add calendar event → update Airtable tracker.
              </p>
            </div>
          </IntegrationCard>

          {/* Airtable */}
          <IntegrationCard
            title="Airtable"
            description="Mirror CRM data to Airtable for client-facing project tracking databases"
            color="#FCB400"
            docsHref="https://airtable.com/developers/web/api/introduction"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ConfigField label="Personal Access Token" envKey="AIRTABLE_TOKEN" />
                <ConfigField
                  label="Base ID"
                  envKey="AIRTABLE_BASE_ID"
                  placeholder="appXXXXXXXXXXXXXX"
                />
              </div>
              <p className="text-xs" style={{ color: "#94a3b8" }}>
                Sync jobs, clients, and pilots to Airtable for non-technical stakeholders.
                Clients with Airtable access get a live view of their projects without needing
                CRM accounts.
              </p>
            </div>
          </IntegrationCard>

          {/* Custom Webhooks */}
          <IntegrationCard
            title="Custom Webhooks"
            description="POST CRM events to any endpoint — build your own integrations or connect legacy systems"
            color="#00d4ff"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <ConfigField
                  label="Custom Webhook URL"
                  envKey="CUSTOM_WEBHOOK_URL"
                  placeholder="https://your-system.com/webhook"
                />
                <ConfigField
                  label="Webhook Secret"
                  envKey="CUSTOM_WEBHOOK_SECRET"
                  placeholder="Signs the X-Signature header"
                />
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Events fired
                </p>
                {[
                  "job.created",
                  "job.status_changed",
                  "invoice.paid",
                  "lead.converted",
                  "contract.signed",
                  "deliverable.uploaded",
                ].map((e) => (
                  <div key={e} className="flex items-center gap-2 mb-1">
                    <ChevronRight
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: "rgba(0,212,255,0.3)" }}
                    />
                    <code className="text-xs font-mono" style={{ color: "#00d4ff" }}>
                      {e}
                    </code>
                  </div>
                ))}
              </div>
            </div>
          </IntegrationCard>
        </div>
      </section>

      {/* ── CRM & Lead Capture ────────────────────────────────────────────── */}
      <section>
        <SectionTitle>CRM &amp; Lead Capture</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "HubSpot",
              color: "#FF7A59",
              desc: "Sync leads and clients to HubSpot CRM. New quote submissions automatically create HubSpot contacts and deals.",
              envKey: "HUBSPOT_API_KEY",
              envLabel: "Private App Token",
              docsHref: "https://developers.hubspot.com",
            },
            {
              title: "Salesforce",
              color: "#00A4EF",
              desc: "Push leads, accounts, and opportunities to Salesforce for enterprise client management.",
              envKey: "SALESFORCE_ACCESS_TOKEN",
              envLabel: "Connected App Token",
              docsHref: "https://developer.salesforce.com",
            },
            {
              title: "Typeform",
              color: "#262627",
              desc: "Receive Typeform form submissions as CRM leads via webhook. Embed quote forms on your site.",
              envKey: "TYPEFORM_WEBHOOK_SECRET",
              envLabel: "Webhook Secret",
              docsHref: "https://www.typeform.com/developers",
            },
            {
              title: "Webflow",
              color: "#4353FF",
              desc: "Pull Webflow CMS form submissions as leads. Ideal for agencies with Webflow-built client sites.",
              envKey: "WEBFLOW_API_TOKEN",
              envLabel: "API Token",
              docsHref: "https://developers.webflow.com",
            },
          ].map((g) => (
            <Card key={g.title}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>
                  {g.title}
                </p>
                <a
                  href={g.docsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs"
                  style={{ color: "rgba(148,163,184,0.5)" }}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#94a3b8" }}>
                {g.desc}
              </p>
              <ConfigField label={g.envLabel} envKey={g.envKey} />
            </Card>
          ))}
        </div>
      </section>

      {/* ── FAA & Airspace ────────────────────────────────────────────────── */}
      <section>
        <SectionTitle>FAA &amp; Airspace</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: "LAANC / FAA DroneZone",
              color: "#1D4ED8",
              desc: "Pull LAANC authorization status into job records. Add FAA DroneZone credentials to enable.",
              status: "Coming Soon",
              envKey: "FAA_DRONEZONE_API_KEY",
            },
            {
              title: "Aloft (SkyGrid)",
              color: "#7C3AED",
              desc: "Auto-request Aloft airspace authorizations from job location data. Preferred Partner credentials required.",
              status: "Coming Soon",
              envKey: "ALOFT_API_KEY",
            },
            {
              title: "AirMap",
              color: "#06B6D4",
              desc: "Show airspace class overlays on the job map view. Free tier available for non-commercial use.",
              status: "Configurable",
              envKey: "AIRMAP_API_KEY",
            },
            {
              title: "OpenAIP",
              color: "#10B981",
              desc: "Free global aeronautical data — airspace boundaries, NOTAMs, and restricted zones.",
              status: "Configurable",
              envKey: "OPENAIP_API_KEY",
            },
          ].map((g) => (
            <Card key={g.title}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>
                  {g.title}
                </p>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                  style={{
                    background: `${g.color}15`,
                    color: g.color,
                    border: `1px solid ${g.color}25`,
                  }}
                >
                  {g.status}
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: "#94a3b8" }}>
                {g.desc}
              </p>
              <ConfigField label="API Key" envKey={g.envKey} />
            </Card>
          ))}
        </div>
      </section>

      {/* ── Data Import & Export ──────────────────────────────────────────── */}
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
          <ImportCard
            label="Contracts"
            icon={FileSignature}
            endpoint="/api/contracts/import"
            templateEndpoint="/api/contracts/import"
            exportEndpoint="/api/export/contracts"
            entityColor="#f87171"
            extraNote="Import existing contracts as CSV. Download the template to see the exact column format. Document content can be pasted into each contract record after import."
          />
        </div>

        {/* Wix Invoicing Migration */}
        <div className="mt-4">
          <Card>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.2)",
                }}
              >
                <FileText className="w-5 h-5" style={{ color: "#fbbf24" }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#d8e8f4" }}>
                  Wix Invoicing Migration
                </p>
                <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.35)" }}>
                  Import your existing Wix invoices into the CRM
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                {[
                  "Wix Dashboard → Invoices → ⋯ menu → Export",
                  "Download the CSV file",
                  "Upload it using the Invoices import card above",
                  "Client matches found by email or company name",
                  "Unmatched clients are auto-created as stubs",
                ].map((s, i) => (
                  <div key={i} className="flex items-start gap-2 mb-1.5">
                    <span
                      className="text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "rgba(251,191,36,0.15)", color: "#fbbf24" }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs" style={{ color: "#94a3b8" }}>
                      {s}
                    </p>
                  </div>
                ))}
              </div>
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: "rgba(0,212,255,0.5)" }}
                >
                  Supported Wix columns
                </p>
                {[
                  ["Invoice Number", "invoiceNumber"],
                  ["Customer Name", "companyName"],
                  ["Customer Email", "email"],
                  ["Issue Date", "createdAt"],
                  ["Due Date", "dueDate"],
                  ["Amount", "totalAmount"],
                  ["Tax", "tax"],
                  ["Status", "status (PAID → PAID)"],
                ].map(([wix, crm]) => (
                  <div key={wix} className="flex items-center gap-2 py-0.5">
                    <span
                      className="text-xs font-mono w-36 flex-shrink-0"
                      style={{ color: "#fbbf24" }}
                    >
                      {wix}
                    </span>
                    <ChevronRight
                      className="w-3 h-3 flex-shrink-0"
                      style={{ color: "rgba(0,212,255,0.3)" }}
                    />
                    <span className="text-xs font-mono" style={{ color: "#94a3b8" }}>
                      {crm}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ── Environment Variables Checklist ───────────────────────────────── */}
      <section>
        <SectionTitle>Environment Variables Checklist</SectionTitle>
        <Card>
          <p className="text-xs mb-4" style={{ color: "#94a3b8" }}>
            Vercel → Project Settings → Environment Variables. Only add what you use — unused
            integrations are safely ignored.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              { key: "DATABASE_URL",                       desc: "PostgreSQL — Neon / Railway" },
              { key: "NEXTAUTH_SECRET",                    desc: "NextAuth session signing" },
              { key: "NEXTAUTH_URL",                       desc: "Production URL (required in prod)" },
              { key: "NEXT_PUBLIC_ORG_NAME",               desc: "Brand name (NyxAerial or custom)" },
              { key: "NEXT_PUBLIC_ORG_TAGLINE",            desc: "Tagline shown in sidebar" },
              { key: "NEXT_PUBLIC_ORG_WEBSITE",            desc: "Your website URL" },
              { key: "NEXT_PUBLIC_ORG_EMAIL",              desc: "Contact email in footers" },
              { key: "RESEND_API_KEY",                     desc: "Transactional email via Resend" },
              { key: "EMAIL_FROM",                         desc: "From address override" },
              { key: "STRIPE_SECRET_KEY",                  desc: "Stripe payments" },
              { key: "STRIPE_WEBHOOK_SECRET",              desc: "Stripe webhook signing" },
              { key: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", desc: "Stripe publishable key" },
              { key: "GOOGLE_CLIENT_ID",                   desc: "Google OAuth — Drive, Calendar, SSO" },
              { key: "GOOGLE_CLIENT_SECRET",               desc: "Google OAuth secret" },
              { key: "GOOGLE_CALENDAR_ID",                 desc: "Calendar sync (optional)" },
              { key: "NEXT_PUBLIC_GOOGLE_MAPS_KEY",        desc: "Maps SDK" },
              { key: "MICROSOFT_CLIENT_ID",                desc: "Azure App — OneDrive, Teams, SSO" },
              { key: "MICROSOFT_CLIENT_SECRET",            desc: "Azure App secret" },
              { key: "MICROSOFT_TENANT_ID",                desc: "common or tenant GUID" },
              { key: "SHAREPOINT_SITE_URL",                desc: "SharePoint site URL" },
              { key: "TEAMS_WEBHOOK_URL",                  desc: "Teams Incoming Webhook" },
              { key: "OUTLOOK_SENDER_EMAIL",               desc: "Send-from address via Graph" },
              { key: "ADOBE_SIGN_WEBHOOK_SECRET",          desc: "Adobe Sign webhook verification" },
              { key: "DOCUSIGN_INTEGRATION_KEY",           desc: "DocuSign API client ID" },
              { key: "DOCUSIGN_ACCOUNT_ID",                desc: "DocuSign Account GUID" },
              { key: "DOCUSIGN_HMAC_SECRET",               desc: "DocuSign Connect HMAC" },
              { key: "DOCUSIGN_BASE_URL",                  desc: "DocuSign REST API base URL" },
              { key: "PANDADOC_API_KEY",                   desc: "PandaDoc API key" },
              { key: "PANDADOC_WEBHOOK_SECRET",            desc: "PandaDoc webhook secret" },
              { key: "SLACK_WEBHOOK_URL",                  desc: "Slack Incoming Webhook" },
              { key: "TWILIO_ACCOUNT_SID",                 desc: "Twilio SMS" },
              { key: "TWILIO_AUTH_TOKEN",                  desc: "Twilio auth token" },
              { key: "TWILIO_FROM_NUMBER",                 desc: "Twilio sender number" },
              { key: "SENDGRID_API_KEY",                   desc: "SendGrid email (alt to Resend)" },
              { key: "MAILCHIMP_API_KEY",                  desc: "Mailchimp marketing" },
              { key: "MAILCHIMP_LIST_ID",                  desc: "Mailchimp audience ID" },
              { key: "S3_ACCESS_KEY_ID",                   desc: "S3 / R2 file storage" },
              { key: "S3_SECRET_ACCESS_KEY",               desc: "S3 / R2 secret" },
              { key: "S3_BUCKET",                          desc: "S3 bucket name" },
              { key: "S3_REGION",                          desc: "AWS region" },
              { key: "S3_ENDPOINT",                        desc: "Cloudflare R2 endpoint (optional)" },
              { key: "DROPBOX_APP_KEY",                    desc: "Dropbox OAuth" },
              { key: "DROPBOX_APP_SECRET",                 desc: "Dropbox OAuth secret" },
              { key: "BOX_CLIENT_ID",                      desc: "Box OAuth" },
              { key: "BOX_CLIENT_SECRET",                  desc: "Box OAuth secret" },
              { key: "QUICKBOOKS_CLIENT_ID",               desc: "QuickBooks OAuth" },
              { key: "QUICKBOOKS_CLIENT_SECRET",           desc: "QuickBooks OAuth secret" },
              { key: "XERO_CLIENT_ID",                     desc: "Xero OAuth" },
              { key: "XERO_CLIENT_SECRET",                 desc: "Xero OAuth secret" },
              { key: "ZAPIER_WEBHOOK_URL",                 desc: "Zapier Catch Hook URL" },
              { key: "ZAPIER_INBOUND_SECRET",              desc: "Zapier inbound verification" },
              { key: "MAKE_WEBHOOK_URL",                   desc: "Make (Integromat) webhook" },
              { key: "AIRTABLE_TOKEN",                     desc: "Airtable personal access token" },
              { key: "AIRTABLE_BASE_ID",                   desc: "Airtable base ID" },
              { key: "HUBSPOT_API_KEY",                    desc: "HubSpot CRM token" },
              { key: "CUSTOM_WEBHOOK_URL",                 desc: "Custom outbound webhook" },
              { key: "CUSTOM_WEBHOOK_SECRET",              desc: "Custom webhook signing secret" },
              { key: "AIRMAP_API_KEY",                     desc: "AirMap airspace data" },
              { key: "OPENAIP_API_KEY",                    desc: "OpenAIP airspace data" },
            ].map((e) => (
              <div
                key={e.key}
                className="flex items-center gap-3 px-3 py-2 rounded-lg"
                style={{
                  background: "rgba(0,0,0,0.25)",
                  border: "1px solid rgba(0,212,255,0.06)",
                }}
              >
                <code className="text-xs font-mono flex-1" style={{ color: "#00d4ff" }}>
                  {e.key}
                </code>
                <span className="text-[10px] text-right" style={{ color: "rgba(0,212,255,0.3)" }}>
                  {e.desc}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}
