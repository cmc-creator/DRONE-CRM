/**
 * Lumin Aerial — Email Notifications
 * Uses Resend (resend.com). Requires RESEND_API_KEY in env.
 * Gracefully no-ops if the key is not set — nothing crashes, just no email sent.
 *
 * To enable: add RESEND_API_KEY to Vercel env vars (free tier = 3k emails/month)
 * Get a key at: https://resend.com
 */

import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

// Resend's shared domain works without DNS verification.
// To use your own domain: move luminaerial.com DNS to Cloudflare (free),
// then add EMAIL_FROM="Lumin Aerial <noreply@luminaerial.com>" to Vercel env vars.
const FROM = process.env.EMAIL_FROM ?? "Lumin Aerial <onboarding@resend.dev>";
const APP_URL = process.env.NEXTAUTH_URL ?? "https://drone-crm-theta.vercel.app";

// -- Job assignment notification -----------------------------------------------

export async function sendJobAssignmentEmail({
  pilotEmail,
  pilotName,
  jobTitle,
  clientName,
  city,
  state,
  scheduledDate,
  jobId,
  payout,
}: {
  pilotEmail: string;
  pilotName: string;
  jobTitle: string;
  clientName: string;
  city: string;
  state: string;
  scheduledDate?: Date | null;
  jobId: string;
  payout?: number | null;
}) {
  const resend = getResend();
  if (!resend) return; // no API key — silent no-op

  const dateStr = scheduledDate
    ? new Date(scheduledDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "TBD";

  const payoutStr = payout
    ? `$${Number(payout).toLocaleString("en-US", { minimumFractionDigits: 2 })}`
    : "Contact ops for payout details";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, sans-serif; background: #04080f; color: #d8e8f4; margin: 0; padding: 0;">
  <div style="max-width: 520px; margin: 40px auto; background: #080f1e; border: 1px solid rgba(0,212,255,0.15); border-radius: 16px; overflow: hidden;">
    
    <div style="background: linear-gradient(135deg, #00d4ff15, #a78bfa10); padding: 28px 32px 20px; border-bottom: 1px solid rgba(0,212,255,0.1);">
      <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #00d4ff;">Lumin Aerial</p>
      <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: #d8e8f4;">New Job Assignment ??</h1>
    </div>

    <div style="padding: 24px 32px;">
      <p style="margin: 0 0 20px; color: rgba(216,232,244,0.75);">Hey ${pilotName}, you've been assigned a new mission:</p>

      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.06); color: rgba(0,212,255,0.5); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; width: 35%;">Job</td>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.06); color: #d8e8f4; font-weight: 600;">${jobTitle}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.06); color: rgba(0,212,255,0.5); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Client</td>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.06); color: #d8e8f4;">${clientName}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.06); color: rgba(0,212,255,0.5); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Location</td>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.06); color: #d8e8f4;">${city}, ${state}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.06); color: rgba(0,212,255,0.5); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Date</td>
          <td style="padding: 10px 0; border-bottom: 1px solid rgba(0,212,255,0.06); color: #d8e8f4;">${dateStr}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; color: rgba(0,212,255,0.5); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Payout</td>
          <td style="padding: 10px 0; color: #34d399; font-weight: 700;">${payoutStr}</td>
        </tr>
      </table>

      <div style="margin-top: 28px; text-align: center;">
        <a href="${APP_URL}/pilot/jobs/${jobId}"
          style="display: inline-block; background: linear-gradient(135deg, #00d4ff, #0099bb); color: #04080f; font-weight: 900; font-size: 14px; padding: 12px 28px; border-radius: 10px; text-decoration: none;">
          View Job Details
        </a>
      </div>

      <p style="margin: 24px 0 0; font-size: 12px; color: rgba(0,212,255,0.3); text-align: center;">
        Lumin Aerial LLC &nbsp;·&nbsp; luminaerial.com &nbsp;·&nbsp; <span style="color:rgba(0,212,255,0.3)">Powered by NyxAerial</span>
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: pilotEmail,
      subject: `New Job: ${jobTitle} — ${city}, ${state}`,
      html,
    });
  } catch (err) {
    console.error("[email] Failed to send job assignment notification:", err);
    // never throw — email failure should not block job creation
  }
}

