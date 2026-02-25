import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, Calendar, FileDown, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Props { params: Promise<{ id: string }> }

const STATUS_CONFIG: Record<string, { label: string; color: string; Icon: typeof Clock }> = {
  DRAFT:              { label: "Draft",            color: "bg-slate-100 text-slate-600",   Icon: Clock },
  PENDING_ASSIGNMENT: { label: "Scheduled",        color: "bg-yellow-100 text-yellow-700", Icon: Clock },
  ASSIGNED:           { label: "Pilot Assigned",   color: "bg-blue-100 text-blue-700",     Icon: Clock },
  IN_PROGRESS:        { label: "In Progress",      color: "bg-cyan-100 text-cyan-700",     Icon: Clock },
  CAPTURE_COMPLETE:   { label: "Footage Captured", color: "bg-purple-100 text-purple-700", Icon: Clock },
  DELIVERED:          { label: "Delivered",        color: "bg-green-100 text-green-700",   Icon: CheckCircle },
  COMPLETED:          { label: "Completed",        color: "bg-green-100 text-green-700",   Icon: CheckCircle },
  CANCELLED:          { label: "Cancelled",        color: "bg-red-100 text-red-700",       Icon: AlertCircle },
};

const STEPS = [
  { key: "PENDING_ASSIGNMENT", label: "Booking Confirmed" },
  { key: "ASSIGNED",           label: "Pilot Assigned" },
  { key: "IN_PROGRESS",        label: "Shoot in Progress" },
  { key: "CAPTURE_COMPLETE",   label: "Footage Captured" },
  { key: "DELIVERED",          label: "Files Delivered" },
  { key: "COMPLETED",          label: "Project Complete" },
];

const STEP_ORDER = ["DRAFT", "PENDING_ASSIGNMENT", "ASSIGNED", "IN_PROGRESS", "CAPTURE_COMPLETE", "DELIVERED", "COMPLETED", "CANCELLED"];

export default async function ClientProjectDetailPage({ params }: Props) {
  const session = await auth();
  if (!session) return null;

  const { id } = await params;

  // Verify this job belongs to the logged-in client
  const clientRecord = await prisma.client.findFirst({ where: { user: { id: session.user.id } } });
  if (!clientRecord) return <p className="text-muted-foreground">Client not found.</p>;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      files: { where: { isDelivered: true }, orderBy: { deliveredAt: "desc" } },
      invoices: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!job || job.clientId !== clientRecord.id) notFound();

  const sc = STATUS_CONFIG[job.status] ?? STATUS_CONFIG["DRAFT"];
  const currentStepIdx = STEP_ORDER.indexOf(job.status);

  const FILE_TYPE_ICON: Record<string, string> = {
    PHOTO: "🖼️", VIDEO: "🎬", RAW: "📷", PROCESSED: "✨", REPORT: "📄", OTHER: "📎",
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link href="/client/projects" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Projects
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">{job.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground flex-wrap">
            {(job.city || job.state) && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {[job.city, job.state].filter(Boolean).join(", ")}
              </span>
            )}
            {job.scheduledDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(job.scheduledDate)}
              </span>
            )}
          </div>
        </div>
        <Badge className={sc.color}>{sc.label}</Badge>
      </div>

      {/* Progress Stepper */}
      {job.status !== "DRAFT" && job.status !== "CANCELLED" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-0 flex-wrap">
              {STEPS.map((step, i) => {
                const stepIdx = STEP_ORDER.indexOf(step.key);
                const done = currentStepIdx >= stepIdx;
                const active = STEP_ORDER[currentStepIdx] === step.key;
                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                        done ? "bg-primary border-primary text-primary-foreground" :
                               "border-muted bg-background text-muted-foreground"
                      } ${active ? "ring-2 ring-primary/30 ring-offset-1" : ""}`}>
                        {done ? "✓" : i + 1}
                      </div>
                      <p className={`text-xs mt-1 text-center max-w-[72px] leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`h-0.5 w-6 sm:w-10 mx-1 mb-5 rounded ${done && currentStepIdx > stepIdx ? "bg-primary" : "bg-muted"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {job.description && (
            <Card>
              <CardHeader><CardTitle className="text-base">Project Details</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{job.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Deliverables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileDown className="h-4 w-4" /> Deliverables
              </CardTitle>
            </CardHeader>
            <CardContent>
              {job.files.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  No files delivered yet. You&apos;ll be notified when your assets are ready.
                </p>
              ) : (
                <div className="space-y-2">
                  {job.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{FILE_TYPE_ICON[file.fileType] ?? "📎"}</span>
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          {file.deliveredAt && (
                            <p className="text-xs text-muted-foreground">Delivered {formatDate(file.deliveredAt)}</p>
                          )}
                        </div>
                      </div>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                      >
                        <FileDown className="h-3.5 w-3.5" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Invoices sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
            <CardContent>
              {job.invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices yet.</p>
              ) : (
                <div className="space-y-3">
                  {job.invoices.map((inv) => (
                    <Link key={inv.id} href="/client/invoices" className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">#{inv.invoiceNumber}</p>
                        <Badge variant={inv.status === "PAID" ? "success" : inv.status === "OVERDUE" ? "destructive" : "secondary"}>
                          {inv.status}
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold mt-1">{formatCurrency(Number(inv.totalAmount))}</p>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
