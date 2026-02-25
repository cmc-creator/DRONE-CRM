/**
 * Google Drive — File listing & upload
 *
 * GET  /api/integrations/google-drive/files?folderId=...  — list files in a folder
 * POST /api/integrations/google-drive/files               — upload a file to Drive
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Helper: get a valid access token for the current admin ─────────────────

async function getAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findUnique({
    where: {
      provider_providerAccountId: {
        provider:          "google-drive",
        providerAccountId: userId,
      },
    },
  });

  if (!account?.access_token) return null;

  // If token is expired, refresh it
  if (account.expires_at && account.expires_at < Math.floor(Date.now() / 1000)) {
    if (!account.refresh_token) return null;

    const refreshRes = await fetch("https://oauth2.googleapis.com/token", {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id:     process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type:    "refresh_token",
        refresh_token: account.refresh_token,
      }),
    });

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

// ─── List files ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getAccessToken(session.user.id);
  if (!token) {
    return NextResponse.json(
      { error: "Google Drive not connected. Visit /admin/integrations to connect." },
      { status: 403 }
    );
  }

  const folderId = req.nextUrl.searchParams.get("folderId") ?? "root";
  const query    = req.nextUrl.searchParams.get("q") ?? "";

  let qParam = `'${folderId}' in parents and trashed = false`;
  if (query) qParam += ` and name contains '${query.replace(/'/g, "\\'")}'`;

  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?` +
      new URLSearchParams({
        q:       qParam,
        fields:  "files(id,name,mimeType,size,modifiedTime,webViewLink,thumbnailLink,parents)",
        orderBy: "modifiedTime desc",
        pageSize: "50",
      }),
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!driveRes.ok) {
    const err = await driveRes.json();
    return NextResponse.json({ error: err }, { status: driveRes.status });
  }

  return NextResponse.json(await driveRes.json());
}

// ─── Upload a file to Drive ──────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await getAccessToken(session.user.id);
  if (!token) {
    return NextResponse.json(
      { error: "Google Drive not connected" },
      { status: 403 }
    );
  }

  const form      = await req.formData();
  const file      = form.get("file") as File | null;
  const folderId  = (form.get("folderId") as string) || null;

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  const metadata = JSON.stringify({
    name:    file.name,
    parents: folderId ? [folderId] : undefined,
  });

  const body = new FormData();
  body.append("metadata", new Blob([metadata], { type: "application/json" }));
  body.append("file", file);

  const uploadRes = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
    {
      method:  "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    return NextResponse.json({ error: err }, { status: uploadRes.status });
  }

  return NextResponse.json(await uploadRes.json(), { status: 201 });
}
