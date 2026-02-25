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

interface Client {
  id: string;
  company: string;
}

interface Job {
  id: string;
  title: string;
  client: { company: string };
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState({
    clientId: "",
    jobId: "",
    totalAmount: "",
    dueDate: "",
    notes: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/clients").then((r) => r.json()),
      fetch("/api/jobs").then((r) => r.json()),
    ]).then(([clientsData, jobsData]) => {
      setClients(clientsData);
      setJobs(jobsData);
    });
  }, []);

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // Filter jobs by selected client
  const filteredJobs = form.clientId
    ? jobs.filter((_j: Job) => {
        // We need client id on job — for now show all
        return true;
      })
    : jobs;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: form.clientId,
          jobId: form.jobId || undefined,
          totalAmount: parseFloat(form.totalAmount),
          dueDate: form.dueDate ? new Date(form.dueDate) : undefined,
          notes: form.notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create invoice");
        return;
      }

      router.push("/admin/invoices");
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
          href="/admin/invoices"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Invoices
        </Link>
        <h1 className="text-2xl font-bold">Create Invoice</h1>
        <p className="text-muted-foreground">
          Generate a new client invoice. An invoice number will be assigned
          automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Client &amp; Job</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientId">Bill To (Client) *</Label>
              <Select
                value={form.clientId}
                onValueChange={(v) => set("clientId", v)}
              >
                <SelectTrigger id="clientId">
                  <SelectValue placeholder="Select a client..." />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jobId">Associated Job (optional)</Label>
              <Select
                value={form.jobId}
                onValueChange={(v) => set("jobId", v)}
              >
                <SelectTrigger id="jobId">
                  <SelectValue placeholder="Select a job..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {filteredJobs.map((j) => (
                    <SelectItem key={j.id} value={j.id}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Amount & Due Date */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Amount &amp; Due Date</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Invoice Amount ($) *</Label>
              <Input
                id="totalAmount"
                type="number"
                step="0.01"
                min="0"
                required
                value={form.totalAmount}
                onChange={(e) => set("totalAmount", e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(e) => set("dueDate", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Services rendered, payment instructions..."
              rows={4}
            />
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading || !form.clientId || !form.totalAmount}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Invoice
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/invoices">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
