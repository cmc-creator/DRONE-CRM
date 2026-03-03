import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Briefcase, Users, FileText, Map,
  ShieldCheck, TrendingUp, Zap, Building2, Rocket, Star,
  MessageSquare, Globe, Lock,
} from "lucide-react";

const FEATURES = [
  {
    icon: Briefcase,
    color: "#00d4ff",
    title: "Job Lifecycle Management",
    desc: "Create, assign, schedule, and track every drone job from quote to final delivery. Real-time status updates for you and your clients.",
  },
  {
    icon: Users,
    color: "#a78bfa",
    title: "Pilot Network Management",
    desc: "Manage your entire pilot roster — certifications, W-9s, availability, and payouts — all in one place.",
  },
  {
    icon: FileText,
    color: "#fbbf24",
    title: "Invoicing & Stripe Payments",
    desc: "Generate professional invoices, collect payments via Stripe, and sync to QuickBooks automatically.",
  },
  {
    icon: Map,
    color: "#34d399",
    title: "Client Map & RouteIQ",
    desc: "Visualise your entire client base on an interactive map. Plan optimised visit routes with one click using RouteIQ.",
  },
  {
    icon: ShieldCheck,
    color: "#fb923c",
    title: "Compliance & 1099s",
    desc: "Track FAA certificates, Part 107 waivers, insurance docs, and auto-generate 1099-NEC reports at tax time.",
  },
  {
    icon: TrendingUp,
    color: "#f472b6",
    title: "Analytics & Reports",
    desc: "Revenue trends, lead source attribution, win-rate by channel, and quarterly summaries — with CSV exports.",
  },
  {
    icon: MessageSquare,
    color: "#60a5fa",
    title: "Lead Pipeline & Quote Intake",
    desc: "Kanban-style lead tracking with a public quote request form. Convert leads to clients in seconds.",
  },
  {
    icon: Globe,
    color: "#00d4ff",
    title: "Client & Pilot Portals",
    desc: "Separate branded portals for clients (view projects, invoices, deliverables) and pilots (jobs, payments, documents).",
  },
];

const STATS = [
  { value: "10 min", label: "Average setup time" },
  { value: "100%", label: "FAA-focused workflows" },
  { value: "3", label: "Portals: Admin, Pilot, Client" },
  { value: "0 code", label: "No tech skills required" },
];

const TESTIMONIALS = [
  {
    name: "Marcus T.",
    role: "Solo Part 107 Pilot",
    text: "Cut my admin time in half. I can quote, invoice, and get paid without ever opening a spreadsheet.",
    stars: 5,
  },
  {
    name: "Desert Sky Aerial",
    role: "10-pilot Regional Network",
    text: "The pilot dispatch and compliance tracking alone is worth it. Our 1099 season went from a nightmare to a 20-minute job.",
    stars: 5,
  },
  {
    name: "Apex Drone Solutions",
    role: "Commercial Real Estate Imaging",
    text: "Clients love their portal — they can see job progress, download deliverables, and pay invoices without calling us.",
    stars: 5,
  },
];

