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

  // Check if Microsoft OneDrive is connected
  const oneDriveAccount = userId
    ? await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider: "onedrive", providerAccountId: userId } },
        select: { access_token: true, expires_at: true },
      })
    : null;

  const oneDriveConnected  = !!oneDriveAccount?.access_token;
  const oneDriveExpired    = oneDriveAccount?.expires_at
    ? oneDriveAccount.expires_at < Math.floor(Date.now() / 1000)
    : false;

  return (
    <IntegrationsClient
      gdriveConnected={gdriveConnected && !gdriveExpired}
      oneDriveConnected={oneDriveConnected && !oneDriveExpired}
    />
  );
}
