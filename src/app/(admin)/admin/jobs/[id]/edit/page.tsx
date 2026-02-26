"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Trash2 } from "lucide-react";

const JOB_TYPES = [
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "MARKETING", label: "Marketing" },
  { value: "EVENT", label: "Event" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "MAPPING", label: "Mapping" },
  { value: "OTHER", label: "Other" },
];

const JOB_STATUSES = [
  { value: "DRAFT", label: "Draft" },
  { value: "PENDING_ASSIGNMENT", label: "Pending Assignment" },
  { value: "ASSIGNED", label: "Assigned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "CAPTURE_COMPLETE", label: "Capture Complete" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
];

interface Pilot {
  id: string;
  user: { name: string | null };
}

interface Client {
  id: string;
  companyName: string;
}

interface JobData {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  address: string | null;
  city: string;
  state: string;
  zip: string | null;
  deliverables: string | null;
  internalNotes: string | null;
  scheduledDate: string | null;
  completedDate: string | null;
  duration: number | null;
  clientPrice: string | null;
  pilotPayout: string | null;
  priority: number;
  clientId: string;
  client: { companyName: string };
  assignments: { pilotId: string; pilot: { user: { name: string | null } } }[];
}

export default function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    type: "REAL_ESTATE",
    status: "DRAFT",
    clientId: "",
    pilotId: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    deliverables: "",
    internalNotes: "",
    scheduledDate: "",
    completedDate: "",
    duration: "",
    clientPrice: "",
    pilotPayout: "",
    priority: "2",
  });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/jobs/${id}`).then((r) => r.json()),
      fetch("/api/pilots").then((r) => r.json()),
      fetch("/api/clients").then((r) => r.json()),
    ])
      .then(([job, pilotsData, clientsData]: [JobData, Pilot[], Client[]]) => {
        setPilots(pilotsData);
        setClients(clientsData);
        setForm({
          title: job.title ?? "",
          description: job.description ?? "",
          type: job.type ?? "OTHER",
          status: job.status ?? "DRAFT",
          clientId: job.clientId ?? "",
          pilotId: job.assignments?.[0]?.pilotId ?? "",
          address: job.address ?? "",
          city: job.city ?? "",
          state: job.state ?? "",
          zip: job.zip ?? "",
          deliverables: job.deliverables ?? "",
          internalNotes: job.internalNotes ?? "",
          scheduledDate: job.scheduledDate
            ? new Date(job.scheduledDate).toISOString().slice(0, 16)
            : "",
          completedDate: job.completedDate
            ? new Date(job.completedDate).toISOString().slice(0, 10)
            : "",
          duration: job.duration ? String(job.duration) : "",
          clientPrice: job.clientPrice ? String(parseFloat(job.clientPrice)) : "",
          pilotPayout: job.pilotPayout ? String(parseFloat(job.pilotPayout)) : "",
          priority: String(job.priority ?? 2),
        });
      })
      .catch(() => setError("Failed to load job"))
      .finally(() => setLoading(false));
  }, [id]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || null,
          type: form.type,
          status: form.status,
          address: form.address || null,
          city: form.city,
          state: form.state,
          zip: form.zip || null,
          deliverables: form.deliverables || null,
          internalNotes: form.internalNotes || null,
          scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).toISOString() : null,
          completedDate: form.completedDate ? new Date(form.completedDate).toISOString() : null,
          duration: form.duration ? parseInt(form.duration) : null,
          clientPrice: form.clientPrice ? parseFloat(form.clientPrice) : null,
          pilotPayout: form.pilotPayout ? parseFloat(form.pilotPayout) : null,
          priority: parseInt(form.priority),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to save");
        return;
      }
      router.push(`/admin/jobs/${id}`);
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, { method: "DELETE" });
      if (!res.ok) { setError("Failed to delete job"); return; }
      router.push("/admin/jobs");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/admin/jobs/${id}`}>
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold">Edit Job</h1>
        </div>
        {!confirmDelete ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:bg-red-50 gap-1"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm text-red-500">Delete this job?</span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Delete"}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger id="type"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
                  <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {JOB_STATUSES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliverables">Deliverables Required</Label>
              <Textarea
                id="deliverables"
                value={form.deliverables}
                onChange={(e) => set("deliverables", e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  required
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  required
                  maxLength={2}
                  value={form.state}
                  onChange={(e) => set("state", e.target.value.toUpperCase())}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">ZIP</Label>
                <Input
                  id="zip"
                  value={form.zip}
                  onChange={(e) => set("zip", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="clientId">Client</Label>
              <Select value={form.clientId} onValueChange={(v) => set("clientId", v)}>
                <SelectTrigger id="clientId"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.companyName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Scheduled Date &amp; Time</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={form.scheduledDate}
                onChange={(e) => set("scheduledDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="completedDate">Completed Date</Label>
              <Input
                id="completedDate"
                type="date"
                value={form.completedDate}
                onChange={(e) => set("completedDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Est. Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                min="0"
                value={form.duration}
                onChange={(e) => set("duration", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
                <SelectTrigger id="priority"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">High</SelectItem>
                  <SelectItem value="2">Normal</SelectItem>
                  <SelectItem value="3">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientPrice">Client Price ($)</Label>
              <Input
                id="clientPrice"
                type="number"
                step="0.01"
                min="0"
                value={form.clientPrice}
                onChange={(e) => set("clientPrice", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilotPayout">Pilot Payout ($)</Label>
              <Input
                id="pilotPayout"
                type="number"
                step="0.01"
                min="0"
                value={form.pilotPayout}
                onChange={(e) => set("pilotPayout", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.internalNotes}
              onChange={(e) => set("internalNotes", e.target.value)}
              placeholder="Internal notes visible only to admins..."
              rows={3}
            />
          </CardContent>
        </Card>

        <div className="flex gap-3 justify-end pb-8">
          <Link href={`/admin/jobs/${id}`}>
            <Button variant="outline" type="button">Cancel</Button>
          </Link>
          <Button type="submit" disabled={saving} className="gap-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
