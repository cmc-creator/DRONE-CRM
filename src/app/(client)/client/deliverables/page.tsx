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
import { formatDate } from "@/lib/utils";
import { ApprovalButtons } from "./ApprovalButtons";

const fileTypeConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "success" | "info" }> = {
  PHOTO: { label: "Photo", variant: "info" },
  VIDEO: { label: "Video", variant: "default" },
  RAW: { label: "RAW", variant: "secondary" },
  PROCESSED: { label: "Processed", variant: "success" },
  REPORT: { label: "Report", variant: "outline" },
  OTHER: { label: "Other", variant: "outline" },
};

export default async function ClientDeliverablesPage() {
  const session = await auth();
  if (!session) return null;

  const client = await prisma.client.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      jobs: {
        include: {
          files: { where: { isDelivered: true }, orderBy: { deliveredAt: "desc" } },
        },
      },
    },
  });

  if (!client) return <p className="text-muted-foreground">Client not found.</p>;

  const allFiles = client.jobs.flatMap((j) =>
    j.files.map((f) => ({ ...f, jobTitle: j.title }))
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Deliverables</h1>
        <p className="text-muted-foreground mt-1">
          Download your aerial assets
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Available Files ({allFiles.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No deliverables yet. Files will appear here once your project is complete.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Delivered</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allFiles.map((file) => {
                  const fc = fileTypeConfig[file.type] ?? { label: file.type, variant: "outline" as const };
                  return (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium text-sm">
                        {file.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.jobTitle}
                      </TableCell>
                      <TableCell>
                        <Badge variant={fc.variant}>{fc.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.sizeMb ? `${file.sizeMb.toFixed(1)} MB` : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.deliveredAt ? formatDate(file.deliveredAt) : "—"}
                      </TableCell>
                      <TableCell>
                        <ApprovalButtons
                          jobId={file.jobId}
                          fileId={file.id}
                          currentStatus={file.approvalStatus ?? "PENDING"}
                        />
                      </TableCell>
                      <TableCell>
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary font-medium hover:underline"
                        >
                          Download
                        </a>
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
