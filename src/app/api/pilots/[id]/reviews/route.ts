import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/pilots/[id]/reviews — list reviews + aggregate for a pilot
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const reviews = await prisma.pilotReview.findMany({
    where: { pilotId: id },
    orderBy: { createdAt: "desc" },
    include: {
      job: { select: { title: true, id: true } },
    },
  });

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
      : null;

  return NextResponse.json({ reviews, avgRating, totalReviews });
}

// POST /api/pilots/[id]/reviews — submit a review (admin only)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: pilotId } = await params;
  const { rating, comment, jobId } = await req.json();

  if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Rating must be an integer between 1 and 5" },
      { status: 400 }
    );
  }

  // Prevent duplicate review for same job+pilot
  if (jobId) {
    const existing = await prisma.pilotReview.findFirst({
      where: { pilotId, jobId },
    });
    if (existing) {
      return NextResponse.json(
        { error: "A review for this pilot + job already exists" },
        { status: 409 }
      );
    }
  }

  const review = await prisma.pilotReview.create({
    data: {
      pilotId,
      jobId: jobId ?? null,
      rating: Math.round(rating),
      comment: comment ?? null,
      reviewedBy: session.user.id,
    },
  });

  return NextResponse.json(review, { status: 201 });
}
