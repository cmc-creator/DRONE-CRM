/**
 * Microsoft OneDrive Integration — OAuth initiation
 *
 * Required env vars:
 *   MICROSOFT_CLIENT_ID      — Azure App Registration Client ID
 *   MICROSOFT_CLIENT_SECRET  — Azure App Registration Client Secret
 *   MICROSOFT_TENANT_ID      — "common" for personal+work, or your tenant GUID
 *   NEXTAUTH_URL             — your deployment URL
 *
 * Azure Portal setup:
 *   1. portal.azure.com → Azure Active Directory → App Registrations → New
 *   2. Supported account types: "Accounts in any org or personal Microsoft accounts"
 *   3. Redirect URI (Web): <NEXTAUTH_URL>/api/integrations/onedrive/callback
 *   4. API Permissions → Add:
 *      - Files.ReadWrite (Delegated)
 *      - offline_access (Delegated)
 *      - User.Read (Delegated)
 *   5. Certificates & Secrets → New client secret → copy value
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const SCOPES = [
  "Files.ReadWrite",
  "Files.ReadWrite.All",
  "offline_access",
  "User.Read",
].join(" ");

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId  = process.env.MICROSOFT_CLIENT_ID;
  const tenantId  = process.env.MICROSOFT_TENANT_ID ?? "common";
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/onedrive/callback`;

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "MICROSOFT_CLIENT_ID is not configured. See /admin/integrations for setup instructions.",
      },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         SCOPES,
    response_mode: "query",
    state:         session.user.id, // anti-CSRF: current user id
  });

  return NextResponse.redirect(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?${params}`
  );
}
