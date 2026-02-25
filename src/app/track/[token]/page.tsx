import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, FileDown, Camera } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; step: number }> = {
  PENDING:     { label: "Order Received",   color: "#6b7280", step: 1 },
  SCHEDULED:   { label: "Flight Scheduled", color: "#00d4ff", step: 2 },
  IN_PROGRESS: { label: "Flying Now",       color: "#fbbf24", step: 3 },
  DELIVERED:   { label: "Delivered",        color: "#34d399", step: 4 },
  COMPLETED:   { label: "Complete",         color: "#34d399", step: 5 },
  CANCELLED:   { label: "Cancelled",        color: "#f87171", step: 0 },
};

export default async function TrackingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const job = await prisma.job.findFirst({
    where: { trackingToken: token },
    select: {
      id: true,
      title: true,
      status: true,
      scheduledDate: true,
      city: true,
      state: true,
      description: true,
      client: { select: { companyName: true } },
      assignments: {
        take: 1,
        orderBy: { assignedAt: "desc" },
        include: { pilot: { include: { user: { select: { name: true } } } } },
      },
      files: {
        where: { approvalStatus: "APPROVED", isDelivered: true },
        select: { id: true, name: true, url: true, type: true, sizeMb: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!job) notFound();

  const config = STATUS_CONFIG[job.status] ?? STATUS_CONFIG.PENDING;
  const steps = [
    { step: 1, label: "Order Received" },
    { step: 2, label: "Scheduled" },
    { step: 3, label: "In Flight" },
    { step: 4, label: "Delivered" },
    { step: 5, label: "Complete" },
  ];

  return (
    <div className="min-h-screen bg-[#04080f] text-[#d8e8f4]">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Camera className="h-6 w-6 text-[#00d4ff]" />
          <span className="font-bold text-lg tracking-tight">Lumin Aerial</span>
          <span className="text-xs text-[#5b7a99] ml-auto">Project Tracker</span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10 space-y-6">
        {/* Title card */}
        <Card className="bg-[#080f1e] border-white/5">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">{job.title}</CardTitle>
                {job.client?.companyName && (
                  <p className="text-sm text-[#5b7a99] mt-1">{job.client.companyName}</p>
                )}
              </div>
              <Badge
                className="shrink-0 text-xs font-semibold"
                style={{ background: config.color + "22", color: config.color, border: `1px solid ${config.color}40` }}
              >
                {config.label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {(job.city || job.state) && (
              <div className="flex items-center gap-2 text-[#5b7a99]">
                <MapPin className="h-4 w-4" />
                <span>{[job.city, job.state].filter(Boolean).join(", ")}</span>
              </div>
            )}
            {job.scheduledDate && (
              <div className="flex items-center gap-2 text-[#5b7a99]">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(job.scheduledDate).toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress stepper */}
        {job.status !== "CANCELLED" && (
          <Card className="bg-[#080f1e] border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-[#5b7a99] uppercase tracking-widest">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                {steps.map((s, i) => {
                  const done = config.step >= s.step;
                  const active = config.step === s.step;
                  return (
                    <div key={s.step} className="flex flex-1 items-center">
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{
                            background: done ? "#00d4ff" : "#1a2640",
                            color: done ? "#04080f" : "#5b7a99",
                            boxShadow: active ? "0 0 0 3px rgba(0,212,255,0.25)" : undefined,
                          }}
                        >
                          {s.step}
                        </div>
                        <span className="text-[10px] text-center text-[#5b7a99] leading-tight max-w-[56px]">
                          {s.label}
                        </span>
                      </div>
                      {i < steps.length - 1 && (
                        <div
                          className="flex-1 h-px mx-1 mb-4"
                          style={{ background: config.step > s.step ? "#00d4ff" : "#1a2640" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Deliverables */}
        {job.files.length > 0 && (
          <Card className="bg-[#080f1e] border-white/5">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-[#5b7a99] uppercase tracking-widest">
                Deliverables ({job.files.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {job.files.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-lg bg-white/3 hover:bg-white/5 transition-colors border border-white/5 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FileDown className="h-4 w-4 text-[#00d4ff] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-[#5b7a99]">
                        {file.type} {file.sizeMb ? `· ${file.sizeMb.toFixed(1)} MB` : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-[#00d4ff] font-semibold shrink-0 ml-4 group-hover:underline">
                    Download
                  </span>
                </a>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Pilot info */}
        {job.assignments?.[0]?.pilot?.user?.name && (
          <p className="text-center text-xs text-[#5b7a99]">
            Pilot: {job.assignments[0].pilot.user.name} · Powered by Lumin Aerial
          </p>
        )}
      </main>
    </div>
  );
}
