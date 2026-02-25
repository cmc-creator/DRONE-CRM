import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/unauthorized");

  const [currentUser, org, teamMembersRaw] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, preferences: true },
    }),
    prisma.organization.findFirst({
      orderBy: { createdAt: "asc" },
      select: {
        id: true, name: true, slug: true,
        logoUrl: true, faviconUrl: true,
        primaryColor: true, accentColor: true,
        customDomain: true, supportEmail: true,
        stripeAccountId: true,
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
        pilot: { select: { id: true } },
        client: { select: { id: true, companyName: true } },
      },
    }),
  ]);

  // Serialize Date → string so Next.js can pass these safely to the Client Component
  const teamMembers = teamMembersRaw.map((m) => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <SettingsClient
      currentUser={
        currentUser
          ? {
              ...currentUser,
              preferences: (currentUser.preferences ?? null) as Record<string, boolean> | null,
            }
          : null
      }
      org={org}
      teamMembers={teamMembers}
      currentUserId={session.user.id}
    />
  );
}
