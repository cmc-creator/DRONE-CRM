"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";

type PaymentStatus = "PENDING" | "APPROVED" | "PAID" | "VOID";

type PaymentRow = {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: string | null;
  notes: string | null;
  createdAt: string;
  paidAt: string | null;
  assignment: {
    id: string;
    job: { title: string; client: { companyName: string } };
  };
  pilot: { user: { name: string | null; email: string } };
};

type AssignmentRow = {
  id: string;
  pilot: { user: { name: string | null; email: string } };
  job: { title: string; pilotPayout: number | null; client: { companyName: string } };
};

const statusVariant: Record<PaymentStatus, "outline" | "secondary" | "destructive" | "success" | "warning" | "info" | "default"> = {
  PENDING: "warning",
  APPROVED: "info",
  PAID: "success",
  VOID: "secondary",
};

export default function AdminPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [unpaidAssignments, setUnpaidAssignments] = useState<AssignmentRow[]>([]);

  const [createAssignmentId, setCreateAssignmentId] = useState("");
  const [createAmount, setCreateAmount] = useState("");
  const [createMethod, setCreateMethod] = useState("");

  async function loadData() {
    const res = await fetch("/api/payouts", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load payouts");
    const data = await res.json();
    setPayments(data.payments ?? []);
    setUnpaidAssignments(data.unpaidAssignments ?? []);
  }

  useEffect(() => {
    loadData()
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totals = useMemo(() => {
    const paid = payments.filter((p) => p.status === "PAID").reduce((s, p) => s + Number(p.amount), 0);
    const pending = payments.filter((p) => p.status === "PENDING" || p.status === "APPROVED").reduce((s, p) => s + Number(p.amount), 0);
    return { paid, pending };
  }, [payments]);

  async function refresh() {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }

  async function createPayment() {
    if (!createAssignmentId) return;
    const payload: Record<string, unknown> = { assignmentId: createAssignmentId };
    if (createAmount) payload.amount = Number(createAmount);
    if (createMethod) payload.method = createMethod;

    const res = await fetch("/api/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert(err.error ?? "Failed to create payout");
      return;
    }

    setCreateAssignmentId("");
    setCreateAmount("");
    setCreateMethod("");
    await refresh();
  }

  async function updatePayment(id: string, patch: Partial<{ status: PaymentStatus; method: string; amount: number }>) {
    const res = await fetch(`/api/payouts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!res.ok) {
      alert("Failed to update payout");
      return;
    }

    await refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pilot Payouts</h1>
          <p className="text-muted-foreground mt-1">Track and manage pilot payments by assignment</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={refreshing}>
          <RefreshCcw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Paid Out</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totals.paid)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Pending / Approved</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(totals.pending)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Payout</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Select value={createAssignmentId} onValueChange={setCreateAssignmentId}>
            <SelectTrigger>
              <SelectValue placeholder="Select assignment" />
            </SelectTrigger>
            <SelectContent>
              {unpaidAssignments.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {(a.pilot.user.name ?? a.pilot.user.email)} · {a.job.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Amount"
            type="number"
            step="0.01"
            value={createAmount}
            onChange={(e) => setCreateAmount(e.target.value)}
          />

          <Input
            placeholder="Method (ACH, Zelle, Check)"
            value={createMethod}
            onChange={(e) => setCreateMethod(e.target.value)}
          />

          <Button onClick={createPayment} disabled={!createAssignmentId}>
            Create Payout
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Payouts ({payments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 text-sm text-muted-foreground">Loading…</div>
          ) : payments.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">No payouts yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Client / Job</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.pilot.user.name ?? "Pilot"}</div>
                      <div className="text-xs text-muted-foreground">{p.pilot.user.email}</div>
                    </TableCell>
                    <TableCell>
                      <div>{p.assignment.job.client.companyName}</div>
                      <div className="text-xs text-muted-foreground">{p.assignment.job.title}</div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(p.amount)}</TableCell>
                    <TableCell>
                      <Select
                        value={p.status}
                        onValueChange={(v: PaymentStatus) => updatePayment(p.id, { status: v })}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">PENDING</SelectItem>
                          <SelectItem value="APPROVED">APPROVED</SelectItem>
                          <SelectItem value="PAID">PAID</SelectItem>
                          <SelectItem value="VOID">VOID</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="mt-1">
                        <Badge variant={statusVariant[p.status]}>{p.status}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        defaultValue={p.method ?? ""}
                        className="h-8 w-[140px]"
                        onBlur={(e) => updatePayment(p.id, { method: e.target.value })}
                      />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(p.createdAt)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.paidAt ? formatDate(p.paidAt) : "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
