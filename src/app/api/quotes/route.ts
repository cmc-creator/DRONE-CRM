import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendNewQuoteNotificationEmail } from "@/lib/email";

// GET /api/quotes — admin list of all quote requests
export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const quotes = await prisma.quoteRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { client: { select: { id: true, companyName: true } } },
  });

  return NextResponse.json(quotes);
}

// POST /api/quotes — public submission (no auth required)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    name,
    email,
    phone,
    company,
    city,
    state,
    serviceType,
    description,
    budget,
  } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Name and email are required" },
      { status: 400 }
    );
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const quote = await prisma.quoteRequest.create({
    data: {
      name,
      email,
      phone: phone ?? null,
      company: company ?? null,
      city: city ?? null,
      state: state ?? null,
      serviceType: serviceType ?? null,
      description: description ?? null,
      budget: budget ?? null,
    },
  });

  // Notify admin — fire and forget
  sendNewQuoteNotificationEmail({ name, email, company, serviceType, city, state }).catch(
    () => {}
  );

  return NextResponse.json({ success: true, id: quote.id }, { status: 201 });
}
