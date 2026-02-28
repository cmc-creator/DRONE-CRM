/**
 * Pilot Availability API
 *
 * GET    /api/pilots/[id]/availability?month=2026-04   — get availability for a month
 * POST   /api/pilots/[id]/availability                 — set/update a day's availability
 * DELETE /api/pilots/[id]/availability?date=2026-04-15 — remove an entry
 *
 * Pilots can manage their own availability.
 * Admins can read all pilot availability.
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Props { params: Promise<{ id: string }> }

// ─── GET ──────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Pilots can only view their own
  if (session.user.role === "PILOT") {
    const pilot = await prisma.pilot.findFirst({ where: { user: { id: session.user.id } }, select: { id: true } });
    if (!pilot || pilot.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const monthParam = req.nextUrl.searchParams.get("month"); // e.g. "2026-04"

  let where: { pilotId: string; date?: { gte: Date; lt: Date } } = { pilotId: id };

  if (monthParam) {
    const [year, month] = monthParam.split("-").map(Number);
    const start = new Date(year, month - 1, 1);
    const end   = new Date(year, month, 1);
    where = { ...where, date: { gte: start, lt: end } };
  }

  const availability = await prisma.pilotAvailability.findMany({
    where,
    orderBy: { date: "asc" },
  });

  return NextResponse.json(availability);
}

// ─── POST — set/update a day ──────────────────────────────────────────────────

export async function POST(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Pilots can only manage their own
  if (session.user.role === "PILOT") {
    const pilot = await prisma.pilot.findFirst({ where: { user: { id: session.user.id } }, select: { id: true } });
    if (!pilot || pilot.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { date, available, startTime, endTime, notes } = body;

  if (!date) return NextResponse.json({ error: "date is required" }, { status: 400 });

  const dayDate = new Date(date);
  dayDate.setUTCHours(0, 0, 0, 0);

  const entry = await prisma.pilotAvailability.upsert({
    where:  { pilotId_date: { pilotId: id, date: dayDate } },
    create: { pilotId: id, date: dayDate, available: available ?? true, startTime, endTime, notes },
    update: { available: available ?? true, startTime, endTime, notes },
  });

  return NextResponse.json(entry);
}

// ─── DELETE — remove a day entry ─────────────────────────────────────────────

export async function DELETE(req: NextRequest, { params }: Props) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Pilots can only manage their own
  if (session.user.role === "PILOT") {
    const pilot = await prisma.pilot.findFirst({ where: { user: { id: session.user.id } }, select: { id: true } });
    if (!pilot || pilot.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const dateParam = req.nextUrl.searchParams.get("date");
  if (!dateParam) return NextResponse.json({ error: "date query param required" }, { status: 400 });

  const dayDate = new Date(dateParam);
  dayDate.setUTCHours(0, 0, 0, 0);

  await prisma.pilotAvailability.deleteMany({
    where: { pilotId: id, date: dayDate },
  });

  return NextResponse.json({ success: true });
}
