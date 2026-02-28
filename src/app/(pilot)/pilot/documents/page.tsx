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
import W9SubmitForm from "@/components/pilot/W9SubmitForm";

const docTypeLabels: Record<string, string> = {
  FAA_PART107: "FAA Part 107",
  INSURANCE_COI: "Insurance COI",
  W9: "W-9",
  BACKGROUND_CHECK: "Background Check",
  EQUIPMENT_CERT: "Equipment Cert",
  OTHER: "Other",
};

const statusConfig = {
  PENDING: { label: "Under Review", variant: "warning" as const },
  APPROVED: { label: "Approved", variant: "success" as const },
  EXPIRED: { label: "Expired", variant: "destructive" as const },
  REJECTED: { label: "Rejected", variant: "destructive" as const },
};

export default async function PilotDocumentsPage() {
  const session = await auth();
  if (!session) return null;

  const pilot = await prisma.pilot.findFirst({
    where: { user: { id: session.user.id } },
    include: {
      complianceDocs: { orderBy: { createdAt: "desc" } },
      w9Form: true,
    },
  });

  if (!pilot) return <p className="text-muted-foreground">Profile not found.</p>;

  const w9Approved = pilot.w9Form?.reviewStatus === "APPROVED";
  const requiredTypes = ["FAA_PART107", "INSURANCE_COI", "W9"];
  const missing = requiredTypes.filter(
    (type) => {
      if (type === "W9") return !w9Approved;
      return !pilot.complianceDocs.some((d) => d.type === type && d.status === "APPROVED");
    }
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Documents</h1>

      {missing.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="font-medium text-yellow-800 text-sm mb-1">
            Missing required documents:
          </p>
          <div className="flex gap-2 flex-wrap">
            {missing.map((m) => (
              <Badge key={m} variant="warning">
                {docTypeLabels[m]}
              </Badge>
            ))}
          </div>
          {missing.filter((m) => m !== "W9").length > 0 && (
            <p className="text-yellow-700 text-xs mt-2">
              For FAA and insurance docs, email to ops@nyxaerial.com
            </p>
          )}
        </div>
      )}

      {/* W-9 submission form */}
      <W9SubmitForm pilotId={pilot.id} existing={pilot.w9Form as Parameters<typeof W9SubmitForm>[0]["existing"]} />

      <Card>
        <CardHeader>
          <CardTitle>Compliance Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pilot.complianceDocs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No documents on file yet.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Document</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>File</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pilot.complianceDocs.map((doc) => {
                  const sc = statusConfig[doc.status];
                  return (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
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
                          <span className="text-muted-foreground text-sm">—</span>
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
