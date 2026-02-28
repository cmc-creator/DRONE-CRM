import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const TAX_CLASSIFICATION_LABELS: Record<string, string> = {
  INDIVIDUAL:   "Individual / Sole Proprietor",
  C_CORP:       "C Corporation",
  S_CORP:       "S Corporation",
  PARTNERSHIP:  "Partnership",
  LLC_C:        "LLC (C election)",
  LLC_S:        "LLC (S election)",
  LLC_P:        "LLC (Partnership election)",
  TRUST:        "Trust / Estate",
  OTHER:        "Other",
};

// GET /api/admin/tax/1099?year=2025
// Returns pilot payout totals for the given tax year, joined with W-9 data.
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get("year") ?? String(new Date().getFullYear()), 10);

  const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
  const endDate   = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const payments = await prisma.pilotPayment.findMany({
    where: {
      status: "PAID",
      paidAt: { gte: startDate, lt: endDate },
    },
    include: {
      pilot: {
        include: {
          user:   { select: { name: true, email: true } },
          w9Form: true,
        },
      },
    },
  });

  // Group by pilot
  const map = new Map<string, {
    pilotId: string;
    name: string;
    email: string;
    businessName: string | null;
    taxClassification: string | null;
    tinType: string | null;
    tinLast4: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    w9Status: string;         // NONE | PENDING | APPROVED | REJECTED
    totalPaid: number;
    paymentCount: number;
    requires1099: boolean;    // totalPaid >= $600
  }>();

  for (const p of payments) {
    const entry = map.get(p.pilotId);
    const w9 = p.pilot.w9Form;
    const amount = Number(p.amount);

    if (!entry) {
      map.set(p.pilotId, {
        pilotId:          p.pilotId,
        name:             p.pilot.user.name ?? "",
        email:            p.pilot.user.email,
        businessName:     w9?.businessName ?? p.pilot.businessName ?? null,
        taxClassification: w9 ? TAX_CLASSIFICATION_LABELS[w9.taxClassification] ?? w9.taxClassification : null,
        tinType:          w9?.tinType ?? null,
        tinLast4:         w9?.tinLast4 ?? null,
        address:          w9?.address ?? null,
        city:             w9?.city ?? null,
        state:            w9?.state ?? null,
        zip:              w9?.zip ?? null,
        w9Status:         w9 ? w9.reviewStatus : "NONE",
        totalPaid:        amount,
        paymentCount:     1,
        requires1099:     false, // recalculated below
      });
    } else {
      entry.totalPaid    += amount;
      entry.paymentCount += 1;
    }
  }

  const results = Array.from(map.values())
    .map((r) => ({ ...r, requires1099: r.totalPaid >= 600 }))
    .sort((a, b) => b.totalPaid - a.totalPaid);

  const summary = {
    year,
    totalPilots:        results.length,
    requires1099Count:  results.filter((r) => r.requires1099).length,
    missingW9Count:     results.filter((r) => r.w9Status !== "APPROVED" && r.requires1099).length,
    totalPayouts:       results.reduce((s, r) => s + r.totalPaid, 0),
  };

  return NextResponse.json({ summary, pilots: results });
}
