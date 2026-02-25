import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/unauthorized");

  // Get or create the org record for this admin
  let org = await prisma.organization.findFirst({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">White-Label Settings</h1>
        <p className="text-muted-foreground mt-1">
          Customize branding for your CRM instance. Changes affect all users.
        </p>
      </div>
      <SettingsClient org={org} />
    </div>
  );
}
