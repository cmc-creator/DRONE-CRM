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

export default async function ClientProjectsPage() {
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
    },
  });

  if (!client) return <p className="text-muted-foreground">Client not found.</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Projects</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Projects ({client.jobs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {client.jobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No projects yet. Contact NyxAerial to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Price</TableHead>
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
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(job.clientPrice)}
                      </TableCell>
                      <TableCell>
                        {job.files.length > 0 ? (
                          <Badge variant="success">{job.files.length} ready</Badge>
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
    </div>
  );
}
