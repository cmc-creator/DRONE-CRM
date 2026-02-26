import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * POST /api/dev/seed
 * Creates demo data for testing. Safe to run multiple times — checks for
 * existing demo records by email before creating.
 */
export async function POST() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: string[] = [];

  // ── Demo Pilot 1 ───────────────────────────────────────────────────────────
  let pilot1User = await prisma.user.findUnique({ where: { email: "demo.pilot1@test.local" } });
  if (!pilot1User) {
    const pw = await bcrypt.hash("demo1234", 12);
    pilot1User = await prisma.user.create({
      data: {
        name: "Demo Pilot — Jake M.",
        email: "demo.pilot1@test.local",
        password: pw,
        role: "PILOT",
        pilot: {
          create: {
            phone: "602-555-DEMO",
            city: "Phoenix",
            state: "AZ",
            zip: "85001",
            businessName: "Demo Sky Aerial",
            faaPartNumber: "DEMO-001",
            faaExpiry: new Date("2027-01-01"),
            insuranceCarrier: "Demo Insurance Co.",
            insurancePolicyNum: "DEMO-POL-001",
            insuranceExpiry: new Date("2027-01-01"),
            status: "ACTIVE",
            rating: 4.9,
            w9OnFile: true,
            markets: { create: [{ state: "AZ", city: "Phoenix" }] },
          },
        },
      },
    });
    results.push("✓ Pilot: demo.pilot1@test.local (pw: demo1234)");
  } else {
    results.push("• Pilot demo.pilot1@test.local already exists — skipped");
  }

  // ── Demo Client 1 ──────────────────────────────────────────────────────────
  let client1User = await prisma.user.findUnique({ where: { email: "demo.client1@test.local" } });
  if (!client1User) {
    const pw = await bcrypt.hash("demo1234", 12);
    client1User = await prisma.user.create({
      data: {
        name: "Demo Client — Alex R.",
        email: "demo.client1@test.local",
        password: pw,
        role: "CLIENT",
        client: {
          create: {
            companyName: "Demo Agency LLC",
            contactName: "Alex Rivera",
            phone: "213-555-DEMO",
            city: "Los Angeles",
            state: "CA",
          },
        },
      },
    });
    results.push("✓ Client: demo.client1@test.local (pw: demo1234)");
  } else {
    results.push("• Client demo.client1@test.local already exists — skipped");
  }

  // ── Demo Client 2 ──────────────────────────────────────────────────────────
  let client2User = await prisma.user.findUnique({ where: { email: "demo.client2@test.local" } });
  if (!client2User) {
    const pw = await bcrypt.hash("demo1234", 12);
    client2User = await prisma.user.create({
      data: {
        name: "Demo Client — Morgan B.",
        email: "demo.client2@test.local",
        password: pw,
        role: "CLIENT",
        client: {
          create: {
            companyName: "Demo Real Estate Group",
            contactName: "Morgan Blake",
            phone: "312-555-DEMO",
            city: "Chicago",
            state: "IL",
          },
        },
      },
    });
    results.push("✓ Client: demo.client2@test.local (pw: demo1234)");
  } else {
    results.push("• Client demo.client2@test.local already exists — skipped");
  }

  // ── Demo Jobs ──────────────────────────────────────────────────────────────
  const client1 = await prisma.client.findFirst({ where: { user: { email: "demo.client1@test.local" } } });
  const client2 = await prisma.client.findFirst({ where: { user: { email: "demo.client2@test.local" } } });
  const pilot1  = await prisma.pilot.findFirst({  where: { user: { email: "demo.pilot1@test.local" } } });

  let jobsCreated = 0;
  const existingDemoJob = await prisma.job.findFirst({ where: { title: { startsWith: "[DEMO]" } } });

  if (!existingDemoJob && client1 && client2 && pilot1) {
    const job1 = await prisma.job.create({
      data: {
        title: "[DEMO] Retail Store Exterior Survey",
        type: "MARKETING",
        status: "COMPLETED",
        clientId: client1.id,
        address: "100 Demo St",
        city: "Los Angeles",
        state: "CA",
        scheduledDate: new Date("2026-02-01"),
        completedDate: new Date("2026-02-01"),
        clientPrice: 850,
        pilotPayout: 500,
        deliverables: "50 edited photos, 30-second highlight reel",
        notes: "Demo job created by Dev Tools",
      },
    });
    await prisma.jobAssignment.create({
      data: { jobId: job1.id, pilotId: pilot1.id, status: "COMPLETED" },
    });

    const job2 = await prisma.job.create({
      data: {
        title: "[DEMO] Luxury Property Listing — Lake Shore",
        type: "REAL_ESTATE",
        status: "ASSIGNED",
        clientId: client2.id,
        address: "500 Lake Shore Dr",
        city: "Chicago",
        state: "IL",
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        clientPrice: 1200,
        pilotPayout: 700,
        deliverables: "HDR photos + 2-minute video walkthrough",
        notes: "Demo job created by Dev Tools",
      },
    });
    await prisma.jobAssignment.create({
      data: { jobId: job2.id, pilotId: pilot1.id, status: "ACCEPTED" },
    });

    jobsCreated = 2;
    results.push(`✓ ${jobsCreated} demo jobs created`);

    // ── Demo Invoice ────────────────────────────────────────────────────────
    const inv = await prisma.invoice.create({
      data: {
        invoiceNumber: `DEMO-${Date.now()}`,
        clientId: client1.id,
        jobId: job1.id,
        status: "PAID",
        subtotal: 850,
        tax: 0,
        totalAmount: 850,
        dueDate: new Date("2026-02-15"),
        paidAt: new Date("2026-02-10"),
        notes: "Demo invoice created by Dev Tools",
      },
    });
    results.push(`✓ Demo invoice created: ${inv.invoiceNumber}`);

    // ── Demo Contract ───────────────────────────────────────────────────────
    await prisma.contract.create({
      data: {
        title: "[DEMO] Service Agreement — Demo Agency LLC",
        type: "CLIENT_SERVICE",
        status: "SIGNED",
        clientId: client1.id,
        signedByName: "Alex Rivera",
        signedByEmail: "demo.client1@test.local",
        signedAt: new Date("2026-01-15"),
        notes: "Demo contract created by Dev Tools",
        content: "This is a demo service agreement created for testing purposes. Replace with actual contract content.",
      },
    });
    results.push("✓ Demo contract created");
  } else if (existingDemoJob) {
    results.push("• Demo jobs already exist — skipped");
  }

  return NextResponse.json({
    success: true,
    message: "Demo data seeded",
    results,
    credentials: {
      pilot:   { email: "demo.pilot1@test.local",  password: "demo1234" },
      client1: { email: "demo.client1@test.local", password: "demo1234" },
      client2: { email: "demo.client2@test.local", password: "demo1234" },
    },
  });
}
