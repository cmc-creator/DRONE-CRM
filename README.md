# NyxAerial — Drone Business CRM Platform

**The white-label operations platform built for drone service businesses.**

NyxAerial is a full-stack, rebrandable CRM engineered specifically for the drone industry. Whether you run a solo FAA Part 107 operation, a regional drone network, an aerial inspection company, or a nationwide fleet — NyxAerial handles every part of your business in one place: pilot dispatch, client management, job tracking, deliverables, invoicing, compliance, and automated communications.

Currently deployed as **Lumin Aerial CRM** for [Lumin Aerial LLC](https://luminaerial.com) — rebrandable for any drone service operator.

> **Built by NyxAerial** — a NyxCollective LLC product.
> © 2026 NyxCollective LLC. All rights reserved.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, Turbopack) |
| Database | Neon PostgreSQL via Prisma ORM **v7.4.1** |
| Prisma Adapter | `@prisma/adapter-pg` (PrismaPg driver adapter) |
| Auth | NextAuth v5 beta (JWT HS256, Credentials) |
| Styling | Tailwind CSS + custom shadcn/ui components |
| Email | Resend (`onboarding@resend.dev`) |
| Payments | Stripe (Checkout + Webhook) |
| Contracts | Adobe Sign API |
| Maps | Leaflet + react-leaflet |
| Deployment | Vercel (frontend) + Neon (database) |

---

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full access � pilots, clients, jobs, invoices, compliance, leads, quotes |
| **Pilot** | Portal � assigned jobs, compliance docs, payments, deliverables |
| **Client** | Portal � projects, invoices, download deliverables, sign contracts |

---

## Implemented Modules

### Admin Portal (`/admin/*`)
- **Dashboard** � live stats (jobs, revenue, pilots, compliance alerts)
- **Pilots** � profiles, FAA certs, markets, equipment, availability, ratings/reviews
- **Clients** � agencies, commercial, real estate; optional portal login
- **Jobs** � full dispatch lifecycle, file uploads, pilot assignment, review widget
- **Leads** � pipeline management, follow-up scheduling, status tracking
- **Quotes** � public quote intake, admin review, one-click Lead conversion
- **Invoices** � auto-numbered (LA-2025-0001), Stripe payment links, overdue reminders
- **Compliance** � FAA Part 107, insurance COI, W-9 expiry tracking + alerts
- **Deliverables** � all uploaded job files across pilots
- **Contracts** � Adobe Sign integration, e-signature flow, client portal signing
- **Calendar** � job scheduling overview
- **Analytics** � revenue and job metrics
- **Dispatch** � real-time job dispatch map view
- **Integrations** � Google Drive, QuickBooks, Adobe Sign
- **Settings / Team** � admin account management
- **AI Assistant (Volo)** � context-aware CRM assistant via `/api/chat`
- **Dev Tools** � seed + clear database (dev mode only)

### Pilot Portal (`/pilot/*`)
- Dashboard, jobs, compliance documents, payments, deliverables

### Client Portal (`/client/*`)
- Dashboard, projects, invoices, deliverables, contract signing

### Public Pages
- `/quote` � public quote request form (no auth required), 8 service types, 6 budget ranges
- `/contracts/[id]/sign` � contract e-signature page
- `/track/[token]` � job tracking by public token

---

## Automation & Notifications

All email via **Resend**. Functions live in `src/lib/email.ts`.

| Trigger | Email Fired | Audience |
|---|---|---|
| Pilot assigned to job | Job assignment details | Pilot |
| Job status changes | Status update | Pilot + Client |
| Compliance doc expiring | Expiry alert (30/14/7/1 day) | Admin |
| Invoice overdue | Overdue reminder (red banner) | Admin |
| Deliverable file uploaded (isDelivered=true) | Files ready for review | Client |
| Stripe payment received | Payment receipt | Client |
| Lead follow-up overdue | Urgency-colored alert | Admin |
| New public quote submitted | New quote notification | Admin |

### Cron Jobs (Vercel � UTC)

