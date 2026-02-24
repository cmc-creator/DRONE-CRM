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

export default async function PilotDeliverablesPage() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      jobAssignments: {
        include: {
          job: {
            include: {
              files: { orderBy: { createdAt: "desc" } },
              client: { select: { companyName: true } },
            },
          },
        },
      },
    },
  });

  if (!pilot) return <p className="text-muted-foreground">Profile not found.</p>;

  const allFiles = pilot.jobAssignments.flatMap((a) =>
    a.job.files.map((f) => ({
      ...f,
      jobTitle: a.job.title,
      clientName: a.job.client.companyName,
    }))
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Deliverables</h1>
      <Card>
        <CardHeader>
          <CardTitle>All Uploaded Files ({allFiles.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No files uploaded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allFiles.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline text-sm"
                      >
                        {file.name}
                      </a>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.jobTitle}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {file.clientName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(file.createdAt)}
                    </TableCell>
                    <TableCell>
                      {file.isDelivered ? (
                        <Badge variant="success">Delivered</Badge>
                      ) : (
                        <Badge variant="outline">Pending</Badge>
                      )}
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
