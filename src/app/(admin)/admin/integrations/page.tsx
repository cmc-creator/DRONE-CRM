import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import IntegrationsClient from "./IntegrationsClient";

export default async function IntegrationsPage() {
  const session = await auth();
  const userId  = session?.user?.id ?? "";

  // Check if Google Drive is connected for this admin
  const gdriveAccount = userId
    ? await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider: "google-drive", providerAccountId: userId } },
        select: { access_token: true, expires_at: true },
      })
    : null;

  const gdriveConnected = !!gdriveAccount?.access_token;
  const gdriveExpired   = gdriveAccount?.expires_at
    ? gdriveAccount.expires_at < Math.floor(Date.now() / 1000)
    : false;

  return <IntegrationsClient gdriveConnected={gdriveConnected && !gdriveExpired} />;
}
