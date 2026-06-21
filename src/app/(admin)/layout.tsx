import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/ui/chat-widget";
import { TourGuide } from "@/components/admin/tour-guide";
import { AdminMobileNav } from "@/components/layout/admin-mobile-nav";

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

  return (
    <div className="flex min-h-screen" style={{ background: "#04080f" }}>
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar
          role="ADMIN"
          userName={session.user.name}
          userEmail={session.user.email}
        />
      </div>
      <main className="flex-1 overflow-auto">
        <div className="p-4 md:p-8 pb-24 md:pb-8 page-enter">{children}</div>
      </main>
      <ChatWidget isAdmin />
      <TourGuide />
      <AdminMobileNav />
    </div>
  );
}
