import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams { params: Promise<{ id: string }> }

// GET /api/pilots/[id]/w9 — get W-9 status for a pilot (admin or self)
export async function GET(_req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Admin can fetch any pilot; pilot can only fetch their own
  if (session.user.role !== "ADMIN") {
    const pilot = await prisma.pilot.findFirst({ where: { userId: session.user.id } });
    if (!pilot || pilot.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const w9 = await prisma.w9Form.findUnique({ where: { pilotId: id } });
  return NextResponse.json(w9 ?? null);
}

// POST /api/pilots/[id]/w9 — pilot submits W-9 form data
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Only the pilot themselves (or admin) can submit
  if (session.user.role !== "ADMIN") {
    const pilot = await prisma.pilot.findFirst({ where: { userId: session.user.id } });
    if (!pilot || pilot.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const body = await req.json();
  const {
    legalName, businessName, taxClassification,
    tinType, tinLast4,
    address, city, state, zip,
    docUrl,
    certified,
  } = body;

  if (!legalName || !taxClassification || !tinType || !tinLast4 || !address || !city || !state || !zip) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!certified) {
    return NextResponse.json({ error: "Certification is required" }, { status: 400 });
  }
  if (tinLast4.length !== 4 || !/^\d{4}$/.test(tinLast4)) {
    return NextResponse.json({ error: "TIN last 4 digits must be exactly 4 numbers" }, { status: 400 });
  }

  const w9 = await prisma.w9Form.upsert({
    where: { pilotId: id },
    create: {
      pilotId: id,
      legalName,
      businessName: businessName || null,
      taxClassification,
      tinType,
      tinLast4,
      address,
      city,
      state,
      zip,
      docUrl: docUrl || null,
      certifiedAt: new Date(),
      reviewStatus: "PENDING",
    },
    update: {
      legalName,
      businessName: businessName || null,
      taxClassification,
      tinType,
      tinLast4,
      address,
      city,
      state,
      zip,
      docUrl: docUrl || null,
      certifiedAt: new Date(),
      reviewStatus: "PENDING",
      reviewedBy: null,
      reviewedAt: null,
      reviewNotes: null,
    },
  });

  // Create or refresh the compliance doc entry so admin sees it in the Documents queue
  await prisma.complianceDoc.upsert({
    where: {
      // Use a compound unique — we need to handle the case where there's already a W9 doc.
      // Since there's no unique on (pilotId, type), we find first then create/update.
      id: (await prisma.complianceDoc.findFirst({
        where: { pilotId: id, type: "W9" },
        select: { id: true },
      }))?.id ?? "nonexistent",
    },
    create: {
      pilotId: id,
      type: "W9",
      status: "PENDING",
      docName: `W-9 — ${legalName}`,
      docUrl: docUrl || null,
      notes: `Submitted via portal. TIN type: ${tinType}, last 4: ${tinLast4}`,
    },
    update: {
      status: "PENDING",
      docName: `W-9 — ${legalName}`,
      docUrl: docUrl || null,
      notes: `Resubmitted via portal. TIN type: ${tinType}, last 4: ${tinLast4}`,
      reviewedAt: null,
      reviewedBy: null,
    },
  });

  return NextResponse.json(w9, { status: 201 });
}

// PATCH /api/pilots/[id]/w9 — admin reviews W-9 (approve/reject)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { reviewStatus, reviewNotes } = await req.json();

  if (!["APPROVED", "REJECTED"].includes(reviewStatus)) {
    return NextResponse.json({ error: "Invalid reviewStatus" }, { status: 400 });
  }

  const w9 = await prisma.w9Form.update({
    where: { pilotId: id },
    data: {
      reviewStatus,
      reviewNotes: reviewNotes || null,
      reviewedBy: session.user.id,
      reviewedAt: new Date(),
    },
  });

  // Sync w9OnFile flag on Pilot
  await prisma.pilot.update({
    where: { id },
    data: { w9OnFile: reviewStatus === "APPROVED" },
  });

  // Sync compliance doc status
  const doc = await prisma.complianceDoc.findFirst({ where: { pilotId: id, type: "W9" } });
  if (doc) {
    await prisma.complianceDoc.update({
      where: { id: doc.id },
      data: {
        status: reviewStatus === "APPROVED" ? "APPROVED" : "REJECTED",
        reviewedBy: session.user.id,
        reviewedAt: new Date(),
        notes: reviewNotes || doc.notes,
      },
    });
  }

  return NextResponse.json(w9);
}
