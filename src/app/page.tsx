import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Briefcase, Users, FileText, Map,
  ShieldCheck, TrendingUp, Zap, Building2, Rocket, Star,
  MessageSquare, Globe, Lock, ExternalLink,
} from "lucide-react";

const FEATURES = [
  {
    icon: Briefcase,
    color: "#00d4ff",
    glow: "rgba(0,212,255,0.25)",
    title: "Job Lifecycle Management",
    desc: "Create, assign, schedule, and track every drone job from quote to final delivery. Real-time status updates for you and your clients.",
  },
  {
    icon: Users,
    color: "#a78bfa",
    glow: "rgba(167,139,250,0.25)",
    title: "Pilot Network Management",
    desc: "Manage your entire pilot roster including certifications, W-9s, availability, and payouts in one place.",
  },
  {
    icon: FileText,
    color: "#fbbf24",
    glow: "rgba(251,191,36,0.25)",
    title: "Invoicing and Stripe Payments",
    desc: "Generate professional invoices, collect payments via Stripe, and sync to QuickBooks automatically.",
  },
  {
    icon: Map,
    color: "#34d399",
    glow: "rgba(52,211,153,0.25)",
    title: "Client Map and RouteIQ",
    desc: "Visualize your entire client base on an interactive map. Plan optimized visit routes with one click using RouteIQ.",
  },
  {
    icon: ShieldCheck,
    color: "#fb923c",
    glow: "rgba(251,146,60,0.25)",
    title: "Compliance and 1099s",
    desc: "Track FAA certificates, Part 107 waivers, insurance docs, and auto-generate 1099-NEC reports at tax time.",
  },
  {
    icon: TrendingUp,
    color: "#f472b6",
    glow: "rgba(244,114,182,0.25)",
    title: "Analytics and Reports",
    desc: "Revenue trends, lead source attribution, win-rate by channel, and quarterly summaries. CSV exports included.",
  },
  {
    icon: MessageSquare,
    color: "#60a5fa",
    glow: "rgba(96,165,250,0.25)",
    title: "Lead Pipeline and Quote Intake",
    desc: "Kanban-style lead tracking with a public quote request form. Convert leads to clients in seconds.",
  },
  {
    icon: Globe,
    color: "#00d4ff",
    glow: "rgba(0,212,255,0.25)",
    title: "Client and Pilot Portals",
    desc: "Separate branded portals for clients to view projects, invoices, and deliverables, and for pilots to manage jobs, payments, and documents.",
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
    color: "#00d4ff",
  },
  {
    name: "Desert Sky Aerial",
    role: "10-pilot Regional Network",
    text: "The pilot dispatch and compliance tracking alone is worth it. Our 1099 season went from a nightmare to a 20-minute job.",
    stars: 5,
    color: "#a78bfa",
  },
  {
    name: "Apex Drone Solutions",
    role: "Commercial Real Estate Imaging",
    text: "Clients love their portal. They can see job progress, download deliverables, and pay invoices without ever calling us.",
    stars: 5,
    color: "#34d399",
  },
];

