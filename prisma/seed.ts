import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Lumin Aerial CRM...");

  // Clean up existing data
  await prisma.complianceDoc.deleteMany();
  await prisma.pilotPayment.deleteMany();
  await prisma.jobAssignment.deleteMany();
  await prisma.jobFile.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.job.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.pilotMarket.deleteMany();
  await prisma.pilot.deleteMany();
  await prisma.client.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      name: "Bailey Sargent",
      email: "bsargent@luminaerial.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin: ${admin.email}`);

  // Pilot 1
  const pilotPassword = await bcrypt.hash("pilot123", 12);
  const pilot1User = await prisma.user.create({
    data: {
      name: "Jake Martinez",
      email: "jake@example.com",
      password: pilotPassword,
      role: "PILOT",
      pilot: {
        create: {
          phone: "602-555-0101",
          city: "Phoenix",
          state: "AZ",
          zip: "85001",
          businessName: "Desert Sky Aerial",
          faaPartNumber: "4827593",
          faaExpiry: new Date("2026-08-15"),
          insuranceCarrier: "State Farm",
          insurancePolicyNum: "SF-7839201",
          insuranceExpiry: new Date("2025-12-31"),
          status: "ACTIVE",
          rating: 4.8,
          w9OnFile: true,
          markets: {
            create: [
              { state: "AZ", city: "Phoenix" },
              { state: "AZ", city: "Scottsdale" },
              { state: "NV", city: "Las Vegas" },
            ],
          },
          equipment: {
            create: [
              {
                make: "DJI",
                model: "Mavic 3 Pro",
                serialNumber: "DJI-MP3-4490112",
                cameraSpec: "4/3 CMOS, 20MP Hasselblad",
                verified: true,
              },
              {
                make: "DJI",
                model: "Air 3",
                serialNumber: "DJI-A3-1198844",
                cameraSpec: "1/1.3 CMOS, 48MP",
                verified: true,
              },
            ],
          },
          complianceDocs: {
            create: [
              {
                type: "FAA_PART107",
                status: "APPROVED",
                docName: "FAA_Part107_Jake.pdf",
                expiresAt: new Date("2026-08-15"),
              },
              {
                type: "INSURANCE_COI",
                status: "APPROVED",
                docName: "Insurance_COI_Jake.pdf",
                expiresAt: new Date("2025-12-31"),
              },
              {
                type: "W9",
                status: "APPROVED",
                docName: "W9_Jake.pdf",
              },
            ],
          },
        },
      },
    },
    include: { pilot: true },
  });
  console.log(`✅ Pilot: ${pilot1User.email}`);

  // Pilot 2
  const pilot2User = await prisma.user.create({
    data: {
      name: "Sarah Chen",
      email: "sarah@example.com",
      password: pilotPassword,
      role: "PILOT",
      pilot: {
        create: {
          phone: "720-555-0202",
          city: "Denver",
          state: "CO",
          zip: "80202",
          businessName: "Alpine Aerial Media",
          faaPartNumber: "5839401",
          faaExpiry: new Date("2027-03-20"),
          status: "ACTIVE",
          rating: 4.9,
          w9OnFile: true,
          markets: {
            create: [
              { state: "CO", city: "Denver" },
              { state: "CO", city: "Boulder" },
              { state: "UT", city: "Salt Lake City" },
            ],
          },
          equipment: {
            create: [
              {
                make: "DJI",
                model: "Inspire 3",
                serialNumber: "DJI-I3-9900234",
                cameraSpec: "Full Frame 54MP ZENMUSE X9",
                verified: true,
              },
            ],
          },
          complianceDocs: {
            create: [
              {
                type: "FAA_PART107",
                status: "APPROVED",
                docName: "FAA_Part107_Sarah.pdf",
                expiresAt: new Date("2027-03-20"),
              },
              {
                type: "INSURANCE_COI",
                status: "PENDING",
                docName: "Insurance_Sarah_pending.pdf",
              },
            ],
          },
        },
      },
    },
    include: { pilot: true },
  });
  console.log(`✅ Pilot: ${pilot2User.email}`);

  // Client 1
  const clientPassword = await bcrypt.hash("client123", 12);
  const client1User = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "alex@creativepulse.com",
      password: clientPassword,
      role: "CLIENT",
    },
  });

  const client1 = await prisma.client.create({
    data: {
      userId: client1User.id,
      companyName: "Creative Pulse Agency",
      contactName: "Alex Johnson",
      email: "alex@creativepulse.com",
      phone: "212-555-0303",
      website: "https://creativepulse.com",
      type: "AGENCY",
      status: "ACTIVE",
      city: "New York",
      state: "NY",
      zip: "10001",
      billingEmail: "billing@creativepulse.com",
      source: "Website",
    },
  });
  console.log(`✅ Client: ${client1.companyName}`);

  // Client 2
  const client2 = await prisma.client.create({
    data: {
      companyName: "Sunbelt Development Corp",
      contactName: "Marcus Williams",
      email: "marcus@sunbelt.dev",
      phone: "480-555-0404",
      type: "COMMERCIAL",
      status: "ACTIVE",
      city: "Scottsdale",
      state: "AZ",
      zip: "85260",
      source: "Referral",
    },
  });
  console.log(`✅ Client: ${client2.companyName}`);

  // Client 3
  const client3 = await prisma.client.create({
    data: {
      companyName: "Premier Properties Group",
      contactName: "Linda Park",
      email: "linda@premierproperties.com",
      phone: "602-555-0505",
      type: "REAL_ESTATE",
      status: "LEAD",
      city: "Phoenix",
      state: "AZ",
      zip: "85004",
      source: "LinkedIn",
    },
  });
  console.log(`✅ Client: ${client3.companyName}`);

  // Jobs
  const job1 = await prisma.job.create({
    data: {
      clientId: client1.id,
      title: "Spring Campaign Aerial Coverage – Phoenix",
      description: "Aerial footage for Q2 marketing campaign. Need wide establishing shots, building exteriors, and neighborhood context.",
      type: "MARKETING",
      status: "COMPLETED",
      city: "Phoenix",
      state: "AZ",
      zip: "85001",
      scheduledDate: new Date("2026-01-15"),
      completedDate: new Date("2026-01-15"),
      duration: 180,
      deliverables: "4K video clips (10-15 total), 20 edited photos, RAW files",
      clientPrice: 1200,
      pilotPayout: 650,
      priority: 2,
      assignments: {
        create: {
          pilotId: pilot1User.pilot!.id,
          acceptedAt: new Date("2026-01-10"),
        },
      },
    },
  });

  const job2 = await prisma.job.create({
    data: {
      clientId: client2.id,
      title: "Sunbelt Mesa Project – Progress Survey",
      description: "Monthly construction progress documentation for 40-acre development site.",
      type: "CONSTRUCTION",
      status: "IN_PROGRESS",
      city: "Mesa",
      state: "AZ",
      zip: "85205",
      scheduledDate: new Date("2026-02-25"),
      duration: 240,
      deliverables: "Orthomosaic map, progress photos (50+), video walkthrough",
      clientPrice: 1800,
      pilotPayout: 900,
      priority: 1,
      assignments: {
        create: {
          pilotId: pilot1User.pilot!.id,
          acceptedAt: new Date("2026-02-20"),
        },
      },
    },
  });

  const job3 = await prisma.job.create({
    data: {
      clientId: client2.id,
      title: "Deer Valley Land Acquisition Aerial",
      description: "Pre-purchase aerial survey of 12-acre commercial parcel.",
      type: "INSPECTION",
      status: "PENDING_ASSIGNMENT",
      city: "Phoenix",
      state: "AZ",
      zip: "85027",
      scheduledDate: new Date("2026-03-05"),
      duration: 120,
      deliverables: "4K aerial video, boundary photos, elevation data",
      clientPrice: 950,
      pilotPayout: 500,
      priority: 1,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      clientId: client3.id,
      title: "Luxury Listing – 10234 W Karen Dr",
      description: "Real estate aerial for luxury listing. Need golden hour photos and cinematic video.",
      type: "REAL_ESTATE",
      status: "ASSIGNED",
      city: "Scottsdale",
      state: "AZ",
      zip: "85255",
      scheduledDate: new Date("2026-03-01"),
      duration: 90,
      deliverables: "20 photos, 2-min highlight reel",
      clientPrice: 750,
      pilotPayout: 400,
      priority: 2,
      assignments: {
        create: {
          pilotId: pilot2User.pilot!.id,
          acceptedAt: new Date("2026-02-22"),
        },
      },
    },
  });

  console.log(`✅ Jobs created: ${job1.title}, ${job2.title}, ${job3.title}, ${job4.title}`);

  // Files for completed job
  await prisma.jobFile.createMany({
    data: [
      {
        jobId: job1.id,
        name: "phoenix_aerial_01.mp4",
        url: "https://storage.luminaerial.com/jobs/phoenix-01.mp4",
        type: "VIDEO",
        sizeMb: 245.8,
        uploadedBy: pilot1User.id,
        isDelivered: true,
        deliveredAt: new Date("2026-01-16"),
      },
      {
        jobId: job1.id,
        name: "phoenix_photo_package.zip",
        url: "https://storage.luminaerial.com/jobs/phoenix-photos.zip",
        type: "PHOTO",
        sizeMb: 89.4,
        uploadedBy: pilot1User.id,
        isDelivered: true,
        deliveredAt: new Date("2026-01-16"),
      },
    ],
  });

  // Invoice for completed job
  await prisma.invoice.create({
    data: {
      clientId: client1.id,
      jobId: job1.id,
      invoiceNumber: "LA-2026-0001",
      status: "PAID",
      amount: 1200,
      tax: 0,
      totalAmount: 1200,
      issueDate: new Date("2026-01-17"),
      dueDate: new Date("2026-02-01"),
      paidAt: new Date("2026-01-28"),
      notes: "Spring Campaign – Phoenix aerial. Thank you!",
      lineItems: [
        {
          description: "Aerial photography & videography – Phoenix, AZ",
          qty: 1,
          unitPrice: 1200,
          total: 1200,
        },
      ],
    },
  });

  // Pilot payment for completed job
  const assignment = await prisma.jobAssignment.findFirst({
    where: { jobId: job1.id },
  });
  if (assignment) {
    await prisma.pilotPayment.create({
      data: {
        pilotId: pilot1User.pilot!.id,
        assignmentId: assignment.id,
        amount: 650,
        status: "PAID",
        method: "ACH",
        approvedAt: new Date("2026-01-18"),
        paidAt: new Date("2026-01-29"),
      },
    });
  }

  console.log(`✅ Files & invoices created`);
  console.log("\n🎉 Seed complete!\n");
  console.log("Login credentials:");
  console.log("  Admin:  bsargent@luminaerial.com / admin123");
  console.log("  Pilot:  jake@example.com / pilot123");
  console.log("  Pilot:  sarah@example.com / pilot123");
  console.log("  Client: alex@creativepulse.com / client123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
