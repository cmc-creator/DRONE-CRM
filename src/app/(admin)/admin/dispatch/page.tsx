import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { DispatchMapClient } from "./DispatchMapClient";

export default async function DispatchPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/unauthorized");

  const [pilots, jobs] = await Promise.all([
    prisma.pilot.findMany({
      where: { status: "ACTIVE" },
      include: {
        user: { select: { name: true, email: true } },
        markets: true,
      },
    }),
    prisma.job.findMany({
      where: { status: { in: ["PENDING", "SCHEDULED", "IN_PROGRESS"] } },
      include: {
        client: { select: { companyName: true } },
        assignments: {
          take: 1,
          orderBy: { assignedAt: "desc" },
          include: { pilot: { include: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { scheduledDate: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dispatch Map</h1>
        <p className="text-muted-foreground mt-1">
          Active pilots and pending jobs across your service area.
        </p>
      </div>
      <DispatchMapClient
        pilots={pilots.map((p) => ({
          id: p.id,
          name: p.user?.name ?? "Unknown",
          email: p.user?.email ?? "",
          markets: p.markets.map((m) => m.name),
          rating: p.rating ?? null,
          isActive: p.status === "ACTIVE",
        }))}
        jobs={jobs.map((j) => ({
          id: j.id,
          title: j.title,
          location: [j.city, j.state].filter(Boolean).join(", "),
          status: j.status,
          scheduledDate: j.scheduledDate?.toISOString() ?? null,
          client: j.client?.companyName ?? "",
          pilotName: j.assignments[0]?.pilot?.user?.name ?? null,
        }))}
      />
    </div>
  );
}
