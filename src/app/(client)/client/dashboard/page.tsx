import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase, FileText, FolderOpen, DollarSign } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PENDING_ASSIGNMENT: { label: "Scheduling Pilot", variant: "warning" },
  ASSIGNED: { label: "Pilot Assigned", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  CAPTURE_COMPLETE: { label: "Footage Captured", variant: "secondary" },
  DELIVERED: { label: "Delivered", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default async function ClientDashboard() {
  const session = await auth();
  if (!session) return null;

  const client = await prisma.client.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      jobs: {
        orderBy: { createdAt: "desc" },
        include: {
          files: { where: { isDelivered: true } },
        },
      },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Your client account is being set up. Please contact Lumin Aerial.</p>
        <p className="mt-2 text-sm">
          <a href="mailto:bsargent@luminaerial.com" className="text-primary hover:underline">
            bsargent@luminaerial.com
          </a>
        </p>
      </div>
    );
  }

  const activeJobs = client.jobs.filter(
    (j) => !["COMPLETED", "CANCELLED", "DRAFT"].includes(j.status)
  ).length;
  const completedJobs = client.jobs.filter((j) => j.status === "COMPLETED").length;
  const totalFiles = client.jobs.reduce((sum, j) => sum + j.files.length, 0);
  const openInvoices = client.invoices.filter(
    (i) => i.status === "SENT" || i.status === "OVERDUE"
  ).reduce((sum, i) => sum + Number(i.totalAmount), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {client.companyName}</h1>
        <p className="text-muted-foreground mt-1">Your Lumin Aerial project portal</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active Projects",
            value: activeJobs,
            icon: Briefcase,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Completed",
            value: completedJobs,
            icon: Briefcase,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Deliverables",
            value: totalFiles,
            icon: FolderOpen,
            color: "text-purple-600",
            bg: "bg-purple-50",
          },
          {
            label: "Balance Due",
            value: formatCurrency(openInvoices),
            icon: DollarSign,
            color: "text-orange-600",
            bg: "bg-orange-50",
            isString: true,
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <p className="text-2xl font-bold mt-1">{s.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <Card>
        <CardHeader>
          <CardTitle>Your Projects</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {client.jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No projects yet. Contact us to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Deliverables</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.jobs.map((job) => {
                  const sc = statusConfig[job.status];
                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Link
                          href={`/client/projects/${job.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {job.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.city}, {job.state}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.scheduledDate ? formatDate(job.scheduledDate) : "TBD"}
                      </TableCell>
                      <TableCell>
                        {job.files.length > 0 ? (
                          <Badge variant="success">
                            {job.files.length} file{job.files.length !== 1 ? "s" : ""}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc?.variant ?? "outline"}>
                          {sc?.label ?? job.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Invoices */}
      {client.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {client.invoices.slice(0, 5).map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(inv.totalAmount)}
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
