"use client";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";

interface Pilot {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  state?: string;
  certifications?: string;
  specialties?: string;
  hourlyRate?: number;
  status: string;
  notes?: string;
  createdAt: string;
}

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  city: "",
  state: "",
  certifications: "",
  specialties: "",
  hourlyRate: "",
  status: "active",
  notes: "",
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-slate-100 text-slate-600",
  busy: "bg-yellow-100 text-yellow-700",
};

export default function PilotsPage() {
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const load = () =>
    fetch("/api/pilots")
      .then((r) => r.json())
      .then(setPilots);

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p: Pilot) => {
    setForm({
      name: p.name,
      email: p.email ?? "",
      phone: p.phone ?? "",
      city: p.city ?? "",
      state: p.state ?? "",
      certifications: p.certifications ?? "",
      specialties: p.specialties ?? "",
      hourlyRate: p.hourlyRate?.toString() ?? "",
      status: p.status,
      notes: p.notes ?? "",
    });
    setEditingId(p.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : null,
    };
    const url = editingId ? `/api/pilots/${editingId}` : "/api/pilots";
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
    if (!confirm("Delete this pilot? This cannot be undone.")) return;
    await fetch(`/api/pilots/${id}`, { method: "DELETE" });
    load();
  };

  const filtered = pilots.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.specialties ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (p.city ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Pilots</h1>
          <p className="text-slate-500 mt-1">{pilots.length} registered pilots</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          + Add Pilot
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search pilots…"
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
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Location</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Certifications</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Specialties</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Rate</th>
              <th className="text-left px-6 py-3 text-slate-600 font-semibold">Status</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">
                  No pilots found. Add your first pilot!
                </td>
              </tr>
            )}
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{p.name}</div>
                  <div className="text-slate-400 text-xs">{p.email || ""}</div>
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {[p.city, p.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-6 py-4 text-slate-600">{p.certifications || "—"}</td>
                <td className="px-6 py-4 text-slate-600">{p.specialties || "—"}</td>
                <td className="px-6 py-4 text-slate-600">
                  {p.hourlyRate ? `$${p.hourlyRate}/hr` : "—"}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[p.status] ?? "bg-slate-100 text-slate-600"}`}>
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex gap-2 justify-end">
                  <button
                    onClick={() => openEdit(p)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(p.id)}
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
          title={editingId ? "Edit Pilot" : "Add Pilot"}
          onClose={() => setShowModal(false)}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
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
              <label className="block text-sm font-medium text-slate-700 mb-1">Certifications</label>
              <input
                placeholder="e.g. Part 107, Night Waiver"
                value={form.certifications}
                onChange={(e) => setForm({ ...form, certifications: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Specialties</label>
              <input
                placeholder="e.g. Real Estate, Construction, Events"
                value={form.specialties}
                onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.hourlyRate}
                  onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="busy">Busy</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
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
                {editingId ? "Save Changes" : "Add Pilot"}
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
