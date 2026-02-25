import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `You are an AI assistant for Lumin Aerial LLC, a nationwide drone pilot network operated by Bailey Sargent. 
You help with:
- Drone operations, FAA Part 107 regulations, and airspace questions
- Client project management and status updates
- Pilot scheduling and dispatch coordination
- Invoice and contract inquiries
- Deliverable workflows and file handoff
- General CRM assistance for the Lumin Aerial team

Keep responses concise, professional, and helpful. If you don't know something, offer to connect the user with Bailey directly at bsargent@luminaerial.com.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI assistant not configured. Contact Bailey to enable.", code: "NO_API_KEY" },
      { status: 503 }
    );
  }

  let body: { messages?: { role: string; content: string }[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const messages = body.messages ?? [];
  if (!messages.length) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  const allowedRoles = new Set(["user", "assistant", "system"]);
  const cleaned = messages.filter((m) => allowedRoles.has(m.role)).slice(-20); // keep last 20

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...cleaned],
      max_tokens: 600,
      temperature: 0.6,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("OpenAI error:", err);
    return NextResponse.json({ error: "AI service unavailable. Try again later." }, { status: 502 });
  }

  const data = await res.json();
  const reply = data.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({ reply });
}
