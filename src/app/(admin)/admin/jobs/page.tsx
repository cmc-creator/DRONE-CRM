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
import { Plus } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

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

const typeLabels: Record<string, string> = {
  REAL_ESTATE: "Real Estate",
  CONSTRUCTION: "Construction",
  MARKETING: "Marketing",
  INSPECTION: "Inspection",
  MAPPING: "Mapping",
  EVENT: "Event",
  OTHER: "Other",
};

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      assignments: {
        include: {
          pilot: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });

  // Group by status for quick count
  const counts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Dispatch, track, and manage all aerial projects
          </p>
        </div>
        <Link href="/admin/jobs/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Job
          </Button>
        </Link>
      </div>

      {/* Quick status filters */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(statusConfig).map(([key, val]) => (
          <div
            key={key}
            className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted rounded-full px-3 py-1"
          >
            <Badge variant={val.variant} className="text-xs">
              {counts[key] ?? 0}
            </Badge>
            {val.label}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs ({jobs.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {jobs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No jobs yet.{" "}
              <Link
                href="/admin/jobs/new"
                className="text-primary hover:underline"
              >
                Create your first job.
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.map((job) => {
                  const sc = statusConfig[job.status];
                  const pilot = job.assignments[0]?.pilot?.user?.name;
                  return (
                    <TableRow key={job.id}>
                      <TableCell>
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {job.title}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.client.companyName}
                      </TableCell>
                      <TableCell className="text-sm">
                        {typeLabels[job.type] ?? job.type}
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.city}, {job.state}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {pilot ?? (
                          <span className="italic text-muted-foreground">
                            Unassigned
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {job.scheduledDate
                          ? formatDate(job.scheduledDate)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {formatCurrency(job.clientPrice)}
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
