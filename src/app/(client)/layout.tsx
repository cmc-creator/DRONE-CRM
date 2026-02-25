import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { ChatWidget } from "@/components/ui/chat-widget";

export default async function ClientLayout({
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

  if (!session || (session.user.role !== "CLIENT" && session.user.role !== "ADMIN")) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#04080f" }}>
      <Sidebar
        role="CLIENT"
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
