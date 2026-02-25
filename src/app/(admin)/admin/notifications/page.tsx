import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AlertTriangle, Clock, FileWarning, ChevronRight, Bell } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const now = new Date();
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [overdueInvoices, unassignedJobs, overdueJobs, overdueLeads, expiringDocs] =
    await Promise.all([
      prisma.invoice.findMany({
        where: { status: { in: ["SENT", "OVERDUE"] }, dueDate: { lt: now } },
        include: { client: { select: { companyName: true } } },
        orderBy: { dueDate: "asc" },
        take: 20,
      }),
      prisma.job.findMany({
        where: { status: "PENDING_ASSIGNMENT" },
        include: { client: { select: { companyName: true } } },
        orderBy: { createdAt: "asc" },
        take: 20,
      }),
      prisma.job.findMany({
        where: { status: "ASSIGNED", scheduledDate: { lt: now } },
        include: {
          client: { select: { companyName: true } },
          assignments: { include: { pilot: { include: { user: { select: { name: true } } } } }, take: 1 },
        },
        orderBy: { scheduledDate: "asc" },
        take: 20,
      }),
      prisma.lead.findMany({
        where: { nextFollowUp: { lt: now }, status: { notIn: ["WON", "LOST"] } },
        orderBy: { nextFollowUp: "asc" },
        take: 20,
      }),
      prisma.complianceDoc.findMany({
        where: { expiresAt: { gte: now, lte: thirtyDaysOut } },
        include: { pilot: { include: { user: { select: { name: true } } } } },
        orderBy: { expiresAt: "asc" },
        take: 20,
      }),
    ]);

  const totalAlerts =
    overdueInvoices.length + unassignedJobs.length + overdueJobs.length +
    overdueLeads.length + expiringDocs.length;

  type AlertItem = { id: string; label: string; sub: string; href: string };
  type AlertSection = {
    key: string; title: string; color: string; icon: React.ElementType;
    count: number; items: AlertItem[];
  };

  const sections: AlertSection[] = [
    {
      key: "invoices", title: "Overdue Invoices", color: "#f87171", icon: AlertTriangle,
      count: overdueInvoices.length,
      items: overdueInvoices.map((inv) => ({
        id: inv.id,
        label: `Invoice #${inv.invoiceNumber} – ${inv.client?.companyName ?? "Unknown"}`,
        sub: `Due ${new Date(inv.dueDate!).toLocaleDateString()} · $${Number(inv.amount).toLocaleString()}`,
        href: `/admin/invoices/${inv.id}`,
      })),
    },
    {
      key: "unassigned", title: "Jobs Awaiting Pilot", color: "#fbbf24", icon: Clock,
      count: unassignedJobs.length,
      items: unassignedJobs.map((j) => ({
        id: j.id,
        label: j.title,
        sub: `${j.client?.companyName ?? "No client"} · Created ${new Date(j.createdAt).toLocaleDateString()}`,
        href: `/admin/jobs/${j.id}`,
      })),
    },
    {
      key: "overdue-jobs", title: "Overdue Missions", color: "#fb923c", icon: Clock,
      count: overdueJobs.length,
      items: overdueJobs.map((j) => ({
        id: j.id,
        label: j.title,
        sub: `${j.assignments[0]?.pilot?.user?.name ?? "No pilot"} · Scheduled ${new Date(j.scheduledDate!).toLocaleDateString()}`,
        href: `/admin/jobs/${j.id}`,
      })),
    },
    {
      key: "leads", title: "Overdue Follow-Ups", color: "#a78bfa", icon: Clock,
      count: overdueLeads.length,
      items: overdueLeads.map((l) => ({
        id: l.id,
        label: `${l.companyName} – ${l.contactName}`,
        sub: `Follow-up was due ${new Date(l.nextFollowUp!).toLocaleDateString()}`,
        href: `/admin/leads/${l.id}`,
      })),
    },
    {
      key: "docs", title: "Documents Expiring (30 days)", color: "#60a5fa", icon: FileWarning,
      count: expiringDocs.length,
      items: expiringDocs.map((d) => ({
        id: d.id,
        label: `${d.type.replace(/_/g, " ")} – ${d.pilot?.user?.name ?? "Unknown Pilot"}`,
        sub: `Expires ${new Date(d.expiresAt!).toLocaleDateString()}`,
        href: `/admin/documents/${d.id}`,
      })),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-2xl font-black tracking-wide"
            style={{
              background: "linear-gradient(135deg,#fff 0%,#f87171 60%,#fbbf24 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}
          >
            Notifications
          </h1>
          <p className="text-xs mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>
            {totalAlerts === 0 ? "All systems nominal" : `${totalAlerts} items need attention`}
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-xl"
          style={{
            background: totalAlerts > 0 ? "rgba(248,113,113,0.08)" : "rgba(52,211,153,0.08)",
            border: `1px solid ${totalAlerts > 0 ? "rgba(248,113,113,0.2)" : "rgba(52,211,153,0.2)"}`,
          }}
        >
          <Bell className="w-4 h-4" style={{ color: totalAlerts > 0 ? "#f87171" : "#34d399" }} />
          <span className="text-sm font-bold" style={{ color: totalAlerts > 0 ? "#f87171" : "#34d399" }}>
            {totalAlerts > 0 ? `${totalAlerts} Alerts` : "All Clear"}
          </span>
        </div>
      </div>

      {totalAlerts === 0 ? (
        <div
          className="rounded-2xl p-16 text-center"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(0,212,255,0.08)" }}
        >
          <p className="text-4xl mb-3">?</p>
          <p className="text-lg font-bold" style={{ color: "#34d399" }}>All Systems Nominal</p>
          <p className="text-sm mt-1" style={{ color: "rgba(0,212,255,0.4)" }}>No alerts or overdue items — great work!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections
            .filter((s) => s.count > 0)
            .map((section) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.key}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${section.color}20` }}
                >
                  <div
                    className="flex items-center justify-between px-5 py-3"
                    style={{ borderBottom: `1px solid ${section.color}15`, background: `${section.color}08` }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" style={{ color: section.color }} />
                      <span className="text-sm font-bold" style={{ color: section.color }}>{section.title}</span>
                    </div>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: `${section.color}18`, color: section.color }}
                    >
                      {section.count}
                    </span>
                  </div>
                  <div className="divide-y" style={{ borderColor: `${section.color}0a` }}>
                    {section.items.map((item) => (
                      <Link key={item.id} href={item.href}>
                        <div
                          className="flex items-center gap-4 px-5 py-3 transition-colors hover:bg-white/[0.02] cursor-pointer"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate" style={{ color: "#d8e8f4" }}>{item.label}</p>
                            <p className="text-xs truncate mt-0.5" style={{ color: "rgba(0,212,255,0.4)" }}>{item.sub}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(0,212,255,0.25)" }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
