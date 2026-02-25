"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";

interface Client {
  id: string; companyName: string; contactName: string | null; email: string | null;
  phone: string | null; website: string | null; type: string; status: string;
  address: string | null; city: string | null; state: string | null; zip: string | null;
  billingEmail: string | null; notes: string | null; source: string | null;
}

const inputClass = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "block text-xs font-semibold uppercase text-muted-foreground mb-1";

export default function ClientEditPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = useState("");
  const [form, setForm] = useState<Partial<Client>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/clients/${id}`)
        .then((r) => r.json())
        .then((data: Client) => {
          setForm({
            companyName: data.companyName, contactName: data.contactName ?? "",
            email: data.email ?? "", phone: data.phone ?? "", website: data.website ?? "",
            type: data.type, status: data.status, address: data.address ?? "",
            city: data.city ?? "", state: data.state ?? "", zip: data.zip ?? "",
            billingEmail: data.billingEmail ?? "", notes: data.notes ?? "", source: data.source ?? "",
          });
          setLoading(false);
        });
    });
  }, [params]);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/clients/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (!res.ok) { setError("Failed to save changes."); setSaving(false); return; }
    router.push(`/admin/clients/${id}`);
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div>
        <Link href={`/admin/clients/${id}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Client
        </Link>
        <h1 className="text-2xl font-bold">Edit Client</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

        <Card>
          <CardHeader><CardTitle>Company Information</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className={labelClass}>Company Name *</label><input className={inputClass} required value={form.companyName ?? ""} onChange={(e) => set("companyName", e.target.value)} /></div>
            <div><label className={labelClass}>Contact Name</label><input className={inputClass} value={form.contactName ?? ""} onChange={(e) => set("contactName", e.target.value)} /></div>
            <div><label className={labelClass}>Email</label><input className={inputClass} type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div><label className={labelClass}>Phone</label><input className={inputClass} type="tel" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} /></div>
            <div><label className={labelClass}>Website</label><input className={inputClass} value={form.website ?? ""} onChange={(e) => set("website", e.target.value)} /></div>
            <div><label className={labelClass}>Billing Email</label><input className={inputClass} type="email" value={form.billingEmail ?? ""} onChange={(e) => set("billingEmail", e.target.value)} /></div>
            <div><label className={labelClass}>Client Type</label>
              <select className={inputClass} value={form.type ?? "OTHER"} onChange={(e) => set("type", e.target.value)}>
                <option value="AGENCY">Agency</option>
                <option value="COMMERCIAL">Commercial</option>
                <option value="REAL_ESTATE">Real Estate</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div><label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status ?? "LEAD"} onChange={(e) => set("status", e.target.value)}>
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
            <div><label className={labelClass}>Source</label><input className={inputClass} placeholder="How did they find us?" value={form.source ?? ""} onChange={(e) => set("source", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Address</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2"><label className={labelClass}>Street Address</label><input className={inputClass} value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
            <div><label className={labelClass}>City</label><input className={inputClass} value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} /></div>
            <div><label className={labelClass}>State</label><input className={inputClass} value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} /></div>
            <div><label className={labelClass}>ZIP</label><input className={inputClass} value={form.zip ?? ""} onChange={(e) => set("zip", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <textarea className={inputClass} rows={4} placeholder="Internal notes about this client..." value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push(`/admin/clients/${id}`)}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
