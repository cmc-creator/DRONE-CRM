/**
 * Microsoft OneDrive — OAuth callback
 * Exchanges the auth code for tokens and stores them in the Account table.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code  = searchParams.get("code");
  const state = searchParams.get("state"); // userId passed in auth route
  const error = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin/integrations?onedrive=error&msg=${encodeURIComponent(
        errorDesc ?? error
      )}`
    );
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin/integrations?onedrive=error&msg=missing_code`
    );
  }

  const clientId     = process.env.MICROSOFT_CLIENT_ID!;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;
  const tenantId     = process.env.MICROSOFT_TENANT_ID ?? "common";
  const redirectUri  = `${process.env.NEXTAUTH_URL}/api/integrations/onedrive/callback`;

  // Exchange code for tokens
  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }),
    }
  );

  if (!tokenRes.ok) {
    const txt = await tokenRes.text();
    console.error("[onedrive callback] token exchange failed:", txt);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/admin/integrations?onedrive=error&msg=token_exchange_failed`
    );
  }

  const tokens: {
    access_token:  string;
    refresh_token: string;
    expires_in:    number;
    token_type:    string;
    scope:         string;
  } = await tokenRes.json();

  // Upsert into Account table (provider = "onedrive")
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider:          "onedrive",
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
      provider:          "onedrive",
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
    `${process.env.NEXTAUTH_URL}/admin/integrations?onedrive=connected`
  );
}
