import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { randomBytes } from "crypto";

/**
 * GET /api/integrations/quickbooks/connect
 * Builds the QuickBooks Online OAuth 2.0 authorization URL and redirects.
 */
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.QUICKBOOKS_CLIENT_ID;
  const base = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (!clientId) {
    return NextResponse.redirect(
      `${base}/admin/integrations?qb=error&msg=QUICKBOOKS_CLIENT_ID+not+configured`
    );
  }

  const state = randomBytes(16).toString("hex");
  const redirectUri = `${base}/api/integrations/quickbooks/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    scope:         "com.intuit.quickbooks.accounting",
    redirect_uri:  redirectUri,
    response_type: "code",
    state,
  });

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?${params}`;

  const res = NextResponse.redirect(authUrl);
  // Store state for CSRF check in callback
  res.cookies.set("qbo_state", state, {
    httpOnly:  true,
    sameSite:  "lax",
    maxAge:    600,
    path:      "/",
  });
  return res;
}
