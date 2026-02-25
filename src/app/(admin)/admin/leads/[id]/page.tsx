"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2, Plus, Phone, Mail, Calendar, MessageSquare } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NEW:           { label: "New",          color: "#94a3b8" },
  CONTACTED:     { label: "Contacted",    color: "#60a5fa" },
  QUALIFIED:     { label: "Qualified",    color: "#a78bfa" },
  PROPOSAL_SENT: { label: "Proposal Sent", color: "#fbbf24" },
  NEGOTIATING:   { label: "Negotiating", color: "#00d4ff" },
  WON:           { label: "Won",          color: "#34d399" },
  LOST:          { label: "Lost",         color: "#f87171" },
};

const STATUS_OPTIONS = Object.keys(STATUS_LABELS);
const SOURCE_OPTIONS = [
  { value: "REFERRAL",      label: "Referral" },
  { value: "WEBSITE",       label: "Website" },
  { value: "SOCIAL_MEDIA",  label: "Social Media" },
  { value: "COLD_OUTREACH", label: "Cold Outreach" },
  { value: "REPEAT_CLIENT", label: "Repeat Client" },
  { value: "TRADE_SHOW",    label: "Trade Show" },
  { value: "OTHER",         label: "Other" },
];
const ACTIVITY_TYPES = ["CALL", "EMAIL", "NOTE", "MEETING", "TASK", "QUOTE_SENT"];

type Lead = {
  id: string; companyName: string; contactName: string; email?: string; phone?: string;
  status: string; source?: string; value?: number; notes?: string; nextFollowUp?: string;
  activities: Array<{ id: string; type: string; title: string; body?: string; createdAt: string; completed: boolean }>;
};

