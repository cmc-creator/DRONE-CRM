/**
 * NyxAerial — Brand Configuration
 *
 * All brand strings read from environment variables so this platform is
 * fully white-label out of the box. Set these in your .env.local or
 * Vercel Environment Variables to rebrand for any operator.
 *
 * NEXT_PUBLIC_ vars are safe to use in both server and client components.
 * ORG_EMAIL / ORG_NAME (without prefix) are used in server-only code (email templates, API routes).
 */

/** Client + Server brand constants */
export const BRAND = {
  /** Company / operator name shown in UI, emails, footers */
  name:    process.env.NEXT_PUBLIC_ORG_NAME    ?? "NyxAerial",
  /** Public website URL */
  website: process.env.NEXT_PUBLIC_ORG_WEBSITE ?? "https://nyxaerial.com",
  /** Support/contact email shown in client-facing pages */
  email:   process.env.NEXT_PUBLIC_ORG_EMAIL   ?? "ops@nyxaerial.com",
  /** One-line tagline shown in sidebar, login, emails */
  tagline: process.env.NEXT_PUBLIC_ORG_TAGLINE ?? "Drone Operations Platform",
  /** Copyright year */
  year: "2026",
  /** Legal entity — owner of the NyxAerial™ trademark */
  legalEntity: "NyxCollective LLC",
  /** Full copyright line */
  copyright: "© 2026 NyxCollective LLC. All rights reserved.",
} as const;

/** Server-only — safe to use in API routes and email.ts */
export const SERVER_BRAND = {
  name:    process.env.ORG_NAME    ?? process.env.NEXT_PUBLIC_ORG_NAME    ?? "NyxAerial",
  website: process.env.ORG_WEBSITE ?? process.env.NEXT_PUBLIC_ORG_WEBSITE ?? "https://nyxaerial.com",
  email:   process.env.ORG_EMAIL   ?? process.env.ADMIN_EMAIL              ?? "ops@nyxaerial.com",
} as const;
