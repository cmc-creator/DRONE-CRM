import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Suspense } from "react";
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
import { Plus, Download, Map } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { CsvImportButton } from "@/components/admin/csv-import-button";
import { SearchFilterBar } from "@/components/admin/search-filter-bar";

const statusConfig = {
  LEAD: { label: "Lead", variant: "outline" as const },
  ACTIVE: { label: "Active", variant: "success" as const },
  INACTIVE: { label: "Inactive", variant: "secondary" as const },
  ARCHIVED: { label: "Archived", variant: "secondary" as const },
};

const typeConfig = {
  AGENCY: { label: "Agency", variant: "info" as const },
  COMMERCIAL: { label: "Commercial", variant: "default" as const },
  REAL_ESTATE: { label: "Real Estate", variant: "secondary" as const },
  OTHER: { label: "Other", variant: "outline" as const },
};

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const q = params.q?.toLowerCase();
  const statusFilter = params.status;
  const typeFilter = params.type;

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    where: {
      ...(statusFilter ? { status: statusFilter as never } : {}),
      ...(typeFilter ? { type: typeFilter as never } : {}),
      ...(q
        ? {
            OR: [
              { companyName: { contains: q, mode: "insensitive" } },
              { contactName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { city: { contains: q, mode: "insensitive" } },
              { state: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { jobs: true, invoices: true } },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Clients</h1>
          <p className="text-muted-foreground mt-1">
            Agencies, commercial orgs, and real estate clients
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CsvImportButton
            endpoint="/api/import/clients"
            label="Import CSV"
          />
          <a href="/api/export/clients" download>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </a>
          <Link href="/admin/clients/map">
            <Button variant="outline" size="sm">
              <Map className="w-4 h-4 mr-2" />
              Map View
            </Button>
          </Link>
          <Link href="/admin/clients/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </Link>
        </div>
      </div>

      <Suspense>
        <SearchFilterBar
          placeholder="Search clients by company, contact, email…"
          filters={[
            {
              key: "status",
              label: "Status",
              options: Object.entries(statusConfig).map(([v, c]) => ({ value: v, label: c.label })),
            },
            {
              key: "type",
              label: "Type",
              options: Object.entries(typeConfig).map(([v, c]) => ({ value: v, label: c.label })),
            },
          ]}
        />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle>All Clients ({clients.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No clients yet.{" "}
              <Link
                href="/admin/clients/new"
                className="text-primary hover:underline"
              >
                Add your first client.
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Invoices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => {
                  const sc = statusConfig[client.status];
                  const tc = typeConfig[client.type];
                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <Link
                          href={`/admin/clients/${client.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {client.companyName}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>{client.contactName ?? "—"}</div>
                        {client.email && (
                          <div className="text-muted-foreground text-xs">
                            {client.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={tc.variant}>{tc.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {client.city && client.state
                          ? `${client.city}, ${client.state}`
                          : client.state ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {client._count.jobs}
                      </TableCell>
                      <TableCell className="text-sm">
                        {client._count.invoices}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(client.createdAt)}
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
