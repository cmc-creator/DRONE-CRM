import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Plus, FileSignature } from "lucide-react";
import { formatDate } from "@/lib/utils";

const statusConfig = {
  DRAFT:  { label: "Draft",  className: "bg-gray-100 text-gray-600" },
  SENT:   { label: "Sent",   className: "bg-blue-100 text-blue-800" },
  SIGNED: { label: "Signed", className: "bg-green-100 text-green-800" },
  VOID:   { label: "Void",   className: "bg-red-100 text-red-600" },
};

const typeLabel: Record<string, string> = {
  PILOT_AGREEMENT: "Pilot Agreement",
  CLIENT_SERVICE:  "Client Service",
  NDA:             "NDA",
  SUBCONTRACTOR:   "Subcontractor",
  OTHER:           "Other",
};

export default async function ContractsPage() {
  const contracts = await prisma.contract.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      client: { select: { companyName: true } },
      pilot:  { select: { user: { select: { name: true } } } },
    },
  });

  const counts = {
    total:  contracts.length,
    signed: contracts.filter((c) => c.status === "SIGNED").length,
    pending: contracts.filter((c) => c.status === "SENT").length,
    draft:  contracts.filter((c) => c.status === "DRAFT").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground mt-1">Create, send, and track signed agreements</p>
        </div>
        <Link href="/admin/contracts/new">
          <Button><Plus className="w-4 h-4 mr-2" /> New Contract</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: counts.total,   color: "text-foreground",    bg: "bg-muted" },
          { label: "Signed",  value: counts.signed, color: "text-green-700",    bg: "bg-green-50" },
          { label: "Awaiting", value: counts.pending, color: "text-blue-700",   bg: "bg-blue-50" },
          { label: "Draft",   value: counts.draft,  color: "text-gray-600",     bg: "bg-gray-50" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className={`p-5 ${s.bg} rounded-xl`}>
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSignature className="w-4 h-4" /> All Contracts ({contracts.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {contracts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No contracts yet. Create your first one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Party</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Signed</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((c) => {
                  const party = c.client?.companyName ?? c.pilot?.user.name ?? "—";
                  const sc = statusConfig[c.status as keyof typeof statusConfig];
                  return (
                    <TableRow key={c.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{c.title}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{typeLabel[c.type] ?? c.type}</TableCell>
                      <TableCell className="text-sm">{party}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${sc?.className}`}>
                          {sc?.label}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(c.createdAt)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{c.signedAt ? formatDate(c.signedAt) : "—"}</TableCell>
                      <TableCell>
                        <Link href={`/admin/contracts/${c.id}`} className="text-sm text-primary hover:underline">
                          View
                        </Link>
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
