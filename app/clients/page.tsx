"use client";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";

interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  city?: string;
  state?: string;
  notes?: string;
  status: string;
  createdAt: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  company: "",
  city: "",
  state: "",
  notes: "",
  status: "active",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-600",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const load = () =>
    fetch("/api/clients")
      .then((r) => r.json())
      .then(setClients);

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (c: Client) => {
    setForm({
      name: c.name,
      email: c.email ?? "",
      phone: c.phone ?? "",
      company: c.company ?? "",
      city: c.city ?? "",
      state: c.state ?? "",
      notes: c.notes ?? "",
      status: c.status,
    });
    setEditingId(c.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/clients/${editingId}` : "/api/clients";
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
    if (!confirm("Delete this client? This cannot be undone.")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.company ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (c.email ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Clients</h1>
          <p className="text-slate-500 mt-1">{clients.length} total clients</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          + Add Client
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search clients…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Name</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Company</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Email</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Phone</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Location</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No clients found. Add your first client!
                </td>
              </tr>
            )}
            {filtered.map((c) => (
              <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-800">{c.name}</td>
                <td className="px-6 py-4 text-slate-600">{c.company || "—"}</td>
                <td className="px-6 py-4 text-slate-600">{c.email || "—"}</td>
                <td className="px-6 py-4 text-slate-600">{c.phone || "—"}</td>
                <td className="px-6 py-4 text-slate-600">
                  {[c.city, c.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status] ?? "bg-slate-100 text-slate-600"}`}>
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
          title={editingId ? "Edit Client" : "Add Client"}
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
                <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                <input
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
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
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
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
                {editingId ? "Save Changes" : "Add Client"}
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
