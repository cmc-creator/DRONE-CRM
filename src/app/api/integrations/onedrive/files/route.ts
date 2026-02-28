/**
 * OneDrive — File listing & upload via Microsoft Graph API
 *
 * GET  /api/integrations/onedrive/files?folderId=...  — list items in a folder
 * POST /api/integrations/onedrive/files               — upload a file
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Helper: get a valid access token ────────────────────────────────────────

async function getAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider: "onedrive",
        providerAccountId: userId,
      },
    },
  });

  if (!account?.access_token) return null;

  // If token is expired, refresh it
  if (account.expires_at && account.expires_at < Math.floor(Date.now() / 1000)) {
    if (!account.refresh_token) return null;

    const tenantId = process.env.MICROSOFT_TENANT_ID ?? "common";
    const refreshRes = await fetch(
      `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id:     process.env.MICROSOFT_CLIENT_ID!,
          client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
          grant_type:    "refresh_token",
          refresh_token: account.refresh_token,
        }),
      }
    );

    if (!refreshRes.ok) return null;

    const { access_token, expires_in } = await refreshRes.json();

    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token,
        expires_at: Math.floor(Date.now() / 1000) + expires_in,
      },
    });

    return access_token as string;
  }

  return account.access_token;
}

// ─── List files ───────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getAccessToken(session.user.id);
  if (!token) {
    return NextResponse.json(
      { error: "OneDrive not connected. Visit /admin/integrations to connect." },
      { status: 403 }
    );
  }

  const folderId = req.nextUrl.searchParams.get("folderId");
  const query    = req.nextUrl.searchParams.get("q") ?? "";

  // Build Graph API URL
  let graphUrl: string;
  if (query) {
    graphUrl = `https://graph.microsoft.com/v1.0/me/drive/root/search(q='${encodeURIComponent(query)}')` +
      `?$select=id,name,file,folder,size,lastModifiedDateTime,webUrl,thumbnails&$orderby=lastModifiedDateTime desc&$top=50`;
  } else if (folderId && folderId !== "root") {
    graphUrl = `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}/children` +
      `?$select=id,name,file,folder,size,lastModifiedDateTime,webUrl&$orderby=lastModifiedDateTime desc&$top=50`;
  } else {
    graphUrl = `https://graph.microsoft.com/v1.0/me/drive/root/children` +
      `?$select=id,name,file,folder,size,lastModifiedDateTime,webUrl&$orderby=lastModifiedDateTime desc&$top=50`;
  }

  const graphRes = await fetch(graphUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!graphRes.ok) {
    const err = await graphRes.json();
    return NextResponse.json({ error: err }, { status: graphRes.status });
  }

  const data = await graphRes.json();

  // Normalize to same shape as Google Drive response for easier client use
  const files = (data.value ?? []).map((item: {
    id: string; name: string; file?: { mimeType: string }; folder?: object;
    size?: number; lastModifiedDateTime: string; webUrl?: string;
  }) => ({
    id:             item.id,
    name:           item.name,
    mimeType:       item.file?.mimeType ?? (item.folder ? "application/vnd.ms-onedrive.folder" : "application/octet-stream"),
    isFolder:       !!item.folder,
    size:           item.size ?? 0,
    modifiedTime:   item.lastModifiedDateTime,
    webViewLink:    item.webUrl,
  }));

  return NextResponse.json({ files });
}

// ─── Upload a file ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getAccessToken(session.user.id);
  if (!token) {
    return NextResponse.json(
      { error: "OneDrive not connected. Visit /admin/integrations to connect." },
      { status: 403 }
    );
  }

  const form     = await req.formData();
  const file     = form.get("file") as File | null;
  const folderId = (form.get("folderId") as string) ?? "";

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();

  // Simple upload (< 4 MB) via PUT
  const uploadUrl = folderId && folderId !== "root"
    ? `https://graph.microsoft.com/v1.0/me/drive/items/${folderId}:/${encodeURIComponent(file.name)}:/content`
    : `https://graph.microsoft.com/v1.0/me/drive/root:/${encodeURIComponent(file.name)}:/content`;

  const uploadRes = await fetch(uploadUrl, {
    method:  "PUT",
    headers: {
      Authorization:  `Bearer ${token}`,
      "Content-Type": file.type || "application/octet-stream",
    },
    body: bytes,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    return NextResponse.json({ error: err }, { status: uploadRes.status });
  }

  const uploaded = await uploadRes.json();
  return NextResponse.json({ file: { id: uploaded.id, name: uploaded.name, webViewLink: uploaded.webUrl } }, { status: 201 });
}
