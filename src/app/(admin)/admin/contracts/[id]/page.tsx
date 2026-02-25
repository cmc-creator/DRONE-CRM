"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send, Trash2, CheckCircle, FileSignature, Copy, Ban } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Contract {
  id: string; title: string; type: string; status: string; content: string;
  notes: string | null; createdAt: string; sentAt: string | null;
  signedAt: string | null; signedByName: string | null; signedByEmail: string | null; signatureIp: string | null;
  client: { id: string; companyName: string; contactName: string | null; email: string | null } | null;
  pilot:  { id: string; user: { name: string | null; email: string } } | null;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT:  "bg-blue-100 text-blue-800",
  SIGNED:"bg-green-100 text-green-800",
  VOID:  "bg-red-100 text-red-600",
};

const typeLabel: Record<string, string> = {
  PILOT_AGREEMENT: "Pilot Agreement", CLIENT_SERVICE: "Client Service",
  NDA: "NDA", SUBCONTRACTOR: "Subcontractor", OTHER: "Other",
};

export default function ContractDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [contract, setContract] = useState<Contract | null>(null);
  const [id, setId]             = useState("");
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [copied, setCopied]     = useState(false);

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/contracts/${id}`)
        .then((r) => r.json())
        .then((data) => { setContract(data); setLoading(false); });
    });
  }, [params]);

  async function updateStatus(status: string) {
    setSaving(true);
    const res = await fetch(`/api/contracts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setContract(await res.json());
    setSaving(false);
  }

  async function deleteContract() {
    if (!confirm("Delete this contract? This cannot be undone.")) return;
    await fetch(`/api/contracts/${id}`, { method: "DELETE" });
    router.push("/admin/contracts");
  }

  function copySignLink() {
    navigator.clipboard.writeText(`${window.location.origin}/contracts/${id}/sign`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!contract) return <div className="p-8 text-muted-foreground">Contract not found.</div>;

  const party = contract.client?.companyName ?? contract.pilot?.user.name ?? "—";
  const partyEmail = contract.client?.email ?? contract.pilot?.user.email ?? null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <Link href="/admin/contracts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Contracts
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileSignature className="h-6 w-6 text-muted-foreground" /> {contract.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap text-sm text-muted-foreground">
              <span>{typeLabel[contract.type] ?? contract.type}</span>
              {party !== "—" && <><span>·</span><span>{party}</span></>}
              <span>·</span>
              <span>Created {formatDate(contract.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[contract.status]}`}>
              {contract.status}
            </span>
            {contract.status === "DRAFT" && (
              <Button size="sm" onClick={() => updateStatus("SENT")} disabled={saving}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> Mark Sent
              </Button>
            )}
            {(contract.status === "DRAFT" || contract.status === "SENT") && (
              <Button size="sm" variant="outline" onClick={copySignLink}>
                <Copy className="h-3.5 w-3.5 mr-1.5" /> {copied ? "Copied!" : "Copy Sign Link"}
              </Button>
            )}
            {contract.status !== "VOID" && contract.status !== "SIGNED" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus("VOID")} disabled={saving}>
                <Ban className="h-3.5 w-3.5 mr-1.5" /> Void
              </Button>
            )}
            {contract.status === "DRAFT" && (
              <Button size="sm" variant="destructive" onClick={deleteContract}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Sidebar info */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Contract Info</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusColors[contract.status]}`}>{contract.status}</span>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Party</p>
                <p className="mt-1 font-medium">{party}</p>
                {partyEmail && <p className="text-xs text-muted-foreground">{partyEmail}</p>}
              </div>
              {contract.client && (
                <>
                  <Separator />
                  <Link href={`/admin/clients/${contract.client.id}`} className="text-xs text-primary hover:underline">View Client →</Link>
                </>
              )}
              {contract.pilot && (
                <>
                  <Separator />
                  <Link href={`/admin/pilots/${contract.pilot.id}`} className="text-xs text-primary hover:underline">View Pilot →</Link>
                </>
              )}
              {contract.sentAt && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Sent</p>
                    <p className="mt-1">{formatDate(contract.sentAt)}</p>
                  </div>
                </>
              )}
              {contract.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Notes</p>
                    <p className="mt-1 text-muted-foreground">{contract.notes}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Signature status */}
          {contract.status === "SIGNED" ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-semibold text-green-800">Signed</p>
                    <p className="text-green-700 mt-1">{contract.signedByName}</p>
                    <p className="text-green-600 text-xs">{contract.signedByEmail}</p>
                    <p className="text-green-600 text-xs mt-1">{formatDate(contract.signedAt)}</p>
                    {contract.signatureIp && <p className="text-green-500 text-xs">IP: {contract.signatureIp}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : contract.status !== "VOID" ? (
            <Card className="border-blue-100">
              <CardContent className="p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">Signing Link</p>
                <p className="text-xs mb-3">Share this link with the party to collect their e-signature.</p>
                <Button size="sm" variant="outline" className="w-full" onClick={copySignLink}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" /> {copied ? "Copied!" : "Copy Link"}
                </Button>
                <p className="text-xs text-muted-foreground mt-2 break-all">
                  /contracts/{id}/sign
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        {/* Contract content */}
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-sm">Contract Document</CardTitle></CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap font-mono text-xs bg-muted/50 rounded-lg p-4 leading-relaxed max-h-[600px] overflow-y-auto border">
              {contract.content}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
