import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
import { formatDate, formatCurrency } from "@/lib/utils";
import Link from "next/link";

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }
> = {
  DRAFT: { label: "Draft", variant: "outline" },
  PENDING_ASSIGNMENT: { label: "Pending", variant: "warning" },
  ASSIGNED: { label: "Assigned", variant: "info" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  CAPTURE_COMPLETE: { label: "Captured", variant: "secondary" },
  DELIVERED: { label: "Delivered", variant: "success" },
  COMPLETED: { label: "Completed", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "destructive" },
};

export default async function PilotJobsPage() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({
    where: { user: { id: session.user.id } },
  });

  if (!pilot) return <p className="text-muted-foreground">Profile not found.</p>;

  const assignments = await prisma.jobAssignment.findMany({
    where: { pilotId: pilot.id },
    orderBy: { assignedAt: "desc" },
    include: {
      job: {
        include: { client: { select: { companyName: true } } },
      },
      payment: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Jobs</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {assignments.length === 0 ? (
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
                {assignments.map((a) => {
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
                        {a.job.scheduledDate ? formatDate(a.job.scheduledDate) : "—"}
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
    </div>
  );
}