// -- Job status update notification -------------------------------------------

export async function sendJobStatusEmail({
  pilotEmail,
  pilotName,
  jobTitle,
  newStatus,
  jobId,
}: {
  pilotEmail: string;
  pilotName: string;
  jobTitle: string;
  newStatus: string;
  jobId: string;
}) {
  const resend = getResend();
  if (!resend) return;

  const statusLabels: Record<string, string> = {
    IN_PROGRESS: "marked In Progress",
    CAPTURE_COMPLETE: "marked Capture Complete",
    DELIVERED: "delivered",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
  };
  const label = statusLabels[newStatus];
  if (!label) return; // don't email for other status changes

  try {
    await resend.emails.send({
      from: FROM,
      to: pilotEmail,
      subject: `Job Update: ${jobTitle} — ${label}`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; background: #080f1e; border: 1px solid rgba(0,212,255,0.15); border-radius: 12px; padding: 28px; color: #d8e8f4;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:#00d4ff; text-transform:uppercase;">Lumin Aerial</p>
        <h2 style="margin:0 0 16px; color:#d8e8f4;">Job Status Update</h2>
        <p>Hey ${pilotName}, <strong>${jobTitle}</strong> has been ${label}.</p>
        <a href="${APP_URL}/pilot/jobs/${jobId}" style="display:inline-block; margin-top:16px; background:#00d4ff; color:#04080f; font-weight:900; padding:10px 24px; border-radius:8px; text-decoration:none;">View Job</a>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send status update notification:", err);
  }
}

// -- Compliance Expiry ---------------------------------------------------------

export async function sendComplianceExpiryEmail({
  pilotEmail,
  pilotName,
  docType,
  expiresAt,
  daysLeft,
}: {
  pilotEmail: string;
  pilotName: string;
  docType: string;
  expiresAt: Date;
  daysLeft: number;
}) {
  const resend = getResend();
  if (!resend) return;
  const urgencyColor = daysLeft <= 7 ? "#f87171" : daysLeft <= 14 ? "#fbbf24" : "#00d4ff";
  const expiry = expiresAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  try {
    await resend.emails.send({
      from: FROM,
      to: pilotEmail,
      subject: `Action Required: ${docType} expires in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; background: #080f1e; border: 1px solid ${urgencyColor}40; border-radius: 12px; padding: 28px; color: #d8e8f4;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:${urgencyColor}; text-transform:uppercase;">Lumin Aerial — Compliance Alert</p>
        <h2 style="margin:0 0 16px; color:#d8e8f4;">Document Expiring Soon</h2>
        <p>Hi ${pilotName},</p>
        <p>Your <strong>${docType}</strong> expires on <strong>${expiry}</strong> — that's <strong style="color:${urgencyColor};">${daysLeft} day${daysLeft === 1 ? "" : "s"}</strong> from now.</p>
        <p>Please upload your renewed document to keep your pilot status active and remain eligible for job assignments.</p>
        <a href="${APP_URL}/pilot/documents" style="display:inline-block; margin-top:16px; background:${urgencyColor}; color:#04080f; font-weight:900; padding:10px 24px; border-radius:8px; text-decoration:none;">Upload Document</a>
        <p style="margin-top:24px; font-size:12px; color:#5b7a99;">If you have already uploaded this document, please ensure it is marked as active in your profile.</p>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send compliance expiry notification:", err);
  }
}

// -- Invoice Payment Link ------------------------------------------------------

export async function sendInvoicePaymentLinkEmail({
  clientEmail,
  clientName,
  invoiceNumber,
  totalAmount,
  dueDate,
  paymentUrl,
}: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate?: Date | null;
  paymentUrl: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const due = dueDate
    ? dueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "Upon receipt";
  try {
    await resend.emails.send({
      from: FROM,
      to: clientEmail,
      subject: `Invoice ${invoiceNumber} — Pay Online`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; background: #080f1e; border: 1px solid rgba(0,212,255,0.15); border-radius: 12px; padding: 28px; color: #d8e8f4;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:#00d4ff; text-transform:uppercase;">Lumin Aerial</p>
        <h2 style="margin:0 0 16px; color:#d8e8f4;">Invoice Ready for Payment</h2>
        <p>Hi ${clientName},</p>
        <p>Invoice <strong>${invoiceNumber}</strong> for <strong>$${totalAmount.toFixed(2)}</strong> is ready. Due date: <strong>${due}</strong>.</p>
        <p>Click below to pay securely via credit card:</p>
        <a href="${paymentUrl}" style="display:inline-block; margin-top:16px; background:#00d4ff; color:#04080f; font-weight:900; padding:10px 24px; border-radius:8px; text-decoration:none;">Pay $${totalAmount.toFixed(2)} Now</a>
        <p style="margin-top:24px; font-size:12px; color:#5b7a99;">Powered by Stripe — your card details are never stored on our servers.</p>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send invoice payment link:", err);
  }
}

// -- Deliverable Notification --------------------------------------------------

export async function sendDeliverableNotificationEmail({
  clientEmail,
  clientName,
  jobTitle,
  jobId,
  fileCount,
}: {
  clientEmail: string;
  clientName: string;
  jobTitle: string;
  jobId: string;
  fileCount: number;
}) {
  const resend = getResend();
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to: clientEmail,
      subject: `Your deliverables are ready — ${jobTitle}`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; background: #080f1e; border: 1px solid rgba(0,212,255,0.15); border-radius: 12px; padding: 28px; color: #d8e8f4;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:#00d4ff; text-transform:uppercase;">Lumin Aerial</p>
        <h2 style="margin:0 0 16px; color:#d8e8f4;">Your Files Are Ready</h2>
        <p>Hi ${clientName},</p>
        <p>Your aerial deliverables for <strong>${jobTitle}</strong> are ready for review. <strong>${fileCount} file${fileCount === 1 ? "" : "s"}</strong> have been uploaded.</p>
        <p>Please review and approve (or request revisions) within your client portal.</p>
        <a href="${APP_URL}/client/deliverables" style="display:inline-block; margin-top:16px; background:#00d4ff; color:#04080f; font-weight:900; padding:10px 24px; border-radius:8px; text-decoration:none;">Review Deliverables</a>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send deliverable notification:", err);
  }
}

// -- Overdue Invoice Reminder --------------------------------------------------

export async function sendOverdueInvoiceEmail({
  clientEmail,
  clientName,
  invoiceNumber,
  totalAmount,
  dueDate,
  invoiceId,
}: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate?: Date | null;
  invoiceId: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const due = dueDate
    ? dueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "a past date";
  try {
    await resend.emails.send({
      from: FROM,
      to: clientEmail,
      subject: `Action Required: Invoice ${invoiceNumber} is Overdue`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; background: #080f1e; border: 1px solid rgba(239,68,68,0.3); border-radius: 12px; padding: 28px; color: #d8e8f4;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:#00d4ff; text-transform:uppercase;">Lumin Aerial</p>
        <h2 style="margin:0 0 16px; color:#ef4444;">?? Invoice Overdue</h2>
        <p>Hi ${clientName},</p>
        <p>Invoice <strong>${invoiceNumber}</strong> for <strong>$${totalAmount.toFixed(2)}</strong> was due on <strong style="color:#ef4444;">${due}</strong> and remains unpaid.</p>
        <p>Please settle this invoice at your earliest convenience to avoid service interruptions.</p>
        <a href="${APP_URL}/client/invoices" style="display:inline-block; margin-top:16px; background:#ef4444; color:#fff; font-weight:900; padding:10px 24px; border-radius:8px; text-decoration:none;">View &amp; Pay Invoice</a>
        <p style="margin-top:24px; font-size:12px; color:#5b7a99;">Questions? Reply to this email or contact us at <a href="mailto:ops@luminaerial.com" style="color:#00d4ff;">ops@luminaerial.com</a>.</p>
        <p style="font-size:11px; color:rgba(91,122,153,0.6); margin-top:16px;">Lumin Aerial LLC · luminaerial.com · Powered by NyxAerial</p>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send overdue invoice reminder:", err);
  }
}

// -- New Quote Request Notification (admin) ------------------------------------

export async function sendNewQuoteNotificationEmail({
  name,
  email,
  company,
  serviceType,
  city,
  state,
}: {
  name: string;
  email: string;
  company?: string | null;
  serviceType?: string | null;
  city?: string | null;
  state?: string | null;
}) {
  const resend = getResend();
  if (!resend) return;
  const adminEmail = process.env.ADMIN_EMAIL ?? "ops@luminaerial.com";
  const location = [city, state].filter(Boolean).join(", ");
  try {
    await resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `New Quote Request — ${name}${company ? ` (${company})` : ""}`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; background: #080f1e; border: 1px solid rgba(0,212,255,0.15); border-radius: 12px; padding: 28px; color: #d8e8f4;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:#00d4ff; text-transform:uppercase;">Lumin Aerial CRM</p>
        <h2 style="margin:0 0 16px; color:#d8e8f4;">?? New Quote Request</h2>
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr><td style="padding:6px 0; color:rgba(0,212,255,0.5); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; width:35%;">Name</td><td style="padding:6px 0;">${name}</td></tr>
          <tr><td style="padding:6px 0; color:rgba(0,212,255,0.5); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Email</td><td style="padding:6px 0;"><a href="mailto:${email}" style="color:#00d4ff;">${email}</a></td></tr>
          ${company ? `<tr><td style="padding:6px 0; color:rgba(0,212,255,0.5); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Company</td><td style="padding:6px 0;">${company}</td></tr>` : ""}
          ${location ? `<tr><td style="padding:6px 0; color:rgba(0,212,255,0.5); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Location</td><td style="padding:6px 0;">${location}</td></tr>` : ""}
          ${serviceType ? `<tr><td style="padding:6px 0; color:rgba(0,212,255,0.5); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Service</td><td style="padding:6px 0;">${serviceType}</td></tr>` : ""}
        </table>
        <a href="${APP_URL}/admin/quotes" style="display:inline-block; margin-top:20px; background:#00d4ff; color:#04080f; font-weight:900; padding:10px 24px; border-radius:8px; text-decoration:none;">View in CRM ?</a>
        <p style="font-size:11px; color:rgba(91,122,153,0.6); margin-top:16px;">Lumin Aerial LLC · luminaerial.com · Powered by NyxAerial</p>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send new quote notification:", err);
  }
}

// -- Payment Receipt -----------------------------------------------------------

export async function sendPaymentReceiptEmail({
  clientEmail,
  clientName,
  invoiceNumber,
  amountPaid,
  paidAt,
  invoiceId,
}: {
  clientEmail: string;
  clientName: string;
  invoiceNumber: string;
  amountPaid: number;
  paidAt: Date;
  invoiceId: string;
}) {
  const resend = getResend();
  if (!resend) return;
  const dateStr = paidAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  try {
    await resend.emails.send({
      from: FROM,
      to: clientEmail,
      subject: `Payment Received — Invoice ${invoiceNumber}`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; background: #080f1e; border: 1px solid rgba(0,212,255,0.15); border-radius: 12px; padding: 28px; color: #d8e8f4;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:#00d4ff; text-transform:uppercase;">Lumin Aerial</p>
        <h2 style="margin:0 0 16px; color:#4ade80;">? Payment Received</h2>
        <p>Hi ${clientName},</p>
        <p>We've received your payment of <strong style="color:#4ade80;">$${amountPaid.toFixed(2)}</strong> for invoice <strong>${invoiceNumber}</strong> on <strong>${dateStr}</strong>.</p>
        <p>Thank you for your business! Your project is in good hands.</p>
        <a href="${APP_URL}/client/invoices" style="display:inline-block; margin-top:16px; background:#4ade80; color:#04080f; font-weight:900; padding:10px 24px; border-radius:8px; text-decoration:none;">View Receipt</a>
        <p style="margin-top:24px; font-size:12px; color:#5b7a99;">Questions? Contact us at <a href="mailto:ops@luminaerial.com" style="color:#00d4ff;">ops@luminaerial.com</a>.</p>
        <p style="font-size:11px; color:rgba(91,122,153,0.6); margin-top:16px;">Lumin Aerial LLC · luminaerial.com · Powered by NyxAerial</p>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send payment receipt:", err);
  }
}

// -- Lead Follow-Up Reminder (admin) ------------------------------------------

export async function sendLeadFollowUpEmail({
  adminEmail,
  leadId,
  companyName,
  contactName,
  daysOverdue,
  notes,
}: {
  adminEmail: string;
  leadId: string;
  companyName: string;
  contactName: string;
  daysOverdue: number;
  notes?: string | null;
}) {
  const resend = getResend();
  if (!resend) return;
  const urgencyColor = daysOverdue >= 7 ? "#ef4444" : daysOverdue >= 3 ? "#f59e0b" : "#00d4ff";
  try {
    await resend.emails.send({
      from: FROM,
      to: adminEmail,
      subject: `? Follow-Up Overdue: ${companyName}`,
      html: `<div style="font-family: sans-serif; max-width: 480px; margin: 40px auto; background: #080f1e; border: 1px solid ${urgencyColor}40; border-radius: 12px; padding: 28px; color: #d8e8f4;">
        <p style="margin:0 0 8px; font-size:11px; font-weight:700; letter-spacing:2px; color:#00d4ff; text-transform:uppercase;">Lumin Aerial CRM</p>
        <h2 style="margin:0 0 16px; color:${urgencyColor};">? Follow-Up Overdue</h2>
        <p>A lead follow-up is <strong style="color:${urgencyColor};">${daysOverdue} day${daysOverdue !== 1 ? "s" : ""} overdue</strong>:</p>
        <table style="width:100%; border-collapse:collapse; font-size:14px; margin-top:12px;">
          <tr><td style="padding:6px 0; color:rgba(0,212,255,0.5); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; width:35%;">Company</td><td style="padding:6px 0;">${companyName}</td></tr>
          <tr><td style="padding:6px 0; color:rgba(0,212,255,0.5); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Contact</td><td style="padding:6px 0;">${contactName}</td></tr>
          ${notes ? `<tr><td style="padding:6px 0; color:rgba(0,212,255,0.5); font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px;">Notes</td><td style="padding:6px 0; color:rgba(216,232,244,0.6);">${notes}</td></tr>` : ""}
        </table>
        <a href="${APP_URL}/admin/leads/${leadId}" style="display:inline-block; margin-top:20px; background:${urgencyColor}; color:#04080f; font-weight:900; padding:10px 24px; border-radius:8px; text-decoration:none;">Open Lead ?</a>
        <p style="font-size:11px; color:rgba(91,122,153,0.6); margin-top:16px;">Lumin Aerial LLC · luminaerial.com · Powered by NyxAerial</p>
      </div>`,
    });
  } catch (err) {
    console.error("[email] Failed to send lead follow-up reminder:", err);
  }
}
