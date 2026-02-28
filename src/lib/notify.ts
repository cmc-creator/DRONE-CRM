/**
 * NyxAerial — Fire-and-forget notification utility
 *
 * Slack / Teams / Twilio SMS
 * All functions silently no-op when the required env var is missing.
 *
 * Set these in Vercel / .env.local:
 *   SLACK_WEBHOOK_URL        — Slack Incoming Webhook URL
 *   TEAMS_WEBHOOK_URL        — Microsoft Teams Incoming Webhook URL
 *   TWILIO_ACCOUNT_SID       — Twilio Account SID
 *   TWILIO_AUTH_TOKEN        — Twilio Auth Token
 *   TWILIO_PHONE_NUMBER      — Twilio 'From' number (E.164 e.g. +15551234567)
 */

// ─── Slack ────────────────────────────────────────────────────────────────────

export async function sendSlackNotification(
  text: string,
  options?: { blocks?: unknown[] }
): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(options?.blocks ? { text, blocks: options.blocks } : { text }),
    });
  } catch { /* silent */ }
}

// ─── Microsoft Teams ──────────────────────────────────────────────────────────

export async function sendTeamsNotification(
  title: string,
  text: string
): Promise<void> {
  const url = process.env.TEAMS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "@type": "MessageCard",
        "@context": "https://schema.org/extensions",
        summary: title,
        themeColor: "00d4ff",
        sections: [{ activityTitle: title, activityText: text }],
      }),
    });
  } catch { /* silent */ }
}

// ─── Twilio SMS ───────────────────────────────────────────────────────────────

export async function sendSMSNotification(
  to: string,
  body: string
): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const from       = process.env.TWILIO_PHONE_NUMBER;
  if (!accountSid || !authToken || !from || !to) return;

  // Normalise to E.164 if not already
  const toNum = to.startsWith("+") ? to : `+1${to.replace(/\D/g, "")}`;

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
      },
      body: new URLSearchParams({ To: toNum, From: from, Body: body }).toString(),
    });
  } catch { /* silent */ }
}

// ─── Convenience: job-assigned blast ─────────────────────────────────────────

export async function notifyJobAssigned({
  jobTitle,
  pilotName,
  pilotPhone,
  clientName,
  city,
  state,
  scheduledDate,
  jobId,
}: {
  jobTitle:      string;
  pilotName:     string;
  pilotPhone?:   string | null;
  clientName:    string;
  city:          string;
  state:         string;
  scheduledDate?: Date | null;
  jobId:         string;
}): Promise<void> {
  const appUrl  = process.env.NEXTAUTH_URL ?? "https://drone-crm-theta.vercel.app";
  const dateStr = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "TBD";
  const link = `${appUrl}/admin/jobs/${jobId}`;

  await Promise.all([
    sendSlackNotification(
      `✈️ *Job Assigned* — ${jobTitle}\n> Pilot: ${pilotName} · Client: ${clientName} · ${city}, ${state} · ${dateStr}\n<${link}|View Job>`
    ),
    sendTeamsNotification(
      `✈️ Job Assigned: ${jobTitle}`,
      `Pilot: **${pilotName}** | Client: ${clientName} | ${city}, ${state} | ${dateStr} | [View Job](${link})`
    ),
    pilotPhone
      ? sendSMSNotification(
          pilotPhone,
          `NyxAerial: You've been assigned "${jobTitle}" in ${city}, ${state} on ${dateStr}. Log in to view: ${link}`
        )
      : Promise.resolve(),
  ]);
}

// ─── Convenience: job-status blast ───────────────────────────────────────────

export async function notifyJobStatusChange({
  jobTitle,
  newStatus,
  city,
  state,
  jobId,
}: {
  jobTitle:  string;
  newStatus: string;
  city:      string;
  state:     string;
  jobId:     string;
}): Promise<void> {
  const appUrl = process.env.NEXTAUTH_URL ?? "https://drone-crm-theta.vercel.app";
  const link   = `${appUrl}/admin/jobs/${jobId}`;
  const STATUS_LABELS: Record<string, string> = {
    IN_PROGRESS:      "🟡 In Progress",
    CAPTURE_COMPLETE: "🟣 Footage Captured",
    DELIVERED:        "🟢 Delivered",
    COMPLETED:        "✅ Completed",
    CANCELLED:        "🔴 Cancelled",
  };
  const label = STATUS_LABELS[newStatus] ?? newStatus;

  await Promise.all([
    sendSlackNotification(`${label} — ${jobTitle} (${city}, ${state})\n<${link}|View Job>`),
    sendTeamsNotification(
      `Job Update: ${jobTitle}`,
      `Status changed to **${label}** | ${city}, ${state} | [View Job](${link})`
    ),
  ]);
}
