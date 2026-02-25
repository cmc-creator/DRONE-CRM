"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface Pilot {
  id: string; phone: string | null; city: string | null; state: string | null;
  zip: string | null; bio: string | null; businessName: string | null;
  faaPartNumber: string | null; faaExpiry: string | null; faaDocUrl: string | null;
  insuranceCarrier: string | null; insurancePolicyNum: string | null;
  insuranceExpiry: string | null; insuranceDocUrl: string | null;
  w9OnFile: boolean; w9DocUrl: string | null; status: string; rating: number | null; notes: string | null;
  user: { name: string | null; email: string };
}

const inputClass = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "block text-xs font-semibold uppercase text-muted-foreground mb-1";

export default function PilotEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [form, setForm] = useState<Partial<Pilot & { name: string }>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/pilots/${id}`)
        .then((r) => r.json())
        .then((data: Pilot) => {
          setForm({
            name: data.user.name ?? "",
            phone: data.phone ?? "", city: data.city ?? "", state: data.state ?? "",
            zip: data.zip ?? "", bio: data.bio ?? "", businessName: data.businessName ?? "",
            faaPartNumber: data.faaPartNumber ?? "",
            faaExpiry: data.faaExpiry ? data.faaExpiry.split("T")[0] : "",
            faaDocUrl: data.faaDocUrl ?? "",
            insuranceCarrier: data.insuranceCarrier ?? "",
            insurancePolicyNum: data.insurancePolicyNum ?? "",
            insuranceExpiry: data.insuranceExpiry ? data.insuranceExpiry.split("T")[0] : "",
            insuranceDocUrl: data.insuranceDocUrl ?? "",
            w9OnFile: data.w9OnFile, w9DocUrl: data.w9DocUrl ?? "",
            status: data.status, rating: data.rating ?? undefined, notes: data.notes ?? "",
          });
          setLoading(false);
        });
    });
  }, [params]);

  function set(field: string, value: unknown) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/pilots/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError("Failed to save changes."); setSaving(false); return; }
    router.push(`/admin/pilots/${id}`);
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/pilots/${id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Pilot
        </Link>
        <h1 className="text-2xl font-bold">Edit Pilot</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Full Name</label><input className={inputClass} value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></div>
            <div><label className={labelClass}>Business Name</label><input className={inputClass} value={form.businessName ?? ""} onChange={(e) => set("businessName", e.target.value)} /></div>
            <div><label className={labelClass}>Phone</label><input className={inputClass} type="tel" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status ?? "PENDING_REVIEW"} onChange={(e) => set("status", e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div><label className={labelClass}>City</label><input className={inputClass} value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} /></div>
            <div><label className={labelClass}>State</label><input className={inputClass} value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} /></div>
            <div><label className={labelClass}>ZIP</label><input className={inputClass} value={form.zip ?? ""} onChange={(e) => set("zip", e.target.value)} /></div>
            <div><label className={labelClass}>Quality Rating (1-5)</label><input className={inputClass} type="number" min={1} max={5} step={0.1} value={form.rating ?? ""} onChange={(e) => set("rating", e.target.value ? Number(e.target.value) : null)} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Bio</label><textarea className={inputClass} rows={3} value={form.bio ?? ""} onChange={(e) => set("bio", e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* FAA */}
        <Card>
          <CardHeader><CardTitle>FAA Credentials</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>FAA Part 107 Cert #</label><input className={inputClass} value={form.faaPartNumber ?? ""} onChange={(e) => set("faaPartNumber", e.target.value)} /></div>
            <div><label className={labelClass}>FAA Expiry Date</label><input className={inputClass} type="date" value={form.faaExpiry ?? ""} onChange={(e) => set("faaExpiry", e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelClass}>FAA Doc URL</label><input className={inputClass} value={form.faaDocUrl ?? ""} onChange={(e) => set("faaDocUrl", e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* Insurance */}
        <Card>
          <CardHeader><CardTitle>Insurance</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Carrier</label><input className={inputClass} value={form.insuranceCarrier ?? ""} onChange={(e) => set("insuranceCarrier", e.target.value)} /></div>
            <div><label className={labelClass}>Policy Number</label><input className={inputClass} value={form.insurancePolicyNum ?? ""} onChange={(e) => set("insurancePolicyNum", e.target.value)} /></div>
            <div><label className={labelClass}>Expiry Date</label><input className={inputClass} type="date" value={form.insuranceExpiry ?? ""} onChange={(e) => set("insuranceExpiry", e.target.value)} /></div>
            <div><label className={labelClass}>Insurance Doc URL</label><input className={inputClass} value={form.insuranceDocUrl ?? ""} onChange={(e) => set("insuranceDocUrl", e.target.value)} /></div>
          </CardContent>
        </Card>

        {/* W9 / Notes */}
        <Card>
          <CardHeader><CardTitle>W9 &amp; Notes</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input id="w9" type="checkbox" checked={form.w9OnFile ?? false} onChange={(e) => set("w9OnFile", e.target.checked)} className="h-4 w-4" />
              <label htmlFor="w9" className="text-sm font-medium">W9 On File</label>
            </div>
            <div><label className={labelClass}>W9 Doc URL</label><input className={inputClass} value={form.w9DocUrl ?? ""} onChange={(e) => set("w9DocUrl", e.target.value)} /></div>
            <div className="md:col-span-2"><label className={labelClass}>Internal Notes</label><textarea className={inputClass} rows={3} value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} /></div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/pilots/${id}`)}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
