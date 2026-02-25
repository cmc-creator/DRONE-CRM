/**
 * Google Drive Integration — OAuth initiation
 *
 * Required env vars:
 *   GOOGLE_CLIENT_ID      — from Google Cloud Console
 *   GOOGLE_CLIENT_SECRET  — from Google Cloud Console
 *   NEXTAUTH_URL          — your deployment URL (for redirect back)
 *
 * Google Cloud Console setup:
 *   1. Create a project at console.cloud.google.com
 *   2. Enable "Google Drive API"
 *   3. OAuth consent screen → add scope: https://www.googleapis.com/auth/drive.file
 *   4. Credentials → Create OAuth client ID → Web
 *      Authorized redirect URI: <NEXTAUTH_URL>/api/integrations/google-drive/callback
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const SCOPES = [
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.readonly",
].join(" ");

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId    = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/integrations/google-drive/callback`;

  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_CLIENT_ID is not configured. See /admin/integrations for setup instructions." },
      { status: 503 }
    );
  }

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         SCOPES,
    access_type:   "offline",
    prompt:        "consent",
    state:         session.user.id,           // anti-CSRF: current user id
  });

  return NextResponse.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
}