export default function LeadDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [newActivity, setNewActivity] = useState({ type: "NOTE", title: "", body: "" });
  const [addingActivity, setAddingActivity] = useState(false);

  const fetchLead = useCallback(async () => {
    const res = await fetch(`/api/leads/${id}`);
    if (res.ok) setLead(await res.json());
  }, [id]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  async function handleSave() {
    if (!lead) return;
    setSaving(true);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: lead.companyName, contactName: lead.contactName, email: lead.email,
        phone: lead.phone, status: lead.status, source: lead.source,
        value: lead.value, notes: lead.notes, nextFollowUp: lead.nextFollowUp || null,
      }),
    });
    setSaving(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this lead permanently?")) return;
    setDeleting(true);
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    router.push("/admin/leads");
  }

  async function handleAddActivity() {
    if (!newActivity.title) return;
    setAddingActivity(true);
    await fetch("/api/activities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newActivity, leadId: id }),
    });
    setNewActivity({ type: "NOTE", title: "", body: "" });
    setAddingActivity(false);
    fetchLead();
  }

  if (!lead) return (
    <div className="flex items-center justify-center h-48" style={{ color: "rgba(0,212,255,0.3)" }}>
      Loading…
    </div>
  );

  const inputStyle = {
    background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.15)",
    color: "#d8e8f4", borderRadius: 8, padding: "9px 12px", width: "100%", fontSize: 13, outline: "none",
  };
  const statusMeta = STATUS_LABELS[lead.status] ?? STATUS_LABELS.NEW;

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/leads" style={{ color: "rgba(0,212,255,0.5)" }} className="hover:text-cyan-400 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black" style={{ color: "#d8e8f4" }}>{lead.companyName}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${statusMeta.color}15`, color: statusMeta.color, border: `1px solid ${statusMeta.color}30` }}>
                {statusMeta.label}
              </span>
              {lead.value && (
                <span className="text-xs font-semibold" style={{ color: "#00d4ff" }}>
                  ${lead.value.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all" style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.25)", color: "#00d4ff" }}>
            <Save className="w-3.5 h-3.5" />{saving ? "Saving…" : "Save"}
          </button>
          <button onClick={handleDelete} disabled={deleting} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)", color: "#f87171" }}>
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Left: lead fields */}
        <div className="lg:col-span-3 space-y-4 rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.08)" }}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-cyan mb-1 block">Company Name</label>
              <input style={inputStyle} value={lead.companyName} onChange={(e) => setLead({ ...lead, companyName: e.target.value })} />
            </div>
            <div>
              <label className="label-cyan mb-1 block">Contact Name</label>
              <input style={inputStyle} value={lead.contactName} onChange={(e) => setLead({ ...lead, contactName: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-cyan mb-1 block"><Mail className="w-3 h-3 inline mr-1" />Email</label>
              <input style={inputStyle} type="email" value={lead.email ?? ""} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
            </div>
            <div>
              <label className="label-cyan mb-1 block"><Phone className="w-3 h-3 inline mr-1" />Phone</label>
              <input style={inputStyle} type="tel" value={lead.phone ?? ""} onChange={(e) => setLead({ ...lead, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label-cyan mb-1 block">Stage</label>
              <select style={inputStyle} value={lead.status} onChange={(e) => setLead({ ...lead, status: e.target.value })}>
                {STATUS_OPTIONS.map((s) => <option key={s} value={s} style={{ background: "#04080f" }}>{STATUS_LABELS[s]?.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-cyan mb-1 block">Source</label>
              <select style={inputStyle} value={lead.source ?? "OTHER"} onChange={(e) => setLead({ ...lead, source: e.target.value })}>
                {SOURCE_OPTIONS.map((s) => <option key={s.value} value={s.value} style={{ background: "#04080f" }}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label-cyan mb-1 block">Est. Value ($)</label>
              <input style={inputStyle} type="number" value={lead.value ?? ""} onChange={(e) => setLead({ ...lead, value: parseFloat(e.target.value) || undefined })} />
            </div>
          </div>
          <div>
            <label className="label-cyan mb-1 block"><Calendar className="w-3 h-3 inline mr-1" />Next Follow-Up</label>
            <input style={inputStyle} type="date" value={lead.nextFollowUp?.slice(0,10) ?? ""} onChange={(e) => setLead({ ...lead, nextFollowUp: e.target.value })} />
          </div>
          <div>
            <label className="label-cyan mb-1 block">Notes</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 80 }} value={lead.notes ?? ""} onChange={(e) => setLead({ ...lead, notes: e.target.value })} />
          </div>
        </div>

        {/* Right: activity log */}
        <div className="lg:col-span-2 space-y-3">
          {/* Add activity */}
          <div className="rounded-xl p-4 space-y-3" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.08)" }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "rgba(0,212,255,0.5)" }}>Log Activity</p>
            <div className="flex gap-2">
              {ACTIVITY_TYPES.map((t) => (
                <button
                  key={t}
                  onClick={() => setNewActivity((a) => ({ ...a, type: t }))}
                  className="text-[10px] px-2 py-1 rounded-md font-semibold transition-all"
                  style={{
                    background: newActivity.type === t ? "rgba(0,212,255,0.15)" : "transparent",
                    border: `1px solid ${newActivity.type === t ? "rgba(0,212,255,0.4)" : "rgba(0,212,255,0.1)"}`,
                    color: newActivity.type === t ? "#00d4ff" : "rgba(0,212,255,0.4)",
                  }}
                >
                  {t.replace("_", " ")}
                </button>
              ))}
            </div>
            <input
              placeholder="Activity title…"
              style={{ ...inputStyle, marginBottom: 6 }}
              value={newActivity.title}
              onChange={(e) => setNewActivity((a) => ({ ...a, title: e.target.value }))}
            />
            <textarea
              placeholder="Details (optional)"
              style={{ ...inputStyle, resize: "vertical", minHeight: 60 }}
              value={newActivity.body}
              onChange={(e) => setNewActivity((a) => ({ ...a, body: e.target.value }))}
            />
            <button
              onClick={handleAddActivity}
              disabled={addingActivity || !newActivity.title}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold w-full justify-center transition-all"
              style={{ background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)", color: "#00d4ff" }}
            >
              <Plus className="w-3 h-3" />{addingActivity ? "Logging…" : "Log Activity"}
            </button>
          </div>

          {/* Activity list */}
          <div className="rounded-xl p-4 space-y-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.08)" }}>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: "rgba(0,212,255,0.5)" }}>
              <MessageSquare className="w-3 h-3 inline mr-1" />History
            </p>
            {lead.activities.length === 0 ? (
              <p className="text-xs text-center py-4" style={{ color: "rgba(0,212,255,0.2)" }}>No activities yet</p>
            ) : (
              lead.activities.map((a) => (
                <div key={a.id} className="rounded-lg p-3 space-y-0.5" style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.06)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase" style={{ background: "rgba(0,212,255,0.1)", color: "#00d4ff" }}>{a.type}</span>
                    <span className="text-xs font-semibold" style={{ color: "#d8e8f4" }}>{a.title}</span>
                  </div>
                  {a.body && <p className="text-xs pl-0.5" style={{ color: "rgba(0,212,255,0.45)" }}>{a.body}</p>}
                  <p className="text-[10px]" style={{ color: "rgba(0,212,255,0.25)" }}>{new Date(a.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