| Schedule | Route | Purpose |
|---|---|---|
| `0 7 * * *` | `/api/cron/lead-followup` | Overdue lead follow-up alerts |
| `0 8 * * *` | `/api/cron/invoice-check` | Overdue invoice reminders |
| `0 9 * * *` | `/api/cron/compliance-check` | Expiring compliance doc alerts |

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database ([Neon](https://neon.tech) recommended � free tier)
- Git

### 2. Clone & Install

```bash
git clone https://github.com/cmc-creator/DRONE-CRM.git
cd "DRONE CRM"
npm install
```

### 3. Environment Variables

Create `.env.local` from `.env.example`:

```bash
cp .env.example .env.local
```

Required values:

```env
# Neon (or any PostgreSQL) connection string
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require"

# NextAuth � generate: openssl rand -base64 32
AUTH_SECRET="your-secret-here"

# App URL
NEXTAUTH_URL="http://localhost:3000"

# Resend API key (resend.com ? API Keys)
RESEND_API_KEY="re_xxxxxxxxxxxx"

# Admin notification inbox
ADMIN_EMAIL="ops@luminaerial.com"

# Stripe (Stripe Dashboard ? Developers)
STRIPE_SECRET_KEY="sk_live_xxxxxxxxxxxx"
STRIPE_WEBHOOK_SECRET="whsec_xxxxxxxxxxxx"

# Adobe Sign (optional � for contract e-signature)
ADOBE_SIGN_API_KEY=""
ADOBE_SIGN_BASE_URI=""

# Google Drive (optional � for deliverable storage)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""

# Cron security (any random string)
CRON_SECRET="your-cron-secret"
```

### 4. Set Up Database

```bash
# Push the Prisma schema to your database (creates all tables)
npm run db:push

# Seed with demo data (admin, pilots, clients, jobs, leads)
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Demo Accounts (after seeding)

| Role | Email | Password |
|---|---|---|
| Admin | bsargent@luminaerial.com | admin123 |
| Pilot | jake@example.com | pilot123 |
| Pilot | sarah@example.com | pilot123 |
| Client | alex@creativepulse.com | client123 |

---

## Project Structure

```
src/
+-- app/
�   +-- (admin)/admin/           # Admin portal (all modules)
�   +-- (pilot)/pilot/           # Pilot portal
�   +-- (client)/client/         # Client portal
�   +-- api/
�   �   +-- auth/[...nextauth]/  # NextAuth handler
�   �   +-- pilots/              # Pilot CRUD + reviews + score
�   �   +-- clients/             # Client CRUD
�   �   +-- jobs/                # Job CRUD + files + tracking
�   �   +-- leads/               # Lead CRUD
�   �   +-- quotes/              # Quote CRUD + /convert
�   �   +-- invoices/            # Invoice CRUD + Stripe payment link
�   �   +-- contracts/           # Contract CRUD + sign + download
�   �   +-- cron/                # compliance-check, invoice-check, lead-followup
�   �   +-- stripe/              # Checkout session
�   �   +-- webhooks/stripe/     # Stripe payment webhook
�   �   +-- webhooks/adobe-sign/ # Adobe Sign event webhook
�   �   +-- integrations/        # Google Drive auth + files
�   �   +-- export/              # CSV export (pilots, clients, invoices, contracts)
�   �   +-- import/              # CSV import (pilots, clients, invoices)
�   �   +-- chat/                # Volo AI assistant
�   �   +-- activities/          # Activity feed
�   �   +-- dev/                 # Seed + clear (dev only)
�   +-- contracts/[id]/sign/     # Public e-signature page
�   +-- quote/                   # Public quote request form
�   +-- track/[token]/           # Public job tracking
�   +-- login/
�   +-- unauthorized/
+-- components/
�   +-- layout/sidebar.tsx       # Role-aware navigation
�   +-- ui/                      # shadcn/ui components
+-- lib/
�   +-- auth.ts                  # NextAuth config
�   +-- email.ts                 # All Resend email functions
�   +-- prisma.ts                # Prisma v7 client (PrismaPg adapter)
�   +-- utils.ts                 # formatCurrency, formatDate, etc.
+-- types/
    +-- next-auth.d.ts           # Extended session types
prisma/
+-- schema.prisma                # Full database schema
+-- seed.ts                      # Demo data seeder
prisma.config.ts                 # Prisma v7 required config (datasource URL)
vercel.json                      # Cron schedule config
```

---

## Database Schema (Key Models)

| Model | Purpose |
|---|---|
| `User` | Shared auth for all roles |
| `Pilot` | FAA credentials, markets, equipment, insurance |
| `PilotMarket` | Geographic service areas per pilot |
| `PilotReview` | Post-job star ratings (1�5) from admin |
| `Equipment` | Drone inventory per pilot |
| `Client` | Companies (agencies, commercial, real estate) |
| `Lead` | Pre-client sales pipeline |
| `QuoteRequest` | Public quote intake (NEW/REVIEWED/CONVERTED/DISMISSED) |
| `Job` | Dispatch record � links client + pilot(s) |
| `JobAssignment` | Pilot ? job junction with payment link |
| `JobFile` | Delivered photos, videos, reports |
| `Invoice` | Client billing with Stripe payment link |
| `PilotPayment` | Pilot payout tracking |
| `ComplianceDoc` | FAA Part 107, insurance COI, W-9, etc. |
| `Contract` | Adobe Sign contract with e-signature tracking |
| `Notification` | In-app notification records |
| `TeamMember` | Additional admin team users |
| `ActivityLog` | Audit trail of all CRM actions |

---

## Available Scripts

```bash
npm run dev           # Start dev server (Turbopack)
npm run build         # prisma generate + next build
npm run start         # Start production server
npm run db:generate   # Regenerate Prisma Client after schema change
npm run db:push       # Push schema to database
npm run db:migrate    # Create and apply a named migration
npm run db:studio     # Open Prisma Studio (visual DB browser)
npm run db:seed       # Seed demo data
```

---

## Deployment

### Vercel (Frontend + Crons)

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add all environment variables (see list above)
4. Vercel auto-runs crons from `vercel.json`

### Neon (Database)

1. Create project at [neon.tech](https://neon.tech)
2. Copy connection string ? `DATABASE_URL` in Vercel
3. Schema auto-applies on push via `.githooks/pre-push`

### Stripe Webhook

Register endpoint in Stripe Dashboard ? Webhooks:

```
https://drone-crm-theta.vercel.app/api/webhooks/stripe
```

Events to subscribe: `checkout.session.completed`, `invoice.payment_succeeded`

---

## Key Business Flows

### Onboarding a Pilot
1. Admin ? Pilots ? **Add Pilot** ? creates user + pilot profile
2. Pilot logs in at `/pilot/dashboard`
3. Upload compliance docs (FAA cert, insurance COI, W-9)

### Creating & Dispatching a Job
1. Admin ? Jobs ? **Create Job** � select client, assign pilot, set price
2. Status flow: `DRAFT ? PENDING_ASSIGNMENT ? ASSIGNED ? IN_PROGRESS ? CAPTURE_COMPLETE ? DELIVERED ? COMPLETED`
3. Upload deliverable files ? client email fires automatically when `isDelivered=true`
4. After completion � admin rates the pilot via the Review widget (1�5 stars)

### Lead ? Client Pipeline
1. Admin ? Leads ? **Add Lead** or convert from a public Quote
2. Leads track `nextFollowUp` date � daily cron emails admin when overdue
3. On WIN, convert to Client and create first Job

### Public Quote Flow
1. Prospect fills `/quote` � no account required
2. Admin sees new quote in Admin ? Quotes (email notification fires)
3. Admin clicks **Convert to Lead** ? creates Lead record, marks quote CONVERTED

### Invoicing
1. Admin ? Invoices ? **Create Invoice** � auto-number (LA-2025-0001)
2. **Send Payment Link** ? Stripe Checkout email to client
3. Client pays online ? webhook marks invoice PAID + emails receipt
4. Daily cron emails admin for any overdue unpaid invoices

---

## White-Label Use Cases

NyxAerial is designed to be rebranded and deployed for any drone-related service business:

| Business Type | How It Fits |
|---|---|
| Solo FAA Part 107 Pilot | Job tracking, client portal, invoice + Stripe payments, compliance doc reminders |
| Regional Drone Network | Multi-pilot dispatch, market territories, ratings, payout tracking |
| Aerial Photography Studio | Client deliverables portal, contract e-signature, Google Drive integration |
| Drone Inspection Company | Compliance management, job lifecycle tracking, report delivery |
| Real Estate Media Company | Client self-service portal, quote intake form, Stripe billing |
| Nationwide Fleet Operator | Full multi-portal platform — admin, pilot, and client roles out of the box |

Every client-facing page, email template, and brand reference is configurable. Swap the logo, colors, company name, and domain — the platform operates identically under any brand.

---

## Backlog

### White-Label / Multi-Tenant
- [ ] **Tenant config table** — store brand name, logo URL, primary color, domain per deployment
- [ ] **Custom subdomain per client portal** — clients.yourdomain.com
- [ ] **Onboarding wizard** — guided setup for new operators (company name, logo, first pilot, first client)
- [ ] **Marketplace listing** — let operators self-serve sign up for a NyxAerial instance

### High Priority
- [ ] **Guided Onboarding Tour** — Interactive step-by-step walkthrough for first login (tooltip overlays, feature highlights, localStorage completion flag)
- [ ] **Volo live context** — Persist recent CRM activity (overdue invoices, unassigned jobs, hot leads) into Volo's context automatically
- [ ] **Pilot mobile optimization** — Responsive pilot portal for field use
- [ ] **SMS notifications** — Twilio integration for job assignment and status updates
- [ ] **Bulk job import** — CSV upload for large event batches

### Nice to Have
- [ ] QuickBooks live sync (currently export-only)
- [ ] Pilot availability self-scheduling calendar
- [ ] Automated W-9 collection on pilot onboarding
- [ ] Per-operator analytics dashboard (revenue, job volume, pilot utilization)
