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
import { FolderOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";

const fileTypeConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "success" | "info" }> = {
  PHOTO: { label: "Photo", variant: "info" },
  VIDEO: { label: "Video", variant: "default" },
  RAW: { label: "RAW", variant: "secondary" },
  PROCESSED: { label: "Processed", variant: "success" },
  REPORT: { label: "Report", variant: "outline" },
  OTHER: { label: "Other", variant: "outline" },
};

export default async function DeliverablesPage() {
  const files = await prisma.jobFile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      job: {
        select: {
          title: true,
          client: { select: { companyName: true } },
        },
      },
    },
  });

  const delivered = files.filter((f) => f.isDelivered).length;
  const pending = files.filter((f) => !f.isDelivered).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Deliverables</h1>
        <p className="text-muted-foreground mt-1">
          All aerial assets across projects
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Files", value: files.length },
          { label: "Delivered", value: delivered },
          { label: "Pending Delivery", value: pending },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <FolderOpen className="w-5 h-5 text-blue-600" />
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
          <CardTitle>All Files ({files.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {files.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No files uploaded yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Uploaded</TableHead>
                  <TableHead>Delivered</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => {
                  const fc = fileTypeConfig[file.type] ?? { label: file.type, variant: "outline" as const };
                  return (
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
                        {file.job.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.job.client.companyName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={fc.variant}>{fc.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.sizeMb ? `${file.sizeMb.toFixed(1)} MB` : "—"}
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
