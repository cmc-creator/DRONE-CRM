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
import { ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const docTypeLabels: Record<string, string> = {
  FAA_PART107: "FAA Part 107",
  INSURANCE_COI: "Insurance COI",
  W9: "W-9",
  BACKGROUND_CHECK: "Background Check",
  EQUIPMENT_CERT: "Equipment Cert",
  OTHER: "Other",
};

const statusConfig = {
  PENDING: { label: "Pending Review", variant: "warning" as const },
  APPROVED: { label: "Approved", variant: "success" as const },
  EXPIRED: { label: "Expired", variant: "destructive" as const },
  REJECTED: { label: "Rejected", variant: "destructive" as const },
};

export default async function CompliancePage() {
  const pilots = await prisma.pilot.findMany({
    include: {
      user: { select: { name: true, email: true } },
      complianceDocs: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const allDocs = pilots.flatMap((p) =>
    p.complianceDocs.map((d) => ({ ...d, pilotName: p.user.name, pilotEmail: p.user.email, pilotId: p.id }))
  );

  const pendingCount = allDocs.filter((d) => d.status === "PENDING").length;
  const expiredCount = allDocs.filter((d) => d.status === "EXPIRED").length;
  const approvedCount = allDocs.filter((d) => d.status === "APPROVED").length;

  // Pilots missing required docs
  const requiredDocTypes = ["FAA_PART107", "INSURANCE_COI", "W9"] as const;
  const pilotsWithIssues = pilots.filter((p) => {
    return requiredDocTypes.some(
      (type) =>
        !p.complianceDocs.some(
          (d) => d.type === type && d.status === "APPROVED"
        )
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Compliance</h1>
        <p className="text-muted-foreground mt-1">
          FAA certifications, insurance, and required documents
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Documents",
            value: allDocs.length,
            icon: ShieldCheck,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            label: "Pending Review",
            value: pendingCount,
            icon: AlertTriangle,
            color: "text-yellow-600",
            bg: "bg-yellow-50",
          },
          {
            label: "Approved",
            value: approvedCount,
            icon: ShieldCheck,
            color: "text-green-600",
            bg: "bg-green-50",
          },
          {
            label: "Expired/Rejected",
            value: expiredCount,
            icon: ShieldAlert,
            color: "text-red-600",
            bg: "bg-red-50",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pilots with compliance issues */}
      {pilotsWithIssues.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="w-4 h-4" />
              Pilots Missing Required Documents ({pilotsWithIssues.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pilotsWithIssues.map((p) => {
                const missing = requiredDocTypes.filter(
                  (type) =>
                    !p.complianceDocs.some(
                      (d) => d.type === type && d.status === "APPROVED"
                    )
                );
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-2 border-b border-yellow-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{p.user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.user.email}
                      </p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end">
                      {missing.map((m) => (
                        <Badge key={m} variant="warning" className="text-xs">
                          Missing: {docTypeLabels[m]}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Documents */}
      <Card>
        <CardHeader>
          <CardTitle>All Compliance Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {allDocs.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No compliance documents on file yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pilot</TableHead>
                  <TableHead>Document Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allDocs.map((doc) => {
                  const sc = statusConfig[doc.status];
                  return (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <p className="font-medium text-sm">{doc.pilotName}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.pilotEmail}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {docTypeLabels[doc.type] ?? doc.type}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.expiresAt ? formatDate(doc.expiresAt) : "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(doc.createdAt)}
                      </TableCell>
                      <TableCell>
                        {doc.docUrl ? (
                          <a
                            href={doc.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline text-sm"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            None
                          </span>
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
