"use client";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";

interface JobSummary {
  id: string;
  title: string;
  client: { name: string; company?: string };
  pilot?: { name: string };
}

interface Contract {
  id: string;
  title: string;
  status: string;
  signedDate?: string;
  expiresAt?: string;
  content?: string;
  job: JobSummary;
  createdAt: string;
}

const emptyForm = {
  jobId: "",
  title: "",
  status: "draft",
  signedDate: "",
  expiresAt: "",
  content: "",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  sent: "bg-blue-100 text-blue-700",
  signed: "bg-green-100 text-green-700",
  expired: "bg-red-100 text-red-700",
};

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = () =>
    Promise.all([
      fetch("/api/contracts").then((r) => r.json()),
      fetch("/api/jobs").then((r) => r.json()),
    ]).then(([c, j]) => {
      setContracts(c);
      setJobs(j);
    });

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (c: Contract) => {
    setForm({
      jobId: c.job.id,
      title: c.title,
      status: c.status,
      signedDate: c.signedDate ? c.signedDate.split("T")[0] : "",
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
      content: c.content ?? "",
    });
    setEditingId(c.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/contracts/${editingId}` : "/api/contracts";
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
    if (!confirm("Delete this contract?")) return;
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    load();
  };

  // Only jobs without a contract can be selected for new contracts
  const contractedJobIds = new Set(contracts.map((c) => c.job.id));
  const availableJobs = jobs.filter(
    (j) => !contractedJobIds.has(j.id) || (editingId && jobs.find((x) => x.id === form.jobId))
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Contracts</h1>
          <p className="text-slate-500 mt-1">{contracts.length} total contracts</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          + New Contract
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Title</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Job</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Client</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Pilot</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Signed</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Expires</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {contracts.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12 text-slate-400">
                  No contracts yet. Create one from a job!
                </td>
              </tr>
            )}
            {contracts.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{c.title}</td>
                <td className="px-6 py-4 text-slate-600">{c.job.title}</td>
                <td className="px-6 py-4 text-slate-600">
                  {c.job.client.company || c.job.client.name}
                </td>
                <td className="px-6 py-4 text-slate-600">{c.job.pilot?.name ?? "—"}</td>
                <td className="px-6 py-4 text-slate-600">
                  {c.signedDate ? new Date(c.signedDate).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2 justify-end">
                  <button
                    onClick={() => openEdit(c)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
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
          title={editingId ? "Edit Contract" : "New Contract"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contract Title *</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            {!editingId && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Linked Job *</label>
                <select
                  required
                  value={form.jobId}
                  onChange={(e) => setForm({ ...form, jobId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a job…</option>
                  {availableJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.client.company || j.client.name}
                    </option>
                  ))}
                </select>
                {availableJobs.length === 0 && (
                  <p className="text-xs text-slate-400 mt-1">
                    All jobs already have contracts. Create a new job first.
                  </p>
                )}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="signed">Signed</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Signed Date</label>
                <input
                  type="date"
                  value={form.signedDate}
                  onChange={(e) => setForm({ ...form, signedDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contract Terms / Content</label>
              <textarea
                rows={5}
                placeholder="Enter contract terms, scope of work, payment terms, etc."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors"
              >
                {editingId ? "Save Changes" : "Create Contract"}
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
