import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MessageThread from "@/components/messaging/MessageThread";
import { MessageCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ClientMessagesPage() {
  const session = await auth();
  if (!session) return null;

  const client = await prisma.client.findFirst({ where: { user: { id: session.user.id } } });
  if (!client) return <p className="text-muted-foreground">Client not found.</p>;

  const jobs = await prisma.job.findMany({
    where:   { clientId: client.id, status: { not: "CANCELLED" } },
    orderBy: { updatedAt: "desc" },
    select:  { id: true, title: true, status: true },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">Communicate with the operations team about your projects.</p>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed">
          <MessageCircle className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No projects yet</p>
          <p className="text-xs text-muted-foreground mt-1">Messages will appear here once you have active projects.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {jobs.map((job) => (
            <MessageThread
              key={job.id}
              jobId={job.id}
              jobTitle={job.title}
              currentUserId={session.user.id}
              currentRole={session.user.role}
            />
          ))}
        </div>
      )}
    </div>
  );
}
