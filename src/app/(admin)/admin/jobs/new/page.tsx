"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const JOB_TYPES = [
  { value: "REAL_ESTATE", label: "Real Estate" },
  { value: "CONSTRUCTION", label: "Construction" },
  { value: "MARKETING", label: "Marketing" },
  { value: "EVENT", label: "Event" },
  { value: "INSPECTION", label: "Inspection" },
  { value: "MAPPING", label: "Mapping" },
  { value: "OTHER", label: "Other" },
];

interface Client {
  id: string;
  company: string;
  contactName: string | null;
}

interface Pilot {
  id: string;
  user: { name: string | null };
}

export default function NewJobPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [pilots, setPilots] = useState<Pilot[]>([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    clientId: "",
    pilotId: "",
    type: "REAL_ESTATE",
    location: "",
    scheduledDate: "",
    scheduledTime: "",
    clientPrice: "",
    pilotPay: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/pilots").then((r) => r.json()),
    ]).then(([clientsData, pilotsData]) => {
      setClients(clientsData);
      setPilots(pilotsData);
    });
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const scheduledDate =
        form.scheduledDate && form.scheduledTime
          ? new Date(`${form.scheduledDate}T${form.scheduledTime}`)
          : form.scheduledDate
          ? new Date(form.scheduledDate)
          : undefined;

      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description || undefined,
          clientId: form.clientId,
          pilotId: form.pilotId || undefined,
          type: form.type,
          location: form.location || undefined,
          scheduledDate,
          clientPrice: form.clientPrice ? parseFloat(form.clientPrice) : undefined,
          pilotPay: form.pilotPay ? parseFloat(form.pilotPay) : undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create job");
        return;
      }

      router.push("/admin/jobs");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/jobs"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <h1 className="text-2xl font-bold">Create New Job</h1>
        <p className="text-muted-foreground">
          Dispatch a new drone photography / video job.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Job Details */}
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
                placeholder="Downtown Phoenix Real Estate Shoot"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Job Type</Label>
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => set("location", e.target.value)}
                  placeholder="Phoenix, AZ"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Job scope, deliverable requirements..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Client & Pilot */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client &amp; Pilot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Client *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => set("clientId", v)}
                required
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company}
                      {c.contactName ? ` — ${c.contactName}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pilotId">Assign Pilot (optional)</Label>
              <Select
                value={form.pilotId}
                onValueChange={(v) => set("pilotId", v)}
              >
                <SelectTrigger id="pilotId">
                  <SelectValue placeholder="Assign later..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {pilots.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.user.name ?? "Unnamed Pilot"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Scheduled Date</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduledDate">Date</Label>
              <Input
                id="scheduledDate"
                type="date"
                value={form.scheduledDate}
                onChange={(e) => set("scheduledDate", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduledTime">Time</Label>
              <Input
                id="scheduledTime"
                type="time"
                value={form.scheduledTime}
                onChange={(e) => set("scheduledTime", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
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
              <Label htmlFor="pilotPay">Pilot Pay ($)</Label>
              <Input
                id="pilotPay"
                type="number"
                step="0.01"
                min="0"
                value={form.pilotPay}
                onChange={(e) => set("pilotPay", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Internal Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Any internal notes about this job..."
              rows={3}
            />
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || !form.clientId}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Job
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/jobs">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
