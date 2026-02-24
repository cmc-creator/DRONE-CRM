import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function ClientInvoicesPage() {
  const session = await auth();
  if (!session) return null;

  const client = await prisma.client.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      invoices: {
        orderBy: { createdAt: "desc" },
        include: { job: { select: { title: true } } },
      },
    },
  });

  if (!client) return <p className="text-muted-foreground">Client not found.</p>;

  const totalOwed = client.invoices
    .filter((i) => i.status === "SENT" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + Number(i.totalAmount), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoices</h1>
        {totalOwed > 0 && (
          <p className="text-muted-foreground mt-1">
            Outstanding balance:{" "}
            <span className="font-semibold text-foreground">
              {formatCurrency(totalOwed)}
            </span>
          </p>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {client.invoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No invoices yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono font-medium text-sm">
                      {inv.invoiceNumber}
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
                      <Badge
                        variant={
                          inv.status === "PAID"
                            ? "success"
                            : inv.status === "OVERDUE"
                            ? "destructive"
                            : inv.status === "SENT"
                            ? "info"
                            : "outline"
                        }
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
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
