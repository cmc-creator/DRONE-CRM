"use client";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";

interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  source?: string;
  status: string;
  value?: number;
  notes?: string;
  createdAt: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  source: "",
  status: "new",
  value: "",
  notes: "",
};

const STATUSES = ["new", "contacted", "qualified", "proposal", "won", "lost"];

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  contacted: "bg-purple-100 text-purple-700",
  qualified: "bg-cyan-100 text-cyan-700",
  proposal: "bg-amber-100 text-amber-700",
  won: "bg-green-100 text-green-700",
  lost: "bg-red-100 text-red-700",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () =>
    fetch("/api/leads")
      .then((r) => r.json())
      .then(setLeads);

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (l: Lead) => {
    setForm({
      name: l.name,
      email: l.email ?? "",
      phone: l.phone ?? "",
      company: l.company ?? "",
      source: l.source ?? "",
      status: l.status,
      value: l.value?.toString() ?? "",
      notes: l.notes ?? "",
    });
    setEditingId(l.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      value: form.value ? parseFloat(form.value) : null,
    };
    const url = editingId ? `/api/leads/${editingId}` : "/api/leads";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    load();
  };

  const filtered =
    filterStatus === "all"
      ? leads
      : leads.filter((l) => l.status === filterStatus);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Leads</h1>
          <p className="text-slate-500 mt-1">{leads.length} total leads</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          + Add Lead
        </button>
      </div>

      {/* Pipeline Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-6">
        {STATUSES.map((s) => {
          const count = leads.filter((l) => l.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
              className={`rounded-lg p-3 text-center border transition-all ${
                filterStatus === s
                  ? "ring-2 ring-blue-500 " + STATUS_COLORS[s]
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-xl font-bold text-slate-800">{count}</div>
              <div className={`text-xs font-medium capitalize mt-0.5 ${filterStatus === s ? "" : "text-slate-500"}`}>
                {s}
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Name</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Company</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Contact</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Source</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Value</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No leads found.
                </td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{l.name}</td>
                <td className="px-6 py-4 text-slate-600">{l.company || "—"}</td>
                <td className="px-6 py-4 text-slate-600">
                  <div>{l.email || ""}</div>
                  <div className="text-xs text-slate-400">{l.phone || ""}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">{l.source || "—"}</td>
                <td className="px-6 py-4 text-slate-600">
                  {l.value ? `$${l.value.toLocaleString()}` : "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[l.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2 justify-end">
                  <button
                    onClick={() => openEdit(l)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(l.id)}
                    className="text-red-500 hover:text-red-700 font-medium text-xs"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <Modal
          title={editingId ? "Edit Lead" : "Add Lead"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
                <input
                  placeholder="e.g. Website, Referral"
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Estimated Value ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                {editingId ? "Save Changes" : "Add Lead"}
              </button>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 border border-slate-300 text-slate-700 hover:bg-slate-50 py-2.5 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
