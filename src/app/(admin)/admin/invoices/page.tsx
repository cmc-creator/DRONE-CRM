import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, DollarSign } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusConfig = {
  DRAFT: { label: "Draft", variant: "outline" as const },
  SENT: { label: "Sent", variant: "info" as const },
  PAID: { label: "Paid", variant: "success" as const },
  OVERDUE: { label: "Overdue", variant: "destructive" as const },
  VOID: { label: "Void", variant: "secondary" as const },
};

export default async function InvoicesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      job: { select: { title: true } },
    },
  });

  const totals = {
    paid: invoices
      .filter((i) => i.status === "PAID")
      .reduce((sum, i) => sum + Number(i.totalAmount), 0),
    outstanding: invoices
      .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
      .reduce((sum, i) => sum + Number(i.totalAmount), 0),
    overdue: invoices
      .filter((i) => i.status === "OVERDUE")
      .reduce((sum, i) => sum + Number(i.totalAmount), 0),
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground mt-1">
            Client billing and revenue tracking
          </p>
        </div>
        <Link href="/admin/invoices/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </Link>
      </div>

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Paid",
            value: formatCurrency(totals.paid),
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Outstanding",
            value: formatCurrency(totals.outstanding),
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Overdue",
            value: formatCurrency(totals.overdue),
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <DollarSign className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices ({invoices.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {invoices.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No invoices yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => {
                  const sc = statusConfig[inv.status];
                  return (
                    <TableRow key={inv.id}>
                      <TableCell>
                        <Link
                          href={`/admin/invoices/${inv.id}`}
                          className="font-medium font-mono text-primary hover:underline"
                        >
                          {inv.invoiceNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {inv.client.companyName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.job?.title ?? "—"}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(inv.totalAmount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(inv.issueDate)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
