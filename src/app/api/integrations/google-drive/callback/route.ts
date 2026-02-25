/**
 * Google Drive — OAuth callback
 * Exchanges the auth code for tokens and stores them in the Account table.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state"); // userId we passed in auth route
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin/integrations?gdrive=error&msg=${encodeURIComponent(error)}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin/integrations?gdrive=error&msg=missing_code`
    );
  }

  const clientId     = process.env.GOOGLE_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
  const redirectUri  = `${process.env.NEXTAUTH_URL}/api/integrations/google-drive/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id:     clientId,
      client_secret: clientSecret,
      redirect_uri:  redirectUri,
      grant_type:    "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    console.error("[gdrive callback] token exchange failed:", txt);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin/integrations?gdrive=error&msg=token_exchange_failed`
    );
  }

  const tokens: {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
    token_type:    string;
    scope:         string;
  } = await tokenRes.json();

  // Upsert into the Account table (provider = "google-drive")
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider:          "google-drive",
        providerAccountId: state, // userId
      },
    },
    update: {
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token ?? undefined,
      expires_at:    tokens.expires_in
        ? Math.floor(Date.now() / 1000) + tokens.expires_in
        : undefined,
      scope:      tokens.scope,
      token_type: tokens.token_type,
    },
    create: {
      userId:            state,
      provider:          "google-drive",
      providerAccountId: state,
      type:              "oauth",
      access_token:      tokens.access_token,
      refresh_token:     tokens.refresh_token ?? null,
      expires_at:        tokens.expires_in
        ? Math.floor(Date.now() / 1000) + tokens.expires_in
        : null,
      scope:      tokens.scope,
      token_type: tokens.token_type,
    },
  });

  return NextResponse.redirect(
    `${process.env.NEXTAUTH_URL}/admin/integrations?gdrive=connected`
  );
}
