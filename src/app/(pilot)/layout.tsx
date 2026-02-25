import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/ui/chat-widget";

export default async function PilotLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user.role !== "PILOT" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#04080f" }}>
      <Sidebar
        role="PILOT"
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 page-enter">{children}</div>
      </main>
      <ChatWidget />
    </div>
  );
}
