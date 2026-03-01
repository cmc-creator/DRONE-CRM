import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface QBOTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  x_refresh_token_expires_in: number;
  token_type: string;
}

/**
 * GET /api/integrations/quickbooks/callback
 * Handles the QBO OAuth 2.0 callback — exchanges code for tokens and stores
 * the credentials in the Account table (provider = "quickbooks").
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.redirect(`${base}/login`);
  }

  const { searchParams } = new URL(req.url);
  const code    = searchParams.get("code");
  const realmId = searchParams.get("realmId"); // QBO company ID
  const state   = searchParams.get("state");
  const error   = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      `${base}/admin/integrations?qb=error&msg=${encodeURIComponent(error)}`
    );
  }

  if (!code || !realmId) {
    return NextResponse.redirect(
      `${base}/admin/integrations?qb=error&msg=Missing+code+or+realmId`
    );
  }

  // CSRF state validation
  const storedState = req.cookies.get("qbo_state")?.value;
  if (!storedState || state !== storedState) {
    return NextResponse.redirect(
      `${base}/admin/integrations?qb=error&msg=State+mismatch`
    );
  }

  const clientId     = process.env.QUICKBOOKS_CLIENT_ID ?? "";
  const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET ?? "";
  const redirectUri  = `${base}/api/integrations/quickbooks/callback`;

  // Exchange authorization code for access + refresh tokens
  const tokenRes = await fetch(
    "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
    {
      method:  "POST",
      headers: {
        "Content-Type":  "application/x-www-form-urlencoded",
        "Accept":        "application/json",
        "Authorization": `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type:   "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    }
  );

  if (!tokenRes.ok) {
    const msg = await tokenRes.text();
    return NextResponse.redirect(
      `${base}/admin/integrations?qb=error&msg=${encodeURIComponent("Token exchange failed: " + msg)}`
    );
  }

  const tokens = (await tokenRes.json()) as QBOTokenResponse;
  const expiresAt = Math.floor(Date.now() / 1000) + tokens.expires_in;

  // Upsert into Account table — realmId is the providerAccountId
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: { provider: "quickbooks", providerAccountId: realmId },
    },
    create: {
      userId:            session.user.id,
      type:              "oauth",
      provider:          "quickbooks",
      providerAccountId: realmId,
      access_token:      tokens.access_token,
      refresh_token:     tokens.refresh_token,
      expires_at:        expiresAt,
      token_type:        tokens.token_type,
      scope:             "com.intuit.quickbooks.accounting",
    },
    update: {
      userId:        session.user.id,
      access_token:  tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at:    expiresAt,
      token_type:    tokens.token_type,
    },
  });

  const res = NextResponse.redirect(`${base}/admin/integrations?qb=connected`);
  res.cookies.delete("qbo_state");
  return res;
}
