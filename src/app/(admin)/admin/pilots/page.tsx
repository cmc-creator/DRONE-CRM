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
import { Plus, UserCheck, UserX, Clock, Download } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { AutoScoreButton } from "./AutoScoreButton";

const statusConfig = {
  ACTIVE: { label: "Active", variant: "success" as const },
  INACTIVE: { label: "Inactive", variant: "secondary" as const },
  PENDING_REVIEW: { label: "Pending Review", variant: "warning" as const },
  SUSPENDED: { label: "Suspended", variant: "destructive" as const },
};

export default async function PilotsPage() {
  const pilots = await prisma.pilot.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      markets: true,
      equipment: true,
      _count: { select: { jobAssignments: true } },
    },
  });

  const stats = {
    total: pilots.length,
    active: pilots.filter((p) => p.status === "ACTIVE").length,
    pending: pilots.filter((p) => p.status === "PENDING_REVIEW").length,
    inactive: pilots.filter((p) => p.status === "INACTIVE").length,
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pilots</h1>
          <p className="text-muted-foreground mt-1">
            Manage your nationwide pilot network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <AutoScoreButton />
          <a href="/api/export/pilots" download>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </a>
          <Link href="/admin/pilots/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Pilot
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Pilots", value: stats.total, icon: null, color: "" },
          {
            label: "Active",
            value: stats.active,
            icon: UserCheck,
            color: "text-green-600",
          },
          {
            label: "Pending Review",
            value: stats.pending,
            icon: Clock,
            color: "text-yellow-600",
          },
          {
            label: "Inactive",
            value: stats.inactive,
            icon: UserX,
            color: "text-slate-400",
          },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              {s.icon && (
                <s.icon className={`w-5 h-5 flex-shrink-0 ${s.color}`} />
              )}
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pilots Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Pilots</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {pilots.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              No pilots yet.{" "}
              <Link href="/admin/pilots/new" className="text-primary hover:underline">
                Add your first pilot.
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Markets</TableHead>
                  <TableHead>FAA Cert</TableHead>
                  <TableHead>Equipment</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pilots.map((pilot) => {
                  const sc = statusConfig[pilot.status];
                  const faaValid =
                    pilot.faaExpiry && new Date(pilot.faaExpiry) > new Date();
                  return (
                    <TableRow key={pilot.id}>
                      <TableCell>
                        <Link
                          href={`/admin/pilots/${pilot.id}`}
                          className="font-medium text-primary hover:underline"
                        >
                          {pilot.user.name ?? "—"}
                        </Link>
                        {pilot.businessName && (
                          <p className="text-xs text-muted-foreground">
                            {pilot.businessName}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {pilot.user.email}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pilot.markets.length > 0
                          ? pilot.markets
                              .map((m) => m.state)
                              .join(", ")
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        {pilot.faaPartNumber ? (
                          <Badge
                            variant={faaValid ? "success" : "destructive"}
                          >
                            {faaValid ? "Valid" : "Expired"}
                          </Badge>
                        ) : (
                          <Badge variant="outline">None</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pilot.equipment.length} item
                        {pilot.equipment.length !== 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pilot._count.jobAssignments}
                      </TableCell>
                      <TableCell>
                        <Badge variant={sc.variant}>{sc.label}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {pilot.rating
                          ? <span className="text-amber-400 font-semibold">★ {pilot.rating.toFixed(1)}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(pilot.createdAt)}
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
