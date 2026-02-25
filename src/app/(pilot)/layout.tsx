import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/ui/chat-widget";
import { PilotMobileNav } from "@/components/layout/pilot-mobile-nav";

export default async function PilotLayout({
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

  if (!session || (session.user.role !== "PILOT" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#04080f" }}>
      {/* Sidebar — hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar
          role="PILOT"
          userName={session.user.name}
          userEmail={session.user.email}
        />
      </div>
      <main className="flex-1 overflow-auto">
        {/* pb-20 on mobile leaves room for the bottom nav bar */}
        <div className="p-4 md:p-8 pb-24 md:pb-8 page-enter">{children}</div>
      </main>
      <ChatWidget />
      <PilotMobileNav />
    </div>
  );
}
