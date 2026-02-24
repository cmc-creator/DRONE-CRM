import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Job, Client, JobAssignment, Pilot, User } from "@prisma/client";

type RecentJob = Job & {
  client: { companyName: string };
  assignments: (JobAssignment & {
    pilot: Pilot & { user: { name: string | null } };
  })[];
};

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

export function RecentJobsTable({ jobs }: { jobs: RecentJob[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No jobs yet. Create your first job to get started.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Job</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Pilot</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          const config = statusConfig[job.status] ?? { label: job.status, variant: "outline" as const };
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
                {job.city}, {job.state}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {pilot ?? <span className="italic">Unassigned</span>}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {job.scheduledDate
                  ? formatDate(job.scheduledDate)
                  : formatDate(job.createdAt)}
              </TableCell>
              <TableCell>
                <Badge variant={config.variant}>{config.label}</Badge>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