export default function LandingPage() {
  return (
    <div
      style={{
        background: "#04080f",
        color: "#d8e8f4",
        fontFamily: "system-ui, -apple-system, sans-serif",
        minHeight: "100vh",
      }}
    >
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav
        style={{
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          padding: "0 2rem",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(4,8,15,0.92)",
          backdropFilter: "blur(12px)",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 32, height: 32, borderRadius: 8,
              background: "linear-gradient(135deg, #00d4ff22, #00d4ff44)",
              border: "1px solid rgba(0,212,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontWeight: 700, color: "#00d4ff",
            }}
          >
            N
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>NyxAerial</span>
          <span
            style={{
              fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
              background: "rgba(0,212,255,0.12)", color: "#00d4ff", marginLeft: 4,
            }}
          >
            CRM
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {[
            { href: "/pricing", label: "Pricing" },
            { href: "/quote", label: "Get a Quote" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 8,
                color: "rgba(216,232,244,0.7)",
                textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            style={{
              fontSize: 13, fontWeight: 500, padding: "6px 14px", borderRadius: 8,
              color: "#00d4ff", border: "1px solid rgba(0,212,255,0.3)",
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: 13, fontWeight: 600, padding: "7px 18px", borderRadius: 8,
              background: "#00d4ff", color: "#04080f", textDecoration: "none",
            }}
          >
            Request Access
          </Link>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ textAlign: "center", padding: "100px 2rem 80px", maxWidth: 860, margin: "0 auto" }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
            borderRadius: 999, padding: "5px 14px", fontSize: 12, fontWeight: 600,
            color: "#00d4ff", marginBottom: 32,
          }}
        >
          <Zap style={{ width: 12, height: 12 }} />
          Built exclusively for FAA Part 107 drone operators
        </div>

        <h1
          style={{
            fontSize: "clamp(2.2rem, 6vw, 3.8rem)", fontWeight: 900,
            lineHeight: 1.1, marginBottom: 24,
            background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 50%, #a78bfa 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          The CRM built for<br />drone businesses
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "rgba(216,232,244,0.65)",
            maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.7,
          }}
        >
          Manage jobs, pilots, clients, invoices, compliance docs, and 1099s — all in one platform
          designed around how aerial service businesses actually work.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/signup"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#00d4ff", color: "#04080f", fontWeight: 700,
              fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none",
            }}
          >
            Request Access <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link
            href="/pricing"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.05)", color: "#d8e8f4",
              border: "1px solid rgba(255,255,255,0.1)",
              fontWeight: 600, fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none",
            }}
          >
            View Pricing
          </Link>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1, marginTop: 72,
            background: "rgba(0,212,255,0.06)", borderRadius: 16,
            border: "1px solid rgba(0,212,255,0.08)", overflow: "hidden",
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{ padding: "28px 16px", textAlign: "center", background: "rgba(4,8,15,0.6)" }}
            >
              <div style={{ fontSize: "1.8rem", fontWeight: 800, color: "#00d4ff" }}>{s.value}</div>
              <div style={{ fontSize: 12, color: "rgba(216,232,244,0.5)", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 2rem", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 800, marginBottom: 14 }}>
            Everything your operation needs
          </h2>
          <p style={{ color: "rgba(216,232,244,0.55)", fontSize: 15, maxWidth: 560, margin: "0 auto" }}>
            Not a generic CRM bolted onto drones — every feature is built around Part 107 workflows.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: "24px",
              }}
            >
              <div
                style={{
                  width: 40, height: 40, borderRadius: 10, marginBottom: 16,
                  background: `${f.color}15`, border: `1px solid ${f.color}30`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <f.icon style={{ width: 18, height: 18, color: f.color }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(216,232,244,0.55)", lineHeight: 1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Who it&apos;s for ─────────────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 2rem",
          background: "rgba(0,212,255,0.03)",
          borderTop: "1px solid rgba(0,212,255,0.06)",
          borderBottom: "1px solid rgba(0,212,255,0.06)",
        }}
      >
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 800, marginBottom: 12 }}>
              Built for every tier of drone business
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
            {[
              {
                icon: Zap, color: "#00d4ff", title: "Solo Operators",
                features: ["Job tracking & invoicing", "Client portal", "Compliance docs", "1099 readiness"],
              },
              {
                icon: Building2, color: "#a78bfa", title: "Regional Networks",
                features: ["Multi-pilot dispatch", "Lead pipeline & quotes", "Analytics dashboard", "Full white-label"],
              },
              {
                icon: Rocket, color: "#fbbf24", title: "Enterprise Fleets",
                features: ["Territory management", "QuickBooks sync", "API access", "Custom subdomain portal"],
              },
            ].map((t) => (
              <div
                key={t.title}
                style={{
                  background: "rgba(4,8,15,0.6)", border: `1px solid ${t.color}20`,
                  borderRadius: 16, padding: 28,
                }}
              >
                <div
                  style={{
                    width: 44, height: 44, borderRadius: 12, marginBottom: 20,
                    background: `${t.color}15`, border: `1px solid ${t.color}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <t.icon style={{ width: 20, height: 20, color: t.color }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 16, color: t.color }}>{t.title}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                  {t.features.map((feat) => (
                    <li key={feat} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "rgba(216,232,244,0.75)" }}>
                      <CheckCircle2 style={{ width: 14, height: 14, color: t.color, flexShrink: 0 }} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section style={{ padding: "80px 2rem", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, marginBottom: 12 }}>
            Trusted by drone operators
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              style={{
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 16, padding: 28,
              }}
            >
              <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} style={{ width: 14, height: 14, fill: "#fbbf24", color: "#fbbf24" }} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: "rgba(216,232,244,0.75)", lineHeight: 1.7, marginBottom: 20 }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: "rgba(216,232,244,0.45)" }}>{t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section
        style={{
          margin: "0 auto 80px",
          borderRadius: 24, maxWidth: 860, padding: "60px 40px", textAlign: "center",
          background: "linear-gradient(135deg, rgba(0,212,255,0.1) 0%, rgba(167,139,250,0.08) 100%)",
          border: "1px solid rgba(0,212,255,0.15)",
        }}
      >
        <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 800, marginBottom: 14 }}>
          Ready to run a tighter operation?
        </h2>
        <p style={{ color: "rgba(216,232,244,0.6)", fontSize: 15, marginBottom: 36 }}>
          Fill out the request form and we&apos;ll get your account set up within 24 hours.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/signup"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "#00d4ff", color: "#04080f", fontWeight: 700,
              fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none",
            }}
          >
            Request Access <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link
            href="/pricing"
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "transparent", color: "#d8e8f4",
              border: "1px solid rgba(255,255,255,0.15)",
              fontWeight: 600, fontSize: 15, padding: "13px 28px", borderRadius: 12, textDecoration: "none",
            }}
          >
            See Pricing
          </Link>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "32px 2rem",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 16, maxWidth: 1100, margin: "0 auto",
          fontSize: 13, color: "rgba(216,232,244,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Lock style={{ width: 12, height: 12 }} />
          © {new Date().getFullYear()} NyxAerial. All rights reserved.
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          {[
            { href: "/pricing", label: "Pricing" },
            { href: "/privacy", label: "Privacy" },
            { href: "/terms", label: "Terms" },
            { href: "/login", label: "Sign In" },
          ].map((l) => (
            <Link key={l.href} href={l.href} style={{ color: "rgba(216,232,244,0.4)", textDecoration: "none" }}>
              {l.label}
            </Link>
          ))}
        </div>
      </footer>
    </div>
  );
}

