import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/ui/chat-widget";
import { TourGuide } from "@/components/admin/tour-guide";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bell } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await auth();
  } catch {
    redirect("/login");
  }

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const now = new Date();
  const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [overdueInvoices, unassignedJobs, overdueJobs, expiringDocs] = await Promise.all([
    prisma.invoice.count({ where: { status: { in: ["SENT", "OVERDUE"] }, dueDate: { lt: now } } }),
    prisma.job.count({ where: { status: "PENDING_ASSIGNMENT" } }),
    prisma.job.count({ where: { status: "ASSIGNED", scheduledDate: { lt: now } } }),
    prisma.complianceDoc.count({ where: { expiresAt: { gte: now, lte: thirtyDaysOut } } }),
  ]);

  let overdueLeads = 0;
  try {
    overdueLeads = await prisma.lead.count({
      where: { nextFollowUp: { lt: now }, status: { notIn: ["WON", "LOST"] } },
    });
  } catch {
    overdueLeads = 0;
  }

  const adminAlertCount = overdueInvoices + unassignedJobs + overdueJobs + expiringDocs + overdueLeads;

  return (
    <div className="flex min-h-screen" style={{ background: "#04080f" }}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar
          role="ADMIN"
          userName={session.user.name}
          userEmail={session.user.email}
          adminAlertCount={adminAlertCount}
        />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 pb-24 md:pb-8 page-enter">
          <div className="mb-4 flex items-center justify-end">
            <Link
              href="/admin/notifications"
              className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
              style={{
                borderColor: "rgba(0,212,255,0.2)",
                color: "#00d4ff",
                background: "rgba(0,212,255,0.05)",
              }}
            >
              <Bell className="w-4 h-4" />
              Notifications
              {adminAlertCount > 0 && (
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-bold"
                  style={{ background: "rgba(248,113,113,0.18)", color: "#f87171" }}
                >
                  {adminAlertCount}
                </span>
              )}
            </Link>
          </div>
          {children}
        </div>
      </main>
      <ChatWidget isAdmin />
      <TourGuide />
      <AdminMobileNav alertCount={adminAlertCount} />
    </div>
  );
}
