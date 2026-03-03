import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, company, email, phone, plan, source, message } = body;

    if (!name?.trim() || !email?.trim()) {
      return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    // Map source string → LeadSource enum
    const sourceMap: Record<string, string> = {
      "Google Search":                "WEBSITE",
      "Social Media":                 "SOCIAL_MEDIA",
      "Referral / Word of Mouth":     "REFERRAL",
      "Industry Event / Trade Show":  "TRADE_SHOW",
      "Other":                        "OTHER",
    };

    const leadSource = sourceMap[source] ?? "WEBSITE";

    // Build notes from plan + message
    const notes = [
      plan ? `Plan interest: ${plan}` : null,
      message?.trim() ? message.trim() : null,
    ]
      .filter(Boolean)
      .join("\n\n");

    // Create Lead record
    const lead = await prisma.lead.create({
      data: {
        contactName: name.trim(),
        companyName: company?.trim() || name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        source: leadSource as "REFERRAL" | "WEBSITE" | "SOCIAL_MEDIA" | "COLD_OUTREACH" | "REPEAT_CLIENT" | "TRADE_SHOW" | "OTHER",
        notes: notes || null,
        status: "NEW",
      },
    });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch (err) {
    console.error("[signup] error:", err);
    return NextResponse.json({ error: "Failed to submit request. Please try again." }, { status: 500 });
  }
}