const TIERS = [
  {
    icon: Zap, color: "#00d4ff", glow: "rgba(0,212,255,0.15)", title: "Solo Operators",
    features: ["Job tracking and invoicing", "Client portal", "Compliance docs", "1099 readiness"],
  },
  {
    icon: Building2, color: "#a78bfa", glow: "rgba(167,139,250,0.15)", title: "Regional Networks",
    features: ["Multi-pilot dispatch", "Lead pipeline and quotes", "Analytics dashboard", "Full white-label"],
  },
  {
    icon: Rocket, color: "#fbbf24", glow: "rgba(251,191,36,0.15)", title: "Enterprise Fleets",
    features: ["Territory management", "QuickBooks sync", "API access", "Custom subdomain portal"],
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
        overflowX: "hidden",
      }}
    >
      {/* Ambient orbs */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{
          position: "absolute", top: "-20vh", left: "10%",
          width: "60vw", height: "60vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.07) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", top: "30vh", right: "-10%",
          width: "50vw", height: "50vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
        <div style={{
          position: "absolute", bottom: "10vh", left: "20%",
          width: "40vw", height: "40vw", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)",
          filter: "blur(40px)",
        }} />
      </div>

      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid rgba(0,212,255,0.1)",
          padding: "0 2rem",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: "rgba(4,8,15,0.7)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          zIndex: 50,
          boxShadow: "0 1px 0 rgba(0,212,255,0.06), 0 4px 24px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(167,139,250,0.2))",
              border: "1px solid rgba(0,212,255,0.35)",
              boxShadow: "0 0 16px rgba(0,212,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 15, fontWeight: 800, color: "#00d4ff",
            }}
          >
            N
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>NyxAerial</span>
            <span style={{ fontSize: 11, color: "rgba(216,232,244,0.4)", marginLeft: 6 }}>by NyxCollective</span>
          </div>
          <span
            style={{
              fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 5,
              background: "rgba(0,212,255,0.12)", color: "#00d4ff",
              border: "1px solid rgba(0,212,255,0.2)", marginLeft: 2,
              letterSpacing: "0.04em",
            }}
          >
            CRM
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {[
            { href: "/pricing", label: "Pricing" },
            { href: "/quote", label: "Get a Quote" },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              style={{
                fontSize: 13, fontWeight: 500, padding: "7px 15px", borderRadius: 8,
                color: "rgba(216,232,244,0.65)", textDecoration: "none",
              }}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            style={{
              fontSize: 13, fontWeight: 600, padding: "7px 16px", borderRadius: 9,
              color: "#00d4ff",
              border: "1px solid rgba(0,212,255,0.25)",
              background: "rgba(0,212,255,0.05)",
              textDecoration: "none",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            style={{
              fontSize: 13, fontWeight: 700, padding: "8px 18px", borderRadius: 9,
              background: "linear-gradient(135deg, #00d4ff, #0099cc)",
              color: "#04080f",
              textDecoration: "none",
              boxShadow: "0 0 20px rgba(0,212,255,0.35), 0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            Request Access
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "110px 2rem 90px", maxWidth: 900, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(0,212,255,0.07)",
            border: "1px solid rgba(0,212,255,0.2)",
            backdropFilter: "blur(10px)",
            borderRadius: 999, padding: "6px 16px", fontSize: 12, fontWeight: 700,
            color: "#00d4ff", marginBottom: 36,
            boxShadow: "0 0 20px rgba(0,212,255,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <Zap style={{ width: 12, height: 12 }} />
          Built exclusively for FAA Part 107 drone operators
        </div>

        <h1
          style={{
            fontSize: "clamp(2.4rem, 6.5vw, 4.2rem)", fontWeight: 900,
            lineHeight: 1.08, marginBottom: 28,
            background: "linear-gradient(135deg, #ffffff 0%, #a8d8f0 30%, #00d4ff 60%, #a78bfa 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "-0.02em",
          }}
        >
          The CRM built for<br />drone businesses
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2.5vw, 1.2rem)", color: "rgba(216,232,244,0.6)",
            maxWidth: 600, margin: "0 auto 44px", lineHeight: 1.75,
          }}
        >
          Manage jobs, pilots, clients, invoices, compliance docs, and 1099s in one platform
          designed around how aerial service businesses actually work.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            href="/signup"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              background: "linear-gradient(135deg, #00d4ff, #0099cc)",
              color: "#04080f", fontWeight: 800,
              fontSize: 15, padding: "14px 30px", borderRadius: 13, textDecoration: "none",
              boxShadow: "0 0 30px rgba(0,212,255,0.4), 0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            Request Access <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
          <Link
            href="/pricing"
            style={{
              display: "inline-flex", alignItems: "center", gap: 9,
              background: "rgba(255,255,255,0.04)",
              backdropFilter: "blur(10px)",
              color: "#d8e8f4",
              border: "1px solid rgba(255,255,255,0.12)",
              fontWeight: 600, fontSize: 15, padding: "14px 30px", borderRadius: 13, textDecoration: "none",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.3)",
            }}
          >
            View Pricing
          </Link>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 2, marginTop: 80,
            borderRadius: 20, overflow: "hidden",
            border: "1px solid rgba(0,212,255,0.1)",
            boxShadow: "0 0 40px rgba(0,212,255,0.06), inset 0 1px 0 rgba(255,255,255,0.04)",
            background: "rgba(0,212,255,0.04)",
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                padding: "32px 16px", textAlign: "center",
                background: "rgba(4,8,15,0.55)",
                backdropFilter: "blur(16px)",
              }}
            >
              <div style={{ fontSize: "2rem", fontWeight: 900, color: "#00d4ff", letterSpacing: "-0.02em" }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "rgba(216,232,244,0.45)", marginTop: 5, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "90px 2rem", maxWidth: 1120, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <h2 style={{ fontSize: "clamp(1.7rem, 4vw, 2.5rem)", fontWeight: 900, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Everything your operation needs
          </h2>
          <p style={{ color: "rgba(216,232,244,0.5)", fontSize: 15, maxWidth: 520, margin: "0 auto", lineHeight: 1.7 }}>
            Not a generic CRM bolted onto drones. Every feature is built around Part 107 workflows.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(265px, 1fr))", gap: 18 }}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "28px 24px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", top: -30, left: -30,
                width: 100, height: 100, borderRadius: "50%",
                background: `radial-gradient(circle, ${f.glow} 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />
              <div
                style={{
                  width: 44, height: 44, borderRadius: 12, marginBottom: 18,
                  background: `linear-gradient(135deg, ${f.color}20, ${f.color}08)`,
                  border: `1px solid ${f.color}35`,
                  boxShadow: `0 0 16px ${f.color}20, inset 0 1px 0 rgba(255,255,255,0.08)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <f.icon style={{ width: 19, height: 19, color: f.color }} />
              </div>
              <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 9, color: "#e8f4ff" }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "rgba(216,232,244,0.5)", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tiers */}
      <section
        style={{
          padding: "90px 2rem",
          position: "relative", zIndex: 1,
          background: "linear-gradient(180deg, transparent, rgba(0,212,255,0.025) 50%, transparent)",
        }}
      >
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h2 style={{ fontSize: "clamp(1.7rem, 4vw, 2.4rem)", fontWeight: 900, marginBottom: 14, letterSpacing: "-0.02em" }}>
              Built for every tier of drone business
            </h2>
            <p style={{ color: "rgba(216,232,244,0.5)", fontSize: 15, maxWidth: 480, margin: "0 auto" }}>
              From solo Part 107 pilots to multi-state enterprise fleets, NyxAerial scales with you.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
            {TIERS.map((t) => (
              <div
                key={t.title}
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.01))",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: `1px solid ${t.color}20`,
                  borderRadius: 22, padding: "32px 28px",
                  boxShadow: `0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)`,
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  position: "absolute", top: -40, right: -40,
                  width: 140, height: 140, borderRadius: "50%",
                  background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                <div
                  style={{
                    width: 50, height: 50, borderRadius: 14, marginBottom: 22,
                    background: `linear-gradient(135deg, ${t.color}25, ${t.color}08)`,
                    border: `1px solid ${t.color}35`,
                    boxShadow: `0 0 20px ${t.color}22, inset 0 1px 0 rgba(255,255,255,0.1)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <t.icon style={{ width: 22, height: 22, color: t.color }} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 18, marginBottom: 18, color: t.color }}>{t.title}</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {t.features.map((feat) => (
                    <li key={feat} style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "rgba(216,232,244,0.72)" }}>
                      <CheckCircle2 style={{ width: 15, height: 15, color: t.color, flexShrink: 0 }} />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "90px 2rem", maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, marginBottom: 14, letterSpacing: "-0.02em" }}>
            Trusted by drone operators
          </h2>
          <p style={{ color: "rgba(216,232,244,0.5)", fontSize: 15, maxWidth: 440, margin: "0 auto" }}>
            Operators across the country use NyxAerial to run leaner, faster businesses.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              style={{
                background: "linear-gradient(145deg, rgba(255,255,255,0.045), rgba(255,255,255,0.01))",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 20, padding: "30px 26px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
                position: "relative", overflow: "hidden",
              }}
            >
              <div style={{
                position: "absolute", bottom: -30, right: -30,
                width: 110, height: 110, borderRadius: "50%",
                background: `radial-gradient(circle, ${t.color}12 0%, transparent 70%)`,
                pointerEvents: "none",
              }} />
              <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} style={{ width: 14, height: 14, fill: "#fbbf24", color: "#fbbf24" }} />
                ))}
              </div>
              <p style={{ fontSize: 14, color: "rgba(216,232,244,0.78)", lineHeight: 1.75, marginBottom: 22 }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.color}30, ${t.color}10)`,
                  border: `1px solid ${t.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, color: t.color,
                }}>
                  {t.name.charAt(0)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#e8f4ff" }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(216,232,244,0.4)" }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "0 2rem 100px", position: "relative", zIndex: 1 }}>
        <div
          style={{
            maxWidth: 880, margin: "0 auto",
            borderRadius: 28, padding: "70px 48px", textAlign: "center",
            background: "linear-gradient(145deg, rgba(0,212,255,0.08), rgba(167,139,250,0.06), rgba(0,212,255,0.04))",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(0,212,255,0.15)",
            boxShadow: "0 0 80px rgba(0,212,255,0.08), 0 24px 64px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)",
            position: "relative", overflow: "hidden",
          }}
        >
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%", height: "60%", borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(0,212,255,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.4rem)", fontWeight: 900, marginBottom: 16, letterSpacing: "-0.02em" }}>
            Ready to run a tighter operation?
          </h2>
          <p style={{ color: "rgba(216,232,244,0.6)", fontSize: 15, maxWidth: 480, margin: "0 auto 40px", lineHeight: 1.7 }}>
            Fill out the request form and we will get your account set up within 24 hours.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/signup"
              style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                background: "linear-gradient(135deg, #00d4ff, #0099cc)",
                color: "#04080f", fontWeight: 800,
                fontSize: 15, padding: "14px 30px", borderRadius: 13, textDecoration: "none",
                boxShadow: "0 0 30px rgba(0,212,255,0.4), 0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              Request Access <ArrowRight style={{ width: 16, height: 16 }} />
            </Link>
            <Link
              href="/pricing"
              style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(10px)",
                color: "#d8e8f4",
                border: "1px solid rgba(255,255,255,0.12)",
                fontWeight: 600, fontSize: 15, padding: "14px 30px", borderRadius: 13, textDecoration: "none",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              See Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          padding: "36px 2rem",
          position: "relative", zIndex: 1,
          background: "rgba(4,8,15,0.6)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 32, height: 32, borderRadius: 9,
                background: "linear-gradient(135deg, rgba(0,212,255,0.2), rgba(167,139,250,0.15))",
                border: "1px solid rgba(0,212,255,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 800, color: "#00d4ff",
              }}>N</div>
              <div>
                <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>NyxAerial CRM</span>
                <span style={{ fontSize: 11, color: "rgba(216,232,244,0.3)", marginLeft: 6 }}>a NyxCollective LLC product</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
              {[
                { href: "/pricing", label: "Pricing" },
                { href: "/quote", label: "Get a Quote" },
                { href: "/privacy", label: "Privacy" },
                { href: "/terms", label: "Terms" },
                { href: "/login", label: "Sign In" },
              ].map((l) => (
                <Link key={l.href} href={l.href} style={{ color: "rgba(216,232,244,0.38)", textDecoration: "none", fontSize: 13 }}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.04)",
            paddingTop: 20,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 12,
            fontSize: 12, color: "rgba(216,232,244,0.28)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Lock style={{ width: 11, height: 11 }} />
              &copy; {new Date().getFullYear()} NyxCollective LLC. All rights reserved. NyxAerial is a trademark of NyxCollective LLC.
            </div>
            <a
              href="https://nyxcollective.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(0,212,255,0.4)", textDecoration: "none", fontSize: 12 }}
            >
              nyxcollective.com <ExternalLink style={{ width: 10, height: 10 }} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}