"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target } from "lucide-react";

const STATUS_OPTIONS = [
  "NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT", "NEGOTIATING",
];
const SOURCE_OPTIONS = [
  { value: "REFERRAL",      label: "Referral" },
  { value: "WEBSITE",       label: "Website" },
  { value: "SOCIAL_MEDIA",  label: "Social Media" },
  { value: "COLD_OUTREACH", label: "Cold Outreach" },
  { value: "REPEAT_CLIENT", label: "Repeat Client" },
  { value: "TRADE_SHOW",    label: "Trade Show" },
  { value: "OTHER",         label: "Other" },
];

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    companyName: "", contactName: "", email: "", phone: "",
    status: "NEW", source: "WEBSITE", value: "", notes: "", nextFollowUp: "",
  });

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          value: form.value ? parseFloat(form.value) : null,
          nextFollowUp: form.nextFollowUp || null,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.push("/admin/leads");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    background: "rgba(0,212,255,0.04)",
    border: "1px solid rgba(0,212,255,0.15)",
    color: "#d8e8f4",
    borderRadius: 8,
    padding: "9px 12px",
    width: "100%",
    fontSize: 13,
    outline: "none",
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/leads" style={{ color: "rgba(0,212,255,0.5)" }} className="hover:text-cyan-400 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1
            className="text-2xl font-black tracking-wide"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #fbbf24 60%, #f97316 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            New Lead
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>Add a prospect to the pipeline</p>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl p-6 space-y-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.08)" }}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Company + Contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-cyan mb-1.5 block">Company Name *</label>
              <input style={inputStyle} value={form.companyName} onChange={(e) => set("companyName", e.target.value)} required placeholder="Acme Properties LLC" />
            </div>
            <div>
              <label className="label-cyan mb-1.5 block">Contact Name *</label>
              <input style={inputStyle} value={form.contactName} onChange={(e) => set("contactName", e.target.value)} required placeholder="John Smith" />
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-cyan mb-1.5 block">Email</label>
              <input style={inputStyle} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="john@acme.com" />
            </div>
            <div>
              <label className="label-cyan mb-1.5 block">Phone</label>
              <input style={inputStyle} type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 000-0000" />
            </div>
          </div>

          {/* Status + Source + Value */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label-cyan mb-1.5 block">Pipeline Stage</label>
              <select style={inputStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} style={{ background: "#04080f" }}>{s.replace("_", " ")}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-cyan mb-1.5 block">Lead Source</label>
              <select style={inputStyle} value={form.source} onChange={(e) => set("source", e.target.value)}>
                {SOURCE_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value} style={{ background: "#04080f" }}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-cyan mb-1.5 block">Est. Value ($)</label>
              <input style={inputStyle} type="number" min="0" step="100" value={form.value} onChange={(e) => set("value", e.target.value)} placeholder="2500" />
            </div>
          </div>

          {/* Next follow-up */}
          <div>
            <label className="label-cyan mb-1.5 block">Next Follow-Up Date</label>
            <input style={inputStyle} type="date" value={form.nextFollowUp} onChange={(e) => set("nextFollowUp", e.target.value)} />
          </div>

          {/* Notes */}
          <div>
            <label className="label-cyan mb-1.5 block">Notes</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 96 }}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Real estate developer interested in aerial photography for 3 properties..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all"
              style={{ background: loading ? "rgba(251,191,36,0.06)" : "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.3)", color: "#fbbf24", opacity: loading ? 0.7 : 1 }}
            >
              <Target className="w-4 h-4" />
              {loading ? "Adding Lead..." : "Add to Pipeline"}
            </button>
            <Link href="/admin/leads">
              <button
                type="button"
                className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "transparent", border: "1px solid rgba(0,212,255,0.15)", color: "rgba(0,212,255,0.5)" }}
              >
                Cancel
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
