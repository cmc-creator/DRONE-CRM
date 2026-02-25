import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  Building2,
  Briefcase,
  Receipt,
  Globe,
  Phone,
  Mail,
} from "lucide-react";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ClientDetailPage({ params }: Props) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: true,
      jobs: {
        orderBy: { createdAt: "desc" },
        take: 15,
        include: {
          assignments: {
            include: { pilot: { include: { user: true } } },
          },
          _count: { select: { files: true } },
        },
      },
      invoices: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!client) notFound();

  const totalBilled = client.invoices.reduce(
    (sum, inv) => sum + inv.totalAmount.toNumber(),
    0
  );
  const totalPaid = client.invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + inv.totalAmount.toNumber(), 0);
  const outstanding = totalBilled - totalPaid;

  const clientTypeLabel: Record<string, string> = {
    AGENCY: "Agency",
    COMMERCIAL: "Commercial",
    REAL_ESTATE: "Real Estate",
    OTHER: "Other",
  };

  const jobStatusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    PENDING_ASSIGNMENT: "bg-orange-100 text-orange-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    IN_PROGRESS: "bg-purple-100 text-purple-800",
    CAPTURE_COMPLETE: "bg-indigo-100 text-indigo-800",
    COMPLETED: "bg-green-100 text-green-800",
    DELIVERED: "bg-teal-100 text-teal-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const invoiceStatusColor: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-600",
    SENT: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    OVERDUE: "bg-red-100 text-red-800",
    VOID: "bg-gray-100 text-gray-400",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/clients"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Clients
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{client.companyName}</h1>
            <p className="text-muted-foreground">
              {clientTypeLabel[client.type] ?? client.type}
              {client.contactName ? ` — ${client.contactName}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                client.status === "ACTIVE"
                  ? "bg-green-100 text-green-800"
                  : client.status === "LEAD"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {client.status}
            </span>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/clients/${id}/edit`}>Edit</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/admin/jobs/new?clientId=${id}`}>+ New Job</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <p className="text-2xl font-bold">{client.jobs.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Billed</p>
            <p className="text-2xl font-bold">{formatCurrency(totalBilled)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Outstanding</p>
            <p className={`text-2xl font-bold ${outstanding > 0 ? "text-orange-600" : "text-green-600"}`}>
              {formatCurrency(outstanding)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4" /> Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-3">
            {client.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${client.email}`} className="hover:underline">
                  {client.email}
                </a>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href={`tel:${client.phone}`} className="hover:underline">
                  {client.phone}
                </a>
              </div>
            )}
            {client.website && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={client.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {client.website}
                </a>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {client.address && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                  Address
                </p>
                <p>{client.address}</p>
              </div>
            )}
            {client.notes && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">
                  Notes
                </p>
                <p className="italic">{client.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Portal Status */}
      {client.user && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-4 pb-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Client Portal Active</p>
              <p className="text-xs text-muted-foreground">
                Login: {client.user.email}
              </p>
            </div>
            <Badge variant="info">Portal Enabled</Badge>
          </CardContent>
        </Card>
      )}

      {/* Jobs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Briefcase className="h-4 w-4" /> Jobs
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/jobs/new?clientId=${id}`}>+ New Job</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {client.jobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 font-medium text-muted-foreground">Title</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Pilot</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Files</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Price</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {client.jobs.map((job) => {
                  const primaryPilot = job.assignments[0]?.pilot;
                  return (
                    <tr key={job.id}>
                      <td className="py-2">
                        <Link
                          href={`/admin/jobs/${job.id}`}
                          className="hover:underline text-blue-600"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="py-2">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${jobStatusColor[job.status] ?? ""}`}
                        >
                          {job.status.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="py-2">
                        {primaryPilot
                          ? primaryPilot.user.name ?? "—"
                          : "Unassigned"}
                      </td>
                      <td className="py-2">{job._count.files}</td>
                      <td className="py-2">
                        {job.clientPrice ? formatCurrency(job.clientPrice) : "—"}
                      </td>
                      <td className="py-2">
                        {formatDate(job.scheduledDate ?? job.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="h-4 w-4" /> Invoices
          </CardTitle>
          <Button asChild size="sm" variant="outline">
            <Link href={`/admin/invoices/new?clientId=${id}`}>+ New Invoice</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {client.invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No invoices yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 font-medium text-muted-foreground">Invoice #</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Amount</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {client.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2 font-mono">{inv.invoiceNumber}</td>
                    <td className="py-2">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${invoiceStatusColor[inv.status] ?? ""}`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2">
                      {inv.dueDate ? formatDate(inv.dueDate) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
