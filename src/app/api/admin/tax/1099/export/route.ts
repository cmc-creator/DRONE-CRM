import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/admin/tax/1099/export?year=2025
// Downloads a CSV of 1099-NEC data for the specified tax year.
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
    name: string;
    email: string;
    businessName: string;
    taxClassification: string;
    tinType: string;
    tinDisplay: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    w9Status: string;
    totalPaid: number;
  }>();

  for (const p of payments) {
    const entry = map.get(p.pilotId);
    const w9 = p.pilot.w9Form;
    const amount = Number(p.amount);

    const tinDisplay = w9
      ? w9.tinType === "SSN"
        ? `***-**-${w9.tinLast4}`
        : `**-***${w9.tinLast4}`
      : "N/A — W-9 Missing";

    if (!entry) {
      map.set(p.pilotId, {
        name:             w9?.legalName ?? p.pilot.user.name ?? "",
        email:            p.pilot.user.email,
        businessName:     w9?.businessName ?? p.pilot.businessName ?? "",
        taxClassification: w9?.taxClassification ?? "",
        tinType:          w9?.tinType ?? "",
        tinDisplay,
        address:          w9?.address ?? "",
        city:             w9?.city ?? "",
        state:            w9?.state ?? "",
        zip:              w9?.zip ?? "",
        w9Status:         w9 ? w9.reviewStatus : "NONE",
        totalPaid:        amount,
      });
    } else {
      entry.totalPaid += amount;
    }
  }

  const rows = Array.from(map.values())
    .filter((r) => r.totalPaid >= 600)
    .sort((a, b) => b.totalPaid - a.totalPaid);

  const headers = [
    "Tax Year",
    "Legal Name",
    "Business Name",
    "Tax Classification",
    "TIN Type",
    "TIN (masked)",
    "Address",
    "City",
    "State",
    "ZIP",
    "Email",
    "Total Paid",
    "W-9 Status",
    "1099 Required",
  ];

  function esc(val: string | number) {
    const s = String(val);
    if (s.includes(",") || s.includes('"') || s.includes("\n")) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  }

  const csvLines = [
    headers.map(esc).join(","),
    ...rows.map((r) =>
      [
        year,
        r.name,
        r.businessName,
        r.taxClassification,
        r.tinType,
        r.tinDisplay,
        r.address,
        r.city,
        r.state,
        r.zip,
        r.email,
        r.totalPaid.toFixed(2),
        r.w9Status,
        r.totalPaid >= 600 ? "YES" : "NO",
      ]
        .map(esc)
        .join(",")
    ),
  ];

  const csv = csvLines.join("\r\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="1099-nec-${year}.csv"`,
    },
  });
}
