"use client";

import { useState, useEffect } from "react";
import { CheckCircle, FileSignature, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface Contract {
  id: string; title: string; type: string; status: string; content: string;
  signedAt: string | null; signedByName: string | null;
  client: { companyName: string } | null;
}

const inputClass = "w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";
const labelClass = "block text-xs font-semibold uppercase text-muted-foreground mb-1";

export default function SignContractPage({ params }: { params: Promise<{ id: string }> }) {
  const [contract, setContract] = useState<Contract | null>(null);
  const [id, setId]             = useState("");
  const [loading, setLoading]   = useState(true);
  const [signing, setSigning]   = useState(false);
  const [done, setDone]         = useState(false);
  const [agreed, setAgreed]     = useState(false);
  const [form, setForm]         = useState({ name: "", email: "" });
  const [error, setError]       = useState("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/contracts/${id}`)
        .then((r) => r.json())
        .then((data) => { setContract(data); setLoading(false); });
    });
  }, [params]);

  async function handleSign(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) { setError("You must agree to the terms before signing."); return; }
    setSigning(true);
    setError("");
    const res = await fetch(`/api/contracts/${id}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ signedByName: form.name, signedByEmail: form.email }),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to sign. Please try again.");
      setSigning(false);
      return;
    }
    setDone(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <p className="text-muted-foreground">Loading contract...</p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-3" />
            <h1 className="text-xl font-bold">Contract not found</h1>
            <p className="text-muted-foreground mt-2 text-sm">This link may have expired or been removed.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (contract.status === "VOID") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
            <h1 className="text-xl font-bold">Contract Voided</h1>
            <p className="text-muted-foreground mt-2 text-sm">This contract has been voided and is no longer active.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done || contract.status === "SIGNED") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md w-full border-green-200">
          <CardContent className="p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-green-800">Contract Signed!</h1>
            <p className="text-muted-foreground mt-3 text-sm">
              {done
                ? `Thank you, ${form.name}. Your signature has been recorded.`
                : `This contract was signed by ${contract.signedByName ?? "the counterparty"} on ${formatDate(contract.signedAt)}.`}
            </p>
            <div className="mt-6 p-4 rounded-lg bg-muted text-xs text-muted-foreground text-left">
              <p><strong>Document:</strong> {contract.title}</p>
              {done && <p className="mt-1"><strong>Signer:</strong> {form.name} ({form.email})</p>}
              <p className="mt-1"><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              A copy of this agreement is on file with Lumin Aerial LLC. For questions, contact{" "}
              <a href="mailto:bsargent@luminaerial.com" className="text-primary hover:underline">
                bsargent@luminaerial.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="4" fill="white" />
                <line x1="15" y1="11" x2="15" y2="4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="15" y1="19" x2="15" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="11" y1="15" x2="4" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <line x1="19" y1="15" x2="26" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-bold text-lg">Lumin Aerial LLC</span>
          </div>
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            <FileSignature className="h-6 w-6 text-muted-foreground" />
            {contract.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Please review the document below and sign electronically.
          </p>
        </div>

        {/* Contract document */}
        <Card>
          <CardHeader><CardTitle className="text-sm">Contract Document</CardTitle></CardHeader>
          <CardContent>
            <div className="max-h-[460px] overflow-y-auto border rounded-lg bg-white p-5">
              <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-gray-800">
                {contract.content}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Signature form */}
        <Card>
          <CardHeader><CardTitle>Sign This Document</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSign} className="space-y-4">
              {error && (
                <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Legal Name *</label>
                  <input
                    className={inputClass} required
                    placeholder="Your full legal name"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    className={inputClass} type="email" required
                    placeholder="your@email.com"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex items-start gap-3 bg-muted/50 rounded-xl p-4">
                <input
                  id="agree" type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                  I have read and agree to the terms of this contract. By checking this box and clicking &ldquo;Sign Contract,&rdquo; I acknowledge that my electronic signature is legally binding and equivalent to a handwritten signature under the Electronic Signatures in Global and National Commerce Act (ESIGN).
                </label>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={signing || !agreed || !form.name || !form.email}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {signing ? "Recording signature..." : "Sign Contract"}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Your IP address and timestamp will be recorded for legal verification.
              </p>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © 2026 NyxAerial · Built for Lumin Aerial LLC · For questions contact{" "}
          <a href="mailto:bsargent@luminaerial.com" className="text-primary hover:underline">bsargent@luminaerial.com</a>
        </p>
      </div>
    </div>
  );
}
