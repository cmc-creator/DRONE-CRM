# Lumin Aerial CRM

A full-stack CRM for **Lumin Aerial** ([luminaerial.com](https://luminaerial.com)) — a nationwide FAA Part 107 drone pilot network. Manages pilots, clients, jobs, deliverables, invoicing, and compliance.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript) |
| Database | PostgreSQL via Prisma ORM v6 |
| Auth | NextAuth v5 (JWT, Credentials) |
| Styling | Tailwind CSS + custom shadcn/ui components |
| Deployment | Vercel (frontend) + Railway (database) |

---

## User Roles

| Role | Access |
|---|---|
| **Admin** | Full access — pilots, clients, jobs, invoices, compliance |
| **Pilot** | Portal — assigned jobs, documents, payments, deliverables |
| **Client** | Portal — projects, invoices, download deliverables |

---

## Local Setup

### 1. Prerequisites

- Node.js 18+
- A PostgreSQL database (local or [Railway](https://railway.app))
- Git

### 2. Clone & Install

```bash
git clone <repo-url>
cd "DRONE CRM"
npm install
```

### 3. Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in the values:

```env
# PostgreSQL connection string from Railway or local Postgres
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Generate a random secret:  openssl rand -base64 32
AUTH_SECRET="your-secret-here"

# Your app URL (http://localhost:3000 for development)
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Set Up Database

```bash
# Push the Prisma schema to your database (creates all tables)
npm run db:push

# Seed with demo data (admin, pilots, clients, jobs)
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
├── app/
│   ├── (admin)/admin/          # Admin portal
│   │   ├── dashboard/          # Stats overview
│   │   ├── pilots/             # Pilot management
│   │   │   ├── page.tsx        # List all pilots
│   │   │   ├── new/page.tsx    # Add pilot form
│   │   │   └── [id]/page.tsx   # Pilot profile detail
│   │   ├── clients/            # Client management
│   │   │   ├── page.tsx        # List all clients
│   │   │   ├── new/page.tsx    # Add client form
│   │   │   └── [id]/page.tsx   # Client profile detail
│   │   ├── jobs/               # Job dispatch
│   │   │   ├── page.tsx        # List all jobs
│   │   │   ├── new/page.tsx    # Create job form
│   │   │   └── [id]/page.tsx   # Job detail + status actions
│   │   ├── invoices/           # Client invoicing
│   │   │   ├── page.tsx        # Revenue summary
│   │   │   └── new/page.tsx    # Create invoice form
│   │   ├── compliance/         # Compliance doc review
│   │   └── deliverables/       # All uploaded files
│   ├── (pilot)/pilot/          # Pilot portal
│   │   ├── dashboard/          # My assignments summary
│   │   ├── jobs/               # My job assignments
│   │   ├── documents/          # My compliance docs
│   │   ├── payments/           # My payment history
│   │   └── deliverables/       # My uploaded files
│   ├── (client)/client/        # Client portal
│   │   ├── dashboard/          # My projects overview
│   │   ├── projects/           # My jobs
│   │   ├── invoices/           # My invoices
│   │   └── deliverables/       # Download my files
│   ├── api/
│   │   ├── auth/[...nextauth]/ # NextAuth handler
│   │   ├── pilots/             # GET list, POST create
│   │   ├── clients/            # GET list, POST create
│   │   ├── jobs/               # GET list, POST create
│   │   │   └── [id]/           # GET, PATCH status, DELETE
│   │   └── invoices/           # GET list, POST create
│   ├── login/                  # Login page
│   └── unauthorized/           # Access denied page
├── components/
│   ├── layout/
│   │   └── sidebar.tsx         # Role-aware navigation
│   └── ui/                     # shadcn/ui components
├── lib/
│   ├── auth.ts                 # NextAuth config
│   ├── prisma.ts               # Prisma client singleton
│   └── utils.ts                # formatCurrency, formatDate, etc.
└── types/
    └── next-auth.d.ts          # Extended session types
prisma/
├── schema.prisma               # Full database schema
└── seed.ts                     # Demo data seeder
```

---

## Database Schema (Key Models)

- **User** — shared auth for all roles
- **Pilot** — FAA credentials, markets, equipment, insurance, w9
- **PilotMarket** — geographic service areas per pilot
- **Equipment** — drone inventory per pilot
- **Client** — companies (agencies, commercial, real estate)
- **Job** — dispatch record; links client + pilot(s)
- **JobAssignment** — pilot ↔ job junction with payment link
- **JobFile** — delivered photos/videos/reports
- **Invoice** — client billing with line items
- **PilotPayment** — pilot payout tracking
- **ComplianceDoc** — FAA Part 107, insurance COI, W-9, etc.

---

## Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run db:generate  # Regenerate Prisma Client after schema change
npm run db:push      # Push schema to database (no migration file)
npm run db:migrate   # Create and apply a named migration
npm run db:studio    # Open Prisma Studio (visual DB browser)
npm run db:seed      # Seed demo data
```

---

## Deployment

### Vercel (Frontend)

1. Push to GitHub
2. Import the repo in [vercel.com](https://vercel.com)
3. Add environment variables: `DATABASE_URL`, `AUTH_SECRET`, `NEXTAUTH_URL`
4. Deploy

### Railway (Database)

1. Create a new **PostgreSQL** service on [railway.app](https://railway.app)
2. Copy the connection string → paste as `DATABASE_URL` in Vercel
3. Run `npm run db:push` once to create tables
4. Run `npm run db:seed` to add starter data

---

## Key Business Flows

### Onboarding a Pilot
1. Admin → Pilots → **Add Pilot** — creates user account + pilot profile
2. Pilot logs in at `/pilot/dashboard`
3. Upload compliance docs (FAA cert, insurance COI, W-9) via documents page

### Creating a Job
1. Admin → Jobs → **Create Job** — select client, assign pilot, set price
2. Job status flows: `DRAFT → PENDING_ASSIGNMENT → ASSIGNED → IN_PROGRESS → CAPTURE_COMPLETE → DELIVERED → COMPLETED`
3. Admin can update status inline from the job detail page

### Client Onboarding
1. Admin → Clients → **Add Client** — optionally enable client portal login
2. Client logs in at `/client/dashboard` to view their projects and invoices

### Invoicing
1. Admin → Invoices → **Create Invoice** — select client, set amount, due date
2. Invoice numbers auto-generated: `LA-2025-0001`
3. Mark paid when payment received

---

## Backlog / Future Features

> Items to build next — add ideas here as they come up

### High Priority
- [ ] **Guided Onboarding Walkthrough** — When Bailey first logs in, show an interactive step-by-step tour using the seeded demo data. Each step highlights a feature (Command Center stats, Jobs board, Lead Pipeline, Calendar, etc.) with a tooltip/overlay explaining what it does and why it matters. Triggered by a "Start Tour" button or automatically on first login. Track completion in localStorage or a DB flag on the User model.
- [ ] **Volo memory / context** — Persist recent CRM activity (overdue invoices, unassigned jobs, hot leads) into Volo's context so it can give truly live advice without Bailey asking
- [ ] **Pilot mobile view** — Optimize pilot portal for phone use (they're in the field)
- [ ] **Job status push notifications** — Notify pilot by email/SMS when assigned a job
- [ ] **E-signature flow** — Allow clients to sign contracts directly in the portal
- [ ] **Stripe integration** — Client invoice payments online

### Nice To Have
- [ ] Bulk job import via CSV
- [ ] Client self-service quote request form (public-facing)
- [ ] Pilot rating and review system after job completion
- [ ] Automated overdue invoice reminders via email
- [ ] Map view of all active job locations

---

## Built By

**NyxCollective™** — proprietary CRM platform built for Lumin Aerial LLC and Bailey Sargent.

> © 2026 NyxCollective™. All rights reserved. Lumin Aerial™ is a trademark of Lumin Aerial LLC.
