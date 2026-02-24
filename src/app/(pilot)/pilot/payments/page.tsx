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
import { DollarSign } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

const statusConfig = {
  PENDING: { label: "Pending", variant: "warning" as const },
  APPROVED: { label: "Approved", variant: "info" as const },
  PAID: { label: "Paid", variant: "success" as const },
  VOID: { label: "Void", variant: "secondary" as const },
};

export default async function PilotPaymentsPage() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        include: {
          assignment: { include: { job: { select: { title: true, city: true, state: true } } } },
        },
      },
    },
  });

  if (!pilot) return <p className="text-muted-foreground">Profile not found.</p>;

  const totalPaid = pilot.payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = pilot.payments
    .filter((p) => p.status === "PENDING" || p.status === "APPROVED")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payments</h1>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Total Earned", value: formatCurrency(totalPaid), color: "text-green-600", bg: "bg-green-50" },
          { label: "Pending", value: formatCurrency(totalPending), color: "text-orange-600", bg: "bg-orange-50" },
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
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pilot.payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No payments yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Paid Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pilot.payments.map((p) => {
                  const sc = statusConfig[p.status];
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-sm">
                        {p.assignment.job.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.assignment.job.city}, {p.assignment.job.state}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(p.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.method ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p.paidAt ? formatDate(p.paidAt) : "—"}
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
