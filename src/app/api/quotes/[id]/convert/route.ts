import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/quotes/[id]/convert
 * Creates a Lead from this quote's data and marks the quote CONVERTED.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const quote = await prisma.quoteRequest.findUnique({ where: { id } });
  if (!quote) return NextResponse.json({ error: "Quote not found" }, { status: 404 });

  if (quote.status === "CONVERTED") {
    return NextResponse.json({ error: "Already converted" }, { status: 409 });
  }

  // Create Lead pre-populated from quote data
  const lead = await prisma.lead.create({
    data: {
      companyName: quote.company ?? quote.name,
      contactName: quote.name,
      email: quote.email,
      phone: quote.phone ?? null,
      source: "OTHER",
      status: "NEW",
      notes: [
        quote.serviceType ? `Service: ${quote.serviceType}` : null,
        quote.budget ? `Budget: ${quote.budget}` : null,
        quote.city || quote.state
          ? `Location: ${[quote.city, quote.state].filter(Boolean).join(", ")}`
          : null,
        quote.description ? `---\n${quote.description}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
    },
  });

  // Mark quote as CONVERTED
  await prisma.quoteRequest.update({
    where: { id },
    data: { status: "CONVERTED" },
  });

  return NextResponse.json({ lead }, { status: 201 });
}
