"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { Separator } from "@/components/ui/separator";
import { ArrowLeft, DollarSign, CheckCircle, Send, Printer } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface LineItem { description: string; qty: number; unitPrice: number; total: number }
interface Invoice {
  id: string; invoiceNumber: string; status: string;
  amount: string; tax: string | null; totalAmount: string;
  issueDate: string; dueDate: string | null; paidAt: string | null;
  notes: string | null; lineItems: LineItem[] | null;
  client: { id: string; companyName: string; contactName: string | null; email: string | null; address: string | null; city: string | null; state: string | null };
  job: { id: string; title: string; city: string; state: string } | null;
}

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-800",
  PAID: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  VOID: "bg-gray-100 text-gray-400",
};

export default function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [id, setId] = useState<string>("");

  useEffect(() => {
    params.then(({ id }) => {
      setId(id);
      fetch(`/api/invoices/${id}`)
        .then((r) => r.json())
        .then((data) => { setInvoice(data); setLoading(false); });
    });
  }, [params]);

  async function updateStatus(newStatus: string) {
    if (!invoice) return;
    setSaving(true);
    const extra = newStatus === "PAID" ? { paidAt: new Date().toISOString() } : {};
    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, ...extra }),
    });
    const updated = await res.json();
    setInvoice(updated);
    setSaving(false);
  }

  if (loading) return <div className="p-8 text-muted-foreground">Loading...</div>;
  if (!invoice) return <div className="p-8 text-muted-foreground">Invoice not found.</div>;

  const lineItems: LineItem[] = invoice.lineItems ?? [];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link href="/admin/invoices" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Invoices
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">{invoice.client.companyName}</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusColors[invoice.status]}`}>
              {invoice.status}
            </span>
            {invoice.status === "DRAFT" && (
              <Button size="sm" onClick={() => updateStatus("SENT")} disabled={saving}>
                <Send className="h-3.5 w-3.5 mr-1.5" /> Mark Sent
              </Button>
            )}
            {(invoice.status === "SENT" || invoice.status === "OVERDUE") && (
              <Button size="sm" variant="default" onClick={() => updateStatus("PAID")} disabled={saving}
                className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Mark Paid
              </Button>
            )}
            {invoice.status !== "VOID" && invoice.status !== "PAID" && (
              <Button size="sm" variant="outline" onClick={() => updateStatus("VOID")} disabled={saving}>
                Void
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-4 w-4" /> Invoice Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {/* Bill To */}
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Bill To</p>
              <p className="font-semibold">{invoice.client.companyName}</p>
              {invoice.client.contactName && <p className="text-sm text-muted-foreground">{invoice.client.contactName}</p>}
              {invoice.client.email && <p className="text-sm text-muted-foreground">{invoice.client.email}</p>}
              {invoice.client.address && <p className="text-sm text-muted-foreground">{invoice.client.address}</p>}
              {(invoice.client.city || invoice.client.state) && (
                <p className="text-sm text-muted-foreground">
                  {[invoice.client.city, invoice.client.state].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <Separator />
            {/* Dates */}
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Issue Date</p>
                <p>{formatDate(invoice.issueDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Due Date</p>
                <p>{formatDate(invoice.dueDate)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Paid Date</p>
                <p>{invoice.paidAt ? formatDate(invoice.paidAt) : "—"}</p>
              </div>
            </div>
            {invoice.job && (
              <>
                <Separator />
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Related Job</p>
                  <Link href={`/admin/jobs/${invoice.job.id}`} className="text-primary hover:underline text-sm">
                    {invoice.job.title} — {invoice.job.city}, {invoice.job.state}
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(invoice.amount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax</span>
              <span>{formatCurrency(invoice.tax ?? 0)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-xl">{formatCurrency(invoice.totalAmount)}</span>
            </div>
            <div className={`mt-3 text-center py-2 rounded-lg text-sm font-medium ${statusColors[invoice.status]}`}>
              {invoice.status}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Line Items */}
      {lineItems.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-medium">Description</th>
                  <th className="text-right p-4 font-medium w-20">Qty</th>
                  <th className="text-right p-4 font-medium w-28">Unit Price</th>
                  <th className="text-right p-4 font-medium w-28">Total</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="p-4">{item.description}</td>
                    <td className="p-4 text-right">{item.qty}</td>
                    <td className="p-4 text-right">{formatCurrency(item.unitPrice)}</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader><CardTitle>Notes</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
