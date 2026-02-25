"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, FileSignature } from "lucide-react";

interface Client { id: string; companyName: string }
interface Pilot  { id: string; user: { name: string | null } }

const inputClass = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "block text-xs font-semibold uppercase text-muted-foreground mb-1";

const CONTRACT_TEMPLATES: Record<string, string> = {
  PILOT_AGREEMENT: `INDEPENDENT CONTRACTOR AGREEMENT

This Independent Contractor Agreement ("Agreement") is entered into as of [DATE], between Lumin Aerial LLC ("Company") and [PILOT NAME] ("Contractor").

1. SERVICES
Contractor agrees to provide aerial photography and drone services as requested by the Company.

2. COMPENSATION
Contractor will be compensated at the rate agreed upon for each job assignment.

3. INDEPENDENT CONTRACTOR STATUS
Contractor is an independent contractor and not an employee. Contractor is responsible for all taxes on compensation received.

4. FAA COMPLIANCE
Contractor certifies possession of a valid FAA Part 107 Remote Pilot Certificate and will comply with all applicable FAA regulations.

5. INSURANCE
Contractor maintains liability insurance sufficient for all operations.

6. CONFIDENTIALITY
Contractor agrees to keep all client information confidential.

7. DELIVERABLES
All work product and deliverables created for the Company belong to the Company.

IN WITNESS WHEREOF, the parties have executed this Agreement as of the date first written above.

Lumin Aerial LLC
Bailey Sargent, Owner

Contractor Signature: _______________________
Printed Name: _______________________
Date: _______________________`,

  CLIENT_SERVICE: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into between Lumin Aerial LLC ("Lumin Aerial") and [CLIENT NAME] ("Client").

1. SERVICES
Lumin Aerial will provide drone aerial photography and videography services as outlined in each project order.

2. PAYMENT
Client agrees to pay invoices within 30 days of receipt. Late payments incur a 1.5% monthly fee.

3. DELIVERABLES
Lumin Aerial will deliver edited photos/video within the agreed timeline after capture.

4. CANCELLATION
Cancellations within 24 hours of scheduled shoot are subject to a 50% cancellation fee.

5. USAGE RIGHTS
Client receives full usage rights to all delivered files for their intended commercial purpose.

6. LIMITATION OF LIABILITY
Lumin Aerial's liability is limited to the amount paid for the specific project.

7. GOVERNING LAW
This Agreement is governed by the laws of the State of Arizona.

AGREED AND ACCEPTED:

LUMIN AERIAL LLC:
Bailey Sargent, Owner
Date: _______________________

CLIENT:
Signature: _______________________
Printed Name: _______________________
Title: _______________________
Date: _______________________`,

  NDA: `NON-DISCLOSURE AGREEMENT

This Non-Disclosure Agreement ("Agreement") is entered into between Lumin Aerial LLC and the undersigned party.

1. CONFIDENTIAL INFORMATION
The parties may disclose confidential business information, client lists, pricing, and operational methods.

2. OBLIGATIONS
Each party agrees to hold all Confidential Information in strict confidence and not disclose to third parties.

3. TERM
This Agreement shall remain in effect for 2 years from the date of signing.

4. GOVERNING LAW
This Agreement is governed by Arizona law.

Signature: _______________________
Printed Name: _______________________
Date: _______________________`,
};

export default function NewContractPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [pilots,  setPilots]  = useState<Pilot[]>([]);
  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState("");
  const [form, setForm] = useState({
    title: "", type: "OTHER", clientId: "", pilotId: "", content: "", notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/pilots").then((r) => r.json()),
    ]).then(([c, p]) => { setClients(c); setPilots(p); });
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function applyTemplate(type: string) {
    const tpl = CONTRACT_TEMPLATES[type];
    if (tpl) set("content", tpl);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch("/api/contracts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, clientId: form.clientId || null, pilotId: form.pilotId || null }),
    });
    if (!res.ok) { setError("Failed to create contract."); setSaving(false); return; }
    const data = await res.json();
    router.push(`/admin/contracts/${data.id}`);
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/admin/contracts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Contracts
        </Link>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FileSignature className="h-6 w-6" /> New Contract
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}

        <Card>
          <CardHeader><CardTitle>Contract Details</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass}>Contract Title *</label>
              <input className={inputClass} required placeholder="e.g. Pilot Agreement – Jake Martinez" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Contract Type</label>
              <select className={inputClass} value={form.type} onChange={(e) => { set("type", e.target.value); applyTemplate(e.target.value); }}>
                <option value="PILOT_AGREEMENT">Pilot Agreement</option>
                <option value="CLIENT_SERVICE">Client Service Agreement</option>
                <option value="NDA">NDA</option>
                <option value="SUBCONTRACTOR">Subcontractor</option>
                <option value="OTHER">Other</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">Selecting a type loads a template</p>
            </div>
            <div>
              <label className={labelClass}>Associated Client</label>
              <select className={inputClass} value={form.clientId} onChange={(e) => set("clientId", e.target.value)}>
                <option value="">— None —</option>
                {clients.map((c) => <option key={c.id} value={c.id}>{c.companyName}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Associated Pilot</label>
              <select className={inputClass} value={form.pilotId} onChange={(e) => set("pilotId", e.target.value)}>
                <option value="">— None —</option>
                {pilots.map((p) => <option key={p.id} value={p.id}>{p.user.name ?? "Unnamed"}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Internal Notes</label>
              <input className={inputClass} placeholder="Optional notes..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contract Content</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-2">Full contract text. Use [PLACEHOLDERS] for items to fill in.</p>
            <textarea
              className={`${inputClass} font-mono text-xs`}
              rows={28}
              required
              placeholder="Enter contract text or select a type above to load a template..."
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
            />
          </CardContent>
        </Card>

        <div className="flex items-center gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/contracts")}>Cancel</Button>
          <Button type="submit" disabled={saving}>
            <Save className="h-4 w-4 mr-2" /> {saving ? "Creating..." : "Create Contract"}
          </Button>
        </div>
      </form>
    </div>
  );
}
