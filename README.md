# DRONE-CRM

A CRM system for a drone pilot business that connects drone pilots across the country with clients. Built with Next.js 16, TypeScript, Tailwind CSS, and Prisma 7 (SQLite).

## Features

- 📊 **Dashboard** — At-a-glance overview: clients, pilots, leads, jobs, and total commission earned
- 🏢 **Clients** — Full CRUD for client companies/individuals needing drone services
- 🚁 **Pilots** — Manage drone pilots with certifications, specialties, location, and hourly rate
- 🎯 **Leads** — Sales pipeline (New → Contacted → Qualified → Proposal → Won/Lost)
- 💼 **Jobs** — Connect pilots to clients, set job details, auto-calculate your commission
- 📄 **Contracts** — Link contracts to jobs, track status (Draft → Sent → Signed → Expired)

## Getting Started

### Prerequisites
- Node.js 18+

### Setup

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| ORM | Prisma 7 |
| Database | SQLite (via better-sqlite3) |
