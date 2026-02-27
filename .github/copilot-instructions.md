# NyxAerial CRM - Copilot Instructions

This is a full-stack CRM application for NyxAerial (nyxaerial.com), a nationwide drone pilot network.

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL via Prisma ORM
- **Auth**: NextAuth.js v5 (role-based: admin, pilot, client)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel (frontend) + Railway (database)

## User Roles
- **admin**: Full access — manages pilots, clients, jobs, invoicing, compliance
- **pilot**: Views assigned jobs, updates status, uploads deliverables
- **client**: Views their projects, tracks status, downloads deliverables

## Core Modules
1. Pilot management (profiles, FAA certs, availability, markets, equipment)
2. Client/lead management (agencies, commercial orgs, real estate)
3. Job/project dispatch and tracking
4. Deliverables tracking and file handoff
5. Invoicing (client billing + pilot payouts)
6. Compliance documents (FAA Part 107, insurance, equipment)

## Project Status
- [ ] Project scaffolded
- [ ] Prisma schema defined
- [ ] NextAuth configured
- [ ] Admin portal built
- [ ] Pilot portal built
- [ ] Client portal built
