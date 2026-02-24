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
import { Briefcase, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PENDING_ASSIGNMENT: { label: "Needs Pilot", variant: "warning" },
  ASSIGNED: { label: "Assigned", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  CAPTURE_COMPLETE: { label: "Captured", variant: "secondary" },
  DELIVERED: { label: "Delivered", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default async function PilotDashboard() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      jobAssignments: {
        include: {
          job: {
            include: { client: { select: { companyName: true } } },
          },
          payment: true,
        },
        orderBy: { assignedAt: "desc" },
      },
      complianceDocs: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!pilot) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Your pilot profile is being set up. Please check back soon.</p>
      </div>
    );
  }

  const assignments = pilot.jobAssignments;
  const activeJobs = assignments.filter(
    (a) =>
      a.job.status === "ASSIGNED" || a.job.status === "IN_PROGRESS"
  ).length;
  const completedJobs = assignments.filter(
    (a) => a.job.status === "COMPLETED"
  ).length;
  const totalEarned = assignments
    .filter((a) => a.payment?.status === "PAID")
    .reduce((sum, a) => sum + Number(a.payment!.amount), 0);
  const pendingPay = assignments
    .filter((a) => a.payment?.status === "PENDING" || a.payment?.status === "APPROVED")
    .reduce((sum, a) => sum + Number(a.payment?.amount ?? 0), 0);

  const recentJobs = assignments.slice(0, 8);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground mt-1">Your Lumin Aerial overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Active Jobs",
            value: activeJobs,
            icon: Clock,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Completed Jobs",
            value: completedJobs,
            icon: CheckCircle2,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Total Earned",
            value: formatCurrency(totalEarned),
            icon: DollarSign,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            isString: true,
          },
          {
            label: "Pending Pay",
            value: formatCurrency(pendingPay),
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
                  <p className="text-2xl font-bold mt-1">
                    {s.isString ? s.value : s.value}
                  </p>
                </div>
                <div className={`p-2.5 rounded-xl ${s.bg}`}>
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Assignments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {recentJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No jobs assigned yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Job</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Payout</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentJobs.map((a) => {
                  const sc = statusConfig[a.job.status];
                  return (
                    <TableRow key={a.id}>
                      <TableCell>
                        <Link
                          href={`/pilot/jobs/${a.job.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {a.job.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.job.client.companyName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {a.job.city}, {a.job.state}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.job.scheduledDate
                          ? formatDate(a.job.scheduledDate)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(a.payment?.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc?.variant ?? "outline"}>
                          {sc?.label ?? a.job.status}
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

      {/* Compliance Status */}
      {pilot.complianceDocs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {["FAA_PART107", "INSURANCE_COI", "W9"].map((type) => {
                const doc = pilot.complianceDocs.find((d) => d.type === type);
                const labels: Record<string, string> = {
                  FAA_PART107: "FAA Part 107",
                  INSURANCE_COI: "Insurance COI",
                  W9: "W-9",
                };
                return (
                  <div
                    key={type}
                    className="flex items-center gap-2 text-sm bg-muted rounded-full px-3 py-1.5"
                  >
                    <span className="font-medium">{labels[type]}:</span>
                    {doc ? (
                      <Badge
                        variant={
                          doc.status === "APPROVED"
                            ? "success"
                            : doc.status === "EXPIRED"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {doc.status}
                      </Badge>
                    ) : (
                      <Badge variant="outline">Missing</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
