import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/unauthorized");

  const [currentUser, org, teamMembers] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, name: true, email: true, image: true, preferences: true, createdAt: true },
    }),
    prisma.organization.findFirst({ orderBy: { createdAt: "asc" } }),
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

  return (
    <SettingsClient
      currentUser={currentUser}
      org={org}
      teamMembers={teamMembers}
      currentUserId={session.user.id}
    />
  );
}
