import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  User,
  FileDown,
  DollarSign,
  ClipboardList,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import JobStatusActions from "./JobStatusActions";
import { CopyTrackingLinkButton } from "./CopyTrackingLinkButton";
import ReviewWidget from "./ReviewWidget";

interface Props {
  params: Promise<{ id: string }>;
}

const statusColor: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING_ASSIGNMENT: "bg-orange-100 text-orange-800",
  ASSIGNED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-purple-100 text-purple-800",
  CAPTURE_COMPLETE: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  DELIVERED: "bg-teal-100 text-teal-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      client: true,
      assignments: {
        include: {
          pilot: {
            include: { user: true },
          },
          payment: true,
        },
      },
      files: { orderBy: { createdAt: "desc" } },
      invoices: true,
    },
  });

  if (!job) notFound();

  const totalPilotPay = job.assignments.reduce(
    (sum, a) => sum + (a.payment?.amount.toNumber() ?? 0),
    0
  );

  const jobTypeLabel: Record<string, string> = {
    REAL_ESTATE: "Real Estate",
    CONSTRUCTION: "Construction",
    MARKETING: "Marketing",
    EVENT: "Event",
    INSPECTION: "Inspection",
    MAPPING: "Mapping",
    OTHER: "Other",
  };

  const fileTypeIcon: Record<string, string> = {
    PHOTO: "🖼️",
    VIDEO: "🎬",
    RAW: "📷",
    PROCESSED: "🖼️",
    REPORT: "📄",
    OTHER: "📎",
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/jobs"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor[job.status] ?? ""}`}
              >
                {job.status.replace(/_/g, " ")}
              </span>
              {job.type && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  {jobTypeLabel[job.type] ?? job.type}
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Client:{" "}
              <Link
                href={`/admin/clients/${job.clientId}`}
                className="hover:underline text-blue-600"
              >
                {job.client.companyName}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <JobStatusActions jobId={id} currentStatus={job.status} />
            <CopyTrackingLinkButton jobId={id} trackingToken={job.trackingToken ?? null} />
            <Link href={`/admin/jobs/${id}/edit`}>
              <Button size="sm" variant="outline" className="gap-1">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick-stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Scheduled</p>
                <p className="font-medium text-sm">
                  {job.scheduledDate ? formatDate(job.scheduledDate) : "TBD"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-sm">{job.city ? `${job.city}, ${job.state}` : "Not set"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Client Price</p>
                <p className="font-medium text-sm">
                  {job.clientPrice ? formatCurrency(job.clientPrice) : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Pilot Pay</p>
                <p className="font-medium text-sm">
                  {totalPilotPay > 0 ? formatCurrency(totalPilotPay) : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" /> Job Details
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            {job.description && (
              <>
                <p className="text-muted-foreground">{job.description}</p>
                <Separator />
              </>
            )}
            {job.completedDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed</span>
                <span>{formatDate(job.completedDate)}</span>
              </div>
            )}
            {job.internalNotes && (
              <>
                <Separator />
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Internal Notes</p>
                  <p className="italic">{job.internalNotes}</p>
                </div>
              </>
            )}
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(job.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Pilot Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" /> Pilot Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {job.assignments.length === 0 ? (
              <div className="text-sm text-muted-foreground space-y-3">
                <p>No pilot assigned yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {job.assignments.map((a) => (
                  <div key={a.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          href={`/admin/pilots/${a.pilot.id}`}
                          className="font-medium hover:underline text-blue-600 text-sm"
                        >
                          {a.pilot.user.name}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {a.pilot.user.email}
                        </p>
                      </div>
                    </div>
                    {a.payment && (
                      <div className="text-sm bg-green-50 rounded px-3 py-2 flex justify-between">
                        <span className="text-muted-foreground">Payment</span>
                        <span className="font-medium text-green-700">
                          {formatCurrency(a.payment.amount)} — {a.payment.status}
                        </span>
                      </div>
                    )}
                    {a.notes && (
                      <p className="text-xs text-muted-foreground italic">{a.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Deliverables */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileDown className="h-4 w-4" /> Deliverables ({job.files.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {job.files.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No files uploaded yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left pb-2 font-medium text-muted-foreground">File</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Type</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Uploaded</th>
                  <th className="text-left pb-2 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {job.files.map((file) => (
                  <tr key={file.id}>
                    <td className="py-2">
                      <span className="mr-2">
                        {fileTypeIcon[file.type] ?? "📎"}
                      </span>
                      {file.name}
                    </td>
                    <td className="py-2 text-muted-foreground">
                      {file.type.replace(/_/g, " ")}
                    </td>
                    <td className="py-2">{formatDate(file.createdAt)}</td>
                    <td className="py-2">
                      {file.url && (
                        <a
                          href={file.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Invoices */}
      {job.invoices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Invoices</CardTitle>
          </CardHeader>
          <CardContent>
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
                {job.invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td className="py-2 font-mono">{inv.invoiceNumber}</td>
                    <td className="py-2">{formatCurrency(inv.totalAmount)}</td>
                    <td className="py-2">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          inv.status === "PAID"
                            ? "bg-green-100 text-green-800"
                            : inv.status === "OVERDUE"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
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
          </CardContent>
        </Card>
      )}

      {/* Pilot Review — shown when job is complete and a pilot is assigned */}
      {(job.status === "COMPLETED" || job.status === "DELIVERED") &&
        job.assignments.length > 0 &&
        job.assignments[0].pilot && (
          <ReviewWidget
            jobId={job.id}
            pilotId={job.assignments[0].pilot.id}
            pilotName={job.assignments[0].pilot.user.name ?? "Pilot"}
          />
        )}
    </div>
  );
}
