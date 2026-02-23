"use client";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";

interface Client {
  id: string;
  name: string;
  company?: string;
}

interface Pilot {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  description?: string;
  client: Client;
  pilot?: Pilot;
  status: string;
  jobDate?: string;
  location?: string;
  totalAmount?: number;
  commissionRate: number;
  commissionAmount?: number;
  notes?: string;
  createdAt: string;
}

const emptyForm = {
  title: "",
  description: "",
  clientId: "",
  pilotId: "",
  status: "pending",
  jobDate: "",
  location: "",
  totalAmount: "",
  commissionRate: "15",
  notes: "",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-slate-100 text-slate-600",
  assigned: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  assigned: "Assigned",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterStatus, setFilterStatus] = useState("all");

  const load = () =>
    Promise.all([
      fetch("/api/jobs").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/pilots").then((r) => r.json()),
    ]).then(([j, c, p]) => {
      setJobs(j);
      setClients(c);
      setPilots(p);
    });

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (j: Job) => {
    setForm({
      title: j.title,
      description: j.description ?? "",
      clientId: j.client.id,
      pilotId: j.pilot?.id ?? "",
      status: j.status,
      jobDate: j.jobDate ? j.jobDate.split("T")[0] : "",
      location: j.location ?? "",
      totalAmount: j.totalAmount?.toString() ?? "",
      commissionRate: j.commissionRate.toString(),
      notes: j.notes ?? "",
    });
    setEditingId(j.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/jobs/${editingId}` : "/api/jobs";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowModal(false);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this job? This cannot be undone.")) return;
    await fetch(`/api/jobs/${id}`, { method: "DELETE" });
    load();
  };

  const filtered =
    filterStatus === "all"
      ? jobs
      : jobs.filter((j) => j.status === filterStatus);

  const commission = form.totalAmount && form.commissionRate
    ? ((parseFloat(form.totalAmount) * parseFloat(form.commissionRate)) / 100).toFixed(2)
    : null;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Jobs</h1>
          <p className="text-slate-500 mt-1">{jobs.length} total jobs</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          + New Job
        </button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["all", "pending", "assigned", "in_progress", "completed", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterStatus === s
                ? "bg-blue-600 text-white"
                : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Job</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Client</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Pilot</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Date</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Total</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Commission</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  No jobs found. Create your first job!
                </td>
              </tr>
            )}
            {filtered.map((j) => (
              <tr key={j.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{j.title}</div>
                  {j.location && <div className="text-xs text-slate-400">{j.location}</div>}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {j.client.company || j.client.name}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {j.pilot?.name ?? <span className="text-slate-300 italic">Unassigned</span>}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {j.jobDate ? new Date(j.jobDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {j.totalAmount ? `$${j.totalAmount.toLocaleString()}` : "—"}
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium">
                  {j.commissionAmount
                    ? `$${j.commissionAmount.toFixed(2)}`
                    : j.totalAmount
                    ? `$${((j.totalAmount * j.commissionRate) / 100).toFixed(2)}`
                    : "—"}
                  <div className="text-xs text-slate-400 font-normal">{j.commissionRate}%</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[j.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {STATUS_LABELS[j.status] ?? j.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2 justify-end">
                  <button
                    onClick={() => openEdit(j)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(j.id)}
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
          title={editingId ? "Edit Job" : "New Job"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Job Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Client *</label>
              <select
                required
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a client…</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.company ? `${c.company} (${c.name})` : c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Assign Pilot</label>
              <select
                value={form.pilotId}
                onChange={(e) => setForm({ ...form, pilotId: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Unassigned</option>
                {pilots.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(STATUS_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Job Date</label>
                <input
                  type="date"
                  value={form.jobDate}
                  onChange={(e) => setForm({ ...form, jobDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
                <input
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Total Amount ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={(e) => setForm({ ...form, totalAmount: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Commission Rate (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={form.commissionRate}
                  onChange={(e) => setForm({ ...form, commissionRate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {commission && (
              <div className="bg-blue-50 rounded-lg px-4 py-2.5 text-sm text-blue-700 font-medium">
                💰 Your commission: <strong>${commission}</strong>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                rows={2}
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
                {editingId ? "Save Changes" : "Create Job"}
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
