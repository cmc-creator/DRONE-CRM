import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Briefcase, Users, FileText, Map,
  ShieldCheck, TrendingUp, Zap, Building2, Rocket, Star,
  MessageSquare, Globe, Lock, ExternalLink,
} from "lucide-react";

const FEATURES = [
  { icon: Briefcase,    color: "#00d4ff", glow: "rgba(0,212,255,0.25)",   title: "Job Lifecycle Management",     desc: "Create, assign, and track every job from quote to delivery. Real-time status for your whole team."      },
  { icon: Users,        color: "#a78bfa", glow: "rgba(167,139,250,0.25)", title: "Pilot Network Management",     desc: "Manage Part 107 certs, W-9s, availability, and pilot payouts in one place."                          },
  { icon: FileText,     color: "#fbbf24", glow: "rgba(251,191,36,0.25)",  title: "Invoicing and Stripe Payments",desc: "Generate invoices, collect via Stripe, and auto-sync to QuickBooks."                                },
  { icon: Map,          color: "#34d399", glow: "rgba(52,211,153,0.25)",  title: "Client Map and RouteIQ",       desc: "Visualize your client base on an interactive map. Build optimized routes with one click."           },
  { icon: ShieldCheck,  color: "#fb923c", glow: "rgba(251,146,60,0.25)",  title: "Compliance and 1099s",         desc: "Track FAA certs, Part 107 waivers, insurance docs, and auto-generate 1099-NEC reports."             },
  { icon: TrendingUp,   color: "#f472b6", glow: "rgba(244,114,182,0.25)", title: "Analytics and Reports",        desc: "Revenue trends, lead attribution, win-rate by channel, and quarterly summaries with CSV export."    },
  { icon: MessageSquare,color: "#60a5fa", glow: "rgba(96,165,250,0.25)",  title: "Lead Pipeline and Quotes",     desc: "Kanban lead tracking with a public quote form. Convert leads to paying clients in seconds."          },
  { icon: Globe,        color: "#00d4ff", glow: "rgba(0,212,255,0.25)",   title: "Client and Pilot Portals",     desc: "Branded portals let clients track jobs, pay invoices, and download deliverables without calling you." },
];

const STATS = [
  { value: "Part 107", label: "Compliance ready from day one"   },
  { value: "3 Portals", label: "Admin, Pilot, and Client roles" },
  { value: "1099-Ready", label: "Tax reports auto-generated"   },
  { value: "< 24 hr",  label: "Account activated same day"     },
];

const TESTIMONIALS = [
  { name: "Marcus T.",          role: "Solo Part 107 Pilot",               stars: 5, color: "#00d4ff", text: "Cut my admin time in half. I quote, invoice, and get paid without ever opening a spreadsheet."                    },
  { name: "Desert Sky Aerial",  role: "10-pilot Regional Network",         stars: 5, color: "#a78bfa", text: "Pilot dispatch and compliance tracking alone is worth every dollar. 1099 season is now a 20-minute task."         },
  { name: "Apex Drone Solutions",role: "Commercial Real Estate Imaging",   stars: 5, color: "#34d399", text: "Clients love the portal. They check progress, download deliverables, and pay invoices without calling us."         },
];

const TIERS = [
  { icon: Zap,       color: "#00d4ff", glow: "rgba(0,212,255,0.15)",   title: "Solo Operators",   features: ["Job tracking and invoicing","Client portal","Compliance docs","1099 readiness"]           },
  { icon: Building2, color: "#a78bfa", glow: "rgba(167,139,250,0.15)", title: "Regional Networks", features: ["Multi-pilot dispatch","Lead pipeline and quotes","Analytics dashboard","Full white-label"] },
  { icon: Rocket,    color: "#fbbf24", glow: "rgba(251,191,36,0.15)",  title: "Enterprise Fleets", features: ["Territory management","QuickBooks sync","API access","Custom subdomain portal"]            },
];

const STEPS = [
  { num: "01", color: "#00d4ff", title: "Set up your roster",         desc: "Add pilots, upload Part 107 certs and W-9s, and configure service rates in under 10 minutes."           },
  { num: "02", color: "#a78bfa", title: "Dispatch and track flights",  desc: "Create jobs, assign pilots, and keep everyone synced through their own portal."                          },
  { num: "03", color: "#34d399", title: "Invoice and close the books", desc: "Generate invoices, collect via Stripe, and export 1099s come tax season."                                },
];

const MOCK_JOBS = [
  { id: "J-1041", client: "Lakeside Realty",  type: "Real Estate",  status: "IN FLIGHT", statusColor: "#00d4ff", pilot: "R. Chen"   },
  { id: "J-1040", client: "SkyBridge Dev",    type: "Construction", status: "DELIVERED", statusColor: "#34d399", pilot: "A. Reyes"  },
  { id: "J-1039", client: "Harbor Hotels",    type: "Commercial",   status: "EDITING",   statusColor: "#fbbf24", pilot: "M. Torres" },
  { id: "J-1038", client: "Peak Real Estate", type: "Real Estate",  status: "PAID",      statusColor: "#a78bfa", pilot: "K. Patel"  },
];

export default function LandingPage() {
  return (
    <>
      <style>{`
        @keyframes pulse-ring {
          0%   { opacity: 0.55; transform: scale(0.96); }
          100% { opacity: 0;    transform: scale(1.32); }
        }
        @keyframes blink-dot {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.12; }
        }
        @keyframes float-drone {
          0%, 100% { transform: translateY(0px);  }
          50%       { transform: translateY(-14px); }
        }
        @keyframes scan-bar {
          0%   { top: -4px;  opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { top: 100%;  opacity: 0; }
        }
        @keyframes spin-ring {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes tracer {
          0%   { transform: translateX(-200%); }
          100% { transform: translateX(300%);  }
        }
      `}</style>

      <div style={{ background: "#03060e", color: "#d8e8f4", fontFamily: "system-ui,-apple-system,sans-serif", minHeight: "100vh", overflowX: "hidden" }}>

        {/* Grid */}
        <div aria-hidden style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `linear-gradient(rgba(0,212,255,0.032) 1px,transparent 1px),linear-gradient(90deg,rgba(0,212,255,0.032) 1px,transparent 1px)`,
          backgroundSize: "72px 72px",
        }} />

        {/* Scanlines */}
        <div aria-hidden style={{
          position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0,
          backgroundImage: `linear-gradient(transparent 50%, rgba(0,0,0,0.09) 50%)`,
          backgroundSize: "100% 4px",
          opacity: 0.45,
        }} />

        {/* Orbs */}
        <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", top: "-12vh", left: "0%",  width: "62vw", height: "62vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(0,212,255,0.11) 0%,transparent 70%)", filter: "blur(70px)" }} />
          <div style={{ position: "absolute", top: "22vh",  right: "-20%",width: "56vw", height: "56vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(167,139,250,0.08) 0%,transparent 70%)", filter: "blur(70px)" }} />
          <div style={{ position: "absolute", bottom: "0",  left: "18%", width: "48vw", height: "48vw", borderRadius: "50%", background: "radial-gradient(circle,rgba(52,211,153,0.05) 0%,transparent 70%)", filter: "blur(70px)" }} />
        </div>

        {/* ── Nav ── */}
        <nav style={{
          borderBottom: "1px solid rgba(0,212,255,0.1)",
          padding: "0 clamp(1rem,4vw,3rem)", height: 68,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0,
          background: "rgba(3,6,14,0.84)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          zIndex: 50,
          boxShadow: "0 1px 0 rgba(0,212,255,0.08),0 8px 32px rgba(0,0,0,0.6)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: "linear-gradient(135deg,rgba(0,212,255,0.28),rgba(167,139,250,0.15))",
              border: "1px solid rgba(0,212,255,0.45)",
              boxShadow: "0 0 26px rgba(0,212,255,0.34),inset 0 1px 0 rgba(255,255,255,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, fontWeight: 900, color: "#00d4ff",
            }}>N</div>
            <div>
              <span style={{ fontWeight: 800, fontSize: 15, color: "#fff" }}>NyxAerial</span>
              <span style={{ fontSize: 11, color: "rgba(216,232,244,0.35)", marginLeft: 6 }}>by NyxCollective</span>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5, background: "rgba(0,212,255,0.12)", color: "#00d4ff", border: "1px solid rgba(0,212,255,0.22)", marginLeft: 2, letterSpacing: "0.06em" }}>CRM</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {[{ href: "/pricing", label: "Pricing" },{ href: "/quote", label: "Get a Quote" }].map((l) => (
              <Link key={l.href} href={l.href} style={{ fontSize: 13, fontWeight: 500, padding: "7px 15px", borderRadius: 8, color: "rgba(216,232,244,0.6)", textDecoration: "none" }}>{l.label}</Link>
            ))}
            <Link href="/login"  style={{ fontSize: 13, fontWeight: 600, padding: "7px 16px",  borderRadius: 9, color: "#00d4ff", border: "1px solid rgba(0,212,255,0.25)", background: "rgba(0,212,255,0.06)", textDecoration: "none" }}>Sign In</Link>
            <Link href="/signup" style={{ fontSize: 13, fontWeight: 700, padding: "8px 18px",  borderRadius: 9, background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#03060e", textDecoration: "none", boxShadow: "0 0 26px rgba(0,212,255,0.48),0 2px 8px rgba(0,0,0,0.5)" }}>Request Access</Link>
          </div>
        </nav>

        {/* ── Hero ── */}
        <section style={{ padding: "clamp(60px,9vw,110px) clamp(1rem,5vw,4rem) 0", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(40px,6vw,80px)", alignItems: "center", justifyContent: "center" }}>

            {/* Left: copy */}
            <div style={{ flex: "1 1 340px", maxWidth: 580 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.22)",
                backdropFilter: "blur(10px)", borderRadius: 999, padding: "6px 18px",
                fontSize: 12, fontWeight: 700, color: "#00d4ff", marginBottom: 32,
                boxShadow: "0 0 32px rgba(0,212,255,0.16)",
                animation: "fade-in-up 0.7s ease both",
              }}>
                <Zap style={{ width: 12, height: 12 }} />
                Built exclusively for FAA Part 107 drone operators
              </div>

              <h1 style={{ fontSize: "clamp(2.6rem,5.8vw,5rem)", fontWeight: 900, lineHeight: 1.03, marginBottom: 26, letterSpacing: "-0.035em", animation: "fade-in-up 0.7s 0.1s ease both" }}>
                <span style={{ display: "block", background: "linear-gradient(135deg,#fff 0%,#c8e8ff 28%,#00d4ff 55%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Every job.</span>
                <span style={{ display: "block", background: "linear-gradient(135deg,#fff 0%,#c8e8ff 28%,#00d4ff 55%,#a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Every pilot.</span>
                <span style={{ display: "block", color: "rgba(216,232,244,0.26)", fontStyle: "italic", fontWeight: 800 }}>One screen.</span>
              </h1>

              <p style={{ fontSize: "clamp(1rem,1.7vw,1.16rem)", color: "rgba(216,232,244,0.55)", maxWidth: 500, lineHeight: 1.82, marginBottom: 42, animation: "fade-in-up 0.7s 0.2s ease both" }}>
                The only CRM built for aerial service operators. Jobs, pilots, compliance, and payouts — one platform built for how drone businesses work.
              </p>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 44, animation: "fade-in-up 0.7s 0.3s ease both" }}>
                <Link href="/signup" style={{
                  display: "inline-flex", alignItems: "center", gap: 10,
                  background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#03060e",
                  fontWeight: 800, fontSize: 15, padding: "15px 34px", borderRadius: 13, textDecoration: "none",
                  boxShadow: "0 0 56px rgba(0,212,255,0.58),0 6px 22px rgba(0,0,0,0.5)",
                  letterSpacing: "-0.01em",
                }}>
                  Request Access <ArrowRight style={{ width: 16, height: 16 }} />
                </Link>
                <Link href="/pricing" style={{
                  display: "inline-flex", alignItems: "center", gap: 9,
                  background: "rgba(255,255,255,0.04)", backdropFilter: "blur(12px)",
                  color: "#d8e8f4", border: "1px solid rgba(255,255,255,0.12)",
                  fontWeight: 600, fontSize: 15, padding: "15px 34px", borderRadius: 13, textDecoration: "none",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07),0 4px 18px rgba(0,0,0,0.35)",
                }}>
                  View Pricing
                </Link>
              </div>

              {/* Mini metrics */}
              <div style={{ display: "flex", gap: 32, flexWrap: "wrap", animation: "fade-in-up 0.7s 0.4s ease both" }}>
                {[{ v: "Part 107", t: "Compliance ready" },{ v: "3 Portals", t: "Admin, Pilot, Client" },{ v: "1099", t: "Auto-generated" }].map((m) => (
                  <div key={m.v} style={{ borderLeft: "2px solid rgba(0,212,255,0.3)", paddingLeft: 14 }}>
                    <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#00d4ff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{m.v}</div>
                    <div style={{ fontSize: 11, color: "rgba(216,232,244,0.4)", fontWeight: 500, marginTop: 2 }}>{m.t}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Drone + HUD */}
            <div style={{ flex: "0 0 auto", width: "clamp(280px,38vw,420px)", position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>

              {/* Pulse rings behind drone */}
              <div style={{ position: "absolute", width: "120%", height: "120%", borderRadius: "50%", border: "1px solid rgba(0,212,255,0.18)", animation: "pulse-ring 3.6s ease-out infinite" }} />
              <div style={{ position: "absolute", width: "120%", height: "120%", borderRadius: "50%", border: "1px solid rgba(0,212,255,0.12)", animation: "pulse-ring 3.6s ease-out 1.3s infinite" }} />
              <div style={{ position: "absolute", width: "106%", height: "106%", borderRadius: "50%", border: "1px solid rgba(0,212,255,0.09)" }} />

              {/* HUD frame */}
              <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 1" }}>

                {/* Corner brackets */}
                <div style={{ position: "absolute", top: 10, left: 10,  width: 24, height: 24, borderTop: "2px solid #00d4ff", borderLeft:  "2px solid #00d4ff", opacity: 0.7 }} />
                <div style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderTop: "2px solid #00d4ff", borderRight: "2px solid #00d4ff", opacity: 0.7 }} />
                <div style={{ position: "absolute", bottom: 10, left: 10,  width: 24, height: 24, borderBottom: "2px solid #00d4ff", borderLeft:  "2px solid #00d4ff", opacity: 0.7 }} />
                <div style={{ position: "absolute", bottom: 10, right: 10, width: 24, height: 24, borderBottom: "2px solid #00d4ff", borderRight: "2px solid #00d4ff", opacity: 0.7 }} />

                {/* LIVE badge */}
                <div style={{
                  position: "absolute", top: 8, right: 42, zIndex: 10,
                  display: "flex", alignItems: "center", gap: 5,
                  background: "rgba(3,6,14,0.88)", border: "1px solid rgba(0,212,255,0.28)",
                  borderRadius: 4, padding: "3px 9px",
                  fontSize: 10, fontWeight: 700, color: "#00d4ff", fontFamily: "monospace",
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#34d399", animation: "blink-dot 1.4s ease-in-out infinite" }} />
                  LIVE
                </div>

                {/* Alt / speed */}
                <div style={{
                  position: "absolute", top: 8, left: 42, zIndex: 10,
                  background: "rgba(3,6,14,0.82)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: 4, padding: "3px 9px",
                  fontSize: 9, fontFamily: "monospace", color: "rgba(0,212,255,0.65)",
                }}>ALT&nbsp;142m &nbsp;|&nbsp; 12.4&nbsp;m/s</div>

                {/* Coordinates bottom */}
                <div style={{
                  position: "absolute", bottom: 8, left: "50%", transform: "translateX(-50%)", zIndex: 10, whiteSpace: "nowrap",
                  background: "rgba(3,6,14,0.82)", border: "1px solid rgba(0,212,255,0.18)", borderRadius: 4, padding: "3px 10px",
                  fontSize: 9, fontFamily: "monospace", color: "rgba(0,212,255,0.55)",
                }}>36.1699&deg;&nbsp;N &nbsp;&nbsp; 115.1398&deg;&nbsp;W</div>

                {/* Signal bars left */}
                <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column-reverse", gap: 2, alignItems: "center", zIndex: 10 }}>
                  {[1,2,3,4].map((h) => (
                    <div key={h} style={{ width: 8, height: h * 4, background: `rgba(0,212,255,${0.18 + h * 0.2})`, borderRadius: 2 }} />
                  ))}
                  <div style={{ fontSize: 7, fontFamily: "monospace", color: "rgba(0,212,255,0.35)", marginTop: 3 }}>SIG</div>
                </div>

                {/* Battery right */}
                <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 10 }}>
                  <div style={{ fontSize: 12, color: "#34d399" }}>&#9889;</div>
                  <div style={{ fontSize: 11, fontWeight: 900, color: "#34d399", fontFamily: "monospace" }}>87%</div>
                  <div style={{ fontSize: 7, fontFamily: "monospace", color: "rgba(52,211,153,0.38)" }}>BAT</div>
                </div>

                {/* Drone SVG — centered, floating */}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", animation: "float-drone 5.5s ease-in-out infinite" }}>
                  <svg viewBox="0 0 340 340" width="80%" height="80%" fill="none"
                    style={{ filter: "drop-shadow(0 0 28px rgba(0,212,255,0.6)) drop-shadow(0 0 6px rgba(0,212,255,0.35))" }}>
                    {/* Radar rings */}
                    <circle cx="170" cy="170" r="156" stroke="#00d4ff" strokeWidth="0.5" opacity="0.07" strokeDasharray="2 8" />
                    <circle cx="170" cy="170" r="110" stroke="#00d4ff" strokeWidth="0.5" opacity="0.10" strokeDasharray="2 5" />
                    <circle cx="170" cy="170" r="66"  stroke="#00d4ff" strokeWidth="0.6" opacity="0.14" strokeDasharray="2 3" />
                    {/* Crosshairs */}
                    <line x1="170" y1="10"  x2="170" y2="50"  stroke="#00d4ff" strokeWidth="0.7" opacity="0.18" />
                    <line x1="170" y1="290" x2="170" y2="330" stroke="#00d4ff" strokeWidth="0.7" opacity="0.18" />
                    <line x1="10"  y1="170" x2="50"  y2="170" stroke="#00d4ff" strokeWidth="0.7" opacity="0.18" />
                    <line x1="290" y1="170" x2="330" y2="170" stroke="#00d4ff" strokeWidth="0.7" opacity="0.18" />
                    {/* Prop halos */}
                    <circle cx="62"  cy="62"  r="50" stroke="#00d4ff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.2" />
                    <circle cx="278" cy="62"  r="50" stroke="#00d4ff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.2" />
                    <circle cx="62"  cy="278" r="50" stroke="#00d4ff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.2" />
                    <circle cx="278" cy="278" r="50" stroke="#00d4ff" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.2" />
                    {/* Arms */}
                    <line x1="136" y1="156" x2="62"  y2="62"  stroke="#00d4ff" strokeWidth="9" strokeLinecap="round" opacity="0.95" />
                    <line x1="204" y1="156" x2="278" y2="62"  stroke="#00d4ff" strokeWidth="9" strokeLinecap="round" opacity="0.95" />
                    <line x1="136" y1="184" x2="62"  y2="278" stroke="#00d4ff" strokeWidth="9" strokeLinecap="round" opacity="0.95" />
                    <line x1="204" y1="184" x2="278" y2="278" stroke="#00d4ff" strokeWidth="9" strokeLinecap="round" opacity="0.95" />
                    {/* Body glow */}
                    <rect x="120" y="138" width="100" height="64" rx="18" fill="rgba(0,212,255,0.06)" />
                    {/* Body */}
                    <rect x="124" y="142" width="92" height="56" rx="16" fill="rgba(0,6,20,0.94)" stroke="#00d4ff" strokeWidth="1.5" />
                    {/* Inner panel */}
                    <rect x="138" y="153" width="64" height="34" rx="9" fill="rgba(0,212,255,0.07)" stroke="rgba(0,212,255,0.2)" strokeWidth="1" />
                    {/* PCB traces */}
                    <line x1="153" y1="170" x2="187" y2="170" stroke="rgba(0,212,255,0.17)" strokeWidth="1" />
                    <line x1="170" y1="156" x2="170" y2="184" stroke="rgba(0,212,255,0.17)" strokeWidth="1" />
                    <circle cx="153" cy="170" r="1.8" fill="rgba(0,212,255,0.45)" />
                    <circle cx="187" cy="170" r="1.8" fill="rgba(0,212,255,0.45)" />
                    {/* Camera dome */}
                    <circle cx="170" cy="170" r="18" fill="rgba(0,3,16,0.96)" stroke="#00d4ff" strokeWidth="1.5" />
                    <circle cx="170" cy="170" r="11" fill="rgba(0,212,255,0.14)" stroke="#00d4ff" strokeWidth="1" opacity="0.8" />
                    <circle cx="170" cy="170" r="5.5" fill="#00d4ff" opacity="0.88" />
                    <circle cx="166" cy="166" r="2.2" fill="rgba(255,255,255,0.55)" />
                    {/* Front LED green */}
                    <circle cx="170" cy="145" r="5"  fill="#34d399" />
                    <circle cx="170" cy="145" r="9"  stroke="#34d399" strokeWidth="1" opacity="0.32" />
                    {/* Back LED red */}
                    <circle cx="170" cy="195" r="5"  fill="#f87171" />
                    <circle cx="170" cy="195" r="9"  stroke="#f87171" strokeWidth="1" opacity="0.28" />
                    {/* Prop blades FL */}
                    <ellipse cx="62" cy="62" rx="44" ry="5.5" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.9" transform="rotate(-45 62 62)" />
                    <ellipse cx="62" cy="62" rx="44" ry="5.5" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.9" transform="rotate(45 62 62)" />
                    {/* Prop blades FR */}
                    <ellipse cx="278" cy="62" rx="44" ry="5.5" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.9" transform="rotate(-45 278 62)" />
                    <ellipse cx="278" cy="62" rx="44" ry="5.5" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.9" transform="rotate(45 278 62)" />
                    {/* Prop blades BL */}
                    <ellipse cx="62" cy="278" rx="44" ry="5.5" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.9" transform="rotate(-45 62 278)" />
                    <ellipse cx="62" cy="278" rx="44" ry="5.5" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.9" transform="rotate(45 62 278)" />
                    {/* Prop blades BR */}
                    <ellipse cx="278" cy="278" rx="44" ry="5.5" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.9" transform="rotate(-45 278 278)" />
                    <ellipse cx="278" cy="278" rx="44" ry="5.5" fill="rgba(0,212,255,0.2)" stroke="#00d4ff" strokeWidth="0.9" transform="rotate(45 278 278)" />
                    {/* Motor mounts */}
                    <circle cx="62"  cy="62"  r="15" fill="rgba(0,212,255,0.22)" stroke="#00d4ff" strokeWidth="1.5" />
                    <circle cx="62"  cy="62"  r="7"  fill="rgba(0,212,255,0.6)"  />
                    <circle cx="278" cy="62"  r="15" fill="rgba(0,212,255,0.22)" stroke="#00d4ff" strokeWidth="1.5" />
                    <circle cx="278" cy="62"  r="7"  fill="rgba(0,212,255,0.6)"  />
                    <circle cx="62"  cy="278" r="15" fill="rgba(0,212,255,0.22)" stroke="#00d4ff" strokeWidth="1.5" />
                    <circle cx="62"  cy="278" r="7"  fill="rgba(0,212,255,0.6)"  />
                    <circle cx="278" cy="278" r="15" fill="rgba(0,212,255,0.22)" stroke="#00d4ff" strokeWidth="1.5" />
                    <circle cx="278" cy="278" r="7"  fill="rgba(0,212,255,0.6)"  />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats strip ── */}
        <section style={{ padding: "60px clamp(1rem,5vw,4rem) 80px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2,
            borderRadius: 20, overflow: "hidden",
            border: "1px solid rgba(0,212,255,0.13)",
            boxShadow: "0 0 70px rgba(0,212,255,0.08),inset 0 1px 0 rgba(255,255,255,0.05)",
            background: "rgba(0,212,255,0.025)",
          }}>
            {STATS.map((s) => (
              <div key={s.label} style={{ padding: "32px 18px", textAlign: "center", background: "rgba(3,6,14,0.65)", backdropFilter: "blur(16px)" }}>
                <div style={{ fontSize: "clamp(1.25rem,2.6vw,1.85rem)", fontWeight: 900, color: "#00d4ff", letterSpacing: "-0.02em", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 11, color: "rgba(216,232,244,0.4)", marginTop: 8, fontWeight: 500, lineHeight: 1.4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Dashboard Mockup ── */}
        <section style={{ padding: "0 clamp(1rem,5vw,4rem) 100px", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,212,255,0.58)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 10 }}>Platform Preview</p>
            <h2 style={{ fontSize: "clamp(1.4rem,3.5vw,2.1rem)", fontWeight: 800, letterSpacing: "-0.02em", color: "rgba(216,232,244,0.7)" }}>
              See what running on NyxAerial looks like
            </h2>
          </div>

          <div style={{ borderRadius: 20, overflow: "hidden", border: "1px solid rgba(0,212,255,0.17)", boxShadow: "0 0 120px rgba(0,212,255,0.15),0 50px 100px rgba(0,0,0,0.75),inset 0 1px 0 rgba(255,255,255,0.07)", position: "relative" }}>
            {/* Scan bar animation */}
            <div style={{ position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.5),transparent)", animation: "scan-bar 4.5s linear infinite", zIndex: 10, pointerEvents: "none" }} />

            {/* Browser chrome */}
            <div style={{ background: "rgba(4,8,18,0.99)", padding: "11px 18px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid rgba(0,212,255,0.09)" }}>
              <div style={{ display: "flex", gap: 7 }}>
                {["#ff5f56","#ffbd2e","#27c93f"].map((c) => <div key={c} style={{ width: 11, height: 11, borderRadius: "50%", background: c, opacity: 0.65 }} />)}
              </div>
              <div style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 7, padding: "5px 14px", fontSize: 11, color: "rgba(216,232,244,0.28)", fontFamily: "monospace" }}>
                app.nyxaerial.com/admin/dashboard
              </div>
              <div style={{ width: 52, height: 16, borderRadius: 4, background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.14)" }} />
            </div>

            {/* App layout */}
            <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", background: "rgba(2,5,13,0.99)", minHeight: 460 }}>

              {/* Sidebar */}
              <div style={{ borderRight: "1px solid rgba(0,212,255,0.07)", padding: "18px 10px", display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", marginBottom: 14 }}>
                  <div style={{ width: 26, height: 26, borderRadius: 7, background: "rgba(0,212,255,0.16)", border: "1px solid rgba(0,212,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "#00d4ff" }}>N</div>
                  <span style={{ fontWeight: 800, fontSize: 12, color: "#fff" }}>NyxAerial</span>
                </div>
                {[
                  { label: "Dashboard",  active: true  },
                  { label: "Jobs",       active: false },
                  { label: "Pilots",     active: false },
                  { label: "Clients",    active: false },
                  { label: "Invoices",   active: false },
                  { label: "Leads",      active: false },
                  { label: "Compliance", active: false },
                  { label: "Analytics",  active: false },
                ].map((item) => (
                  <div key={item.label} style={{
                    padding: "7px 10px", borderRadius: 7, fontSize: 11,
                    fontWeight: item.active ? 700 : 500,
                    color:  item.active ? "#00d4ff" : "rgba(216,232,244,0.34)",
                    background: item.active ? "rgba(0,212,255,0.1)"  : "transparent",
                    border:     item.active ? "1px solid rgba(0,212,255,0.16)" : "1px solid transparent",
                  }}>{item.label}</div>
                ))}
                <div style={{ marginTop: "auto", padding: "7px 10px", borderRadius: 7, fontSize: 11, color: "rgba(251,191,36,0.72)", background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.15)" }}>
                  &#9889; Ask Volo
                </div>
              </div>

              {/* Main */}
              <div style={{ padding: "22px 26px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#e8f4ff" }}>Command Center</div>
                    <div style={{ fontSize: 11, color: "rgba(216,232,244,0.3)", marginTop: 2 }}>Sunday, July 6, 2026</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <div style={{ padding: "5px 13px", borderRadius: 7, background: "rgba(0,212,255,0.08)",   border: "1px solid rgba(0,212,255,0.18)",   fontSize: 11, fontWeight: 700, color: "#00d4ff" }}>+ New Job</div>
                    <div style={{ padding: "5px 13px", borderRadius: 7, background: "rgba(167,139,250,0.08)", border: "1px solid rgba(167,139,250,0.18)", fontSize: 11, fontWeight: 700, color: "#a78bfa" }}>+ Invoice</div>
                  </div>
                </div>

                {/* Mini stats */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Active Jobs",      value: "12",     color: "#00d4ff" },
                    { label: "Revenue MTD",      value: "$18.4k", color: "#34d399" },
                    { label: "Open Invoices",    value: "7",      color: "#fbbf24" },
                    { label: "Pilots Available", value: "4 / 6",  color: "#a78bfa" },
                  ].map((s) => (
                    <div key={s.label} style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${s.color}18`, borderRadius: 9, padding: "12px 14px" }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: s.color, letterSpacing: "-0.02em" }}>{s.value}</div>
                      <div style={{ fontSize: 10, color: "rgba(216,232,244,0.34)", marginTop: 4 }}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Alert */}
                <div style={{ background: "rgba(251,191,36,0.07)", border: "1px solid rgba(251,191,36,0.18)", borderRadius: 8, padding: "8px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12 }}>&#9888;</span>
                  <span style={{ fontSize: 11, color: "rgba(251,191,36,0.85)", fontWeight: 600 }}>2 pilot certs expiring within 30 days</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "rgba(251,191,36,0.5)", fontWeight: 600 }}>Review</span>
                </div>

                {/* Jobs table */}
                <div style={{ background: "rgba(255,255,255,0.018)", border: "1px solid rgba(255,255,255,0.055)", borderRadius: 11, overflow: "hidden" }}>
                  <div style={{ padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "grid", gridTemplateColumns: "75px 1fr 110px 85px 95px", gap: 10, fontSize: 9, fontWeight: 600, color: "rgba(216,232,244,0.28)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    <span>Job ID</span><span>Client</span><span>Type</span><span>Pilot</span><span>Status</span>
                  </div>
                  {MOCK_JOBS.map((job) => (
                    <div key={job.id} style={{ padding: "9px 14px", borderBottom: "1px solid rgba(255,255,255,0.03)", display: "grid", gridTemplateColumns: "75px 1fr 110px 85px 95px", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,212,255,0.65)", fontFamily: "monospace" }}>{job.id}</span>
                      <span style={{ fontSize: 11, color: "#d8e8f4" }}>{job.client}</span>
                      <span style={{ fontSize: 11, color: "rgba(216,232,244,0.4)" }}>{job.type}</span>
                      <span style={{ fontSize: 11, color: "rgba(216,232,244,0.4)" }}>{job.pilot}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 5, background: `${job.statusColor}15`, color: job.statusColor, border: `1px solid ${job.statusColor}28`, display: "inline-block" }}>{job.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ padding: "80px clamp(1rem,5vw,4rem)", maxWidth: 1300, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,212,255,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Feature Set</p>
            <h2 style={{ fontSize: "clamp(1.9rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 18, letterSpacing: "-0.03em" }}>
              Built for every part of your operation
            </h2>
            <p style={{ color: "rgba(216,232,244,0.5)", fontSize: 16, maxWidth: 560, margin: "0 auto", lineHeight: 1.72 }}>
              Not a generic CRM retrofitted for drones — every feature is built for Part 107 aerial operators.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(270px,1fr))", gap: 20 }}>
            {FEATURES.map((f, i) => (
              <div key={f.title} style={{
                background: "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.014))",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${f.color}1c`,
                borderRadius: 22, padding: "30px 26px",
                boxShadow: `0 8px 40px rgba(0,0,0,0.38),inset 0 1px 0 rgba(255,255,255,0.07)`,
                position: "relative", overflow: "hidden",
              }}>
                {/* Top accent + tracer */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${f.color}22,transparent)` }} />
                <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: 2, background: `linear-gradient(90deg,transparent,${f.color}cc,rgba(255,255,255,0.88),${f.color}cc,transparent)`, animation: `tracer ${3.5 + i * 0.35}s linear ${i * 0.55}s infinite` }} />
                <div style={{ position: "absolute", top: -42, left: -42, width: 140, height: 140, borderRadius: "50%", background: `radial-gradient(circle,${f.glow} 0%,transparent 70%)`, pointerEvents: "none" }} />
                <div style={{
                  width: 52, height: 52, borderRadius: 14, marginBottom: 20,
                  background: `linear-gradient(135deg,${f.color}22,${f.color}07)`,
                  border: `1px solid ${f.color}38`,
                  boxShadow: `0 0 28px ${f.color}28,inset 0 1px 0 rgba(255,255,255,0.1)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <f.icon style={{ width: 22, height: 22, color: f.color }} />
                </div>
                <h3 style={{ fontWeight: 800, fontSize: 16, marginBottom: 10, color: "#e8f4ff" }}>{f.title}</h3>
                <p style={{ fontSize: 13.5, color: "rgba(216,232,244,0.52)", lineHeight: 1.68, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── How It Works ── */}
        <section style={{ padding: "90px clamp(1rem,5vw,4rem)", position: "relative", zIndex: 1, background: "linear-gradient(180deg,transparent,rgba(167,139,250,0.03) 50%,transparent)" }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(167,139,250,0.72)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>How It Works</p>
              <h2 style={{ fontSize: "clamp(1.9rem,5vw,3.2rem)", fontWeight: 900, letterSpacing: "-0.03em" }}>
                Up and running in an afternoon
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 28 }}>
              {STEPS.map((step, i) => (
                <div key={step.num} style={{
                  background: "linear-gradient(145deg,rgba(255,255,255,0.042),rgba(255,255,255,0.012))",
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${step.color}22`,
                  borderRadius: 24, padding: "38px 32px",
                  boxShadow: `0 12px 44px rgba(0,0,0,0.32),inset 0 1px 0 rgba(255,255,255,0.06)`,
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Top accent + tracer */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${step.color}22,transparent)` }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: 2, background: `linear-gradient(90deg,transparent,${step.color}cc,rgba(255,255,255,0.88),${step.color}cc,transparent)`, animation: `tracer ${4 + i * 0.4}s linear ${i * 0.8}s infinite` }} />
                  <div style={{ position: "absolute", top: -20, right: -20, width: 130, height: 130, borderRadius: "50%", background: `radial-gradient(circle,${step.color}12 0%,transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{ fontFamily: "monospace", fontSize: "4.2rem", fontWeight: 900, color: `${step.color}1c`, lineHeight: 1, marginBottom: 22, letterSpacing: "-0.04em" }}>{step.num}</div>
                  <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 13, color: step.color }}>{step.title}</h3>
                  <p style={{ fontSize: 14.5, color: "rgba(216,232,244,0.55)", lineHeight: 1.72, margin: 0 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tiers ── */}
        <section style={{ padding: "80px clamp(1rem,5vw,4rem)", position: "relative", zIndex: 1 }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,212,255,0.6)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>Who It&apos;s For</p>
              <h2 style={{ fontSize: "clamp(1.9rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 16, letterSpacing: "-0.03em" }}>
                Built for every tier of drone business
              </h2>
              <p style={{ color: "rgba(216,232,244,0.5)", fontSize: 15, maxWidth: 500, margin: "0 auto", lineHeight: 1.65 }}>
                From solo Part 107 operators to enterprise fleets, NyxAerial scales with you.
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
              {TIERS.map((t, i) => (
                <div key={t.title} style={{
                  background: "linear-gradient(145deg,rgba(255,255,255,0.052),rgba(255,255,255,0.014))",
                  backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
                  border: `1px solid ${t.color}24`,
                  borderRadius: 24, padding: "36px 30px",
                  boxShadow: `0 16px 52px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.08)`,
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Top accent + tracer */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${t.color}28,transparent)` }} />
                  <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: 2, background: `linear-gradient(90deg,transparent,${t.color}cc,rgba(255,255,255,0.88),${t.color}cc,transparent)`, animation: `tracer ${3.8 + i * 0.45}s linear ${i * 0.7}s infinite` }} />
                  <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle,${t.glow} 0%,transparent 70%)`, pointerEvents: "none" }} />
                  <div style={{
                    width: 54, height: 54, borderRadius: 15, marginBottom: 24,
                    background: `linear-gradient(135deg,${t.color}28,${t.color}07)`,
                    border: `1px solid ${t.color}38`,
                    boxShadow: `0 0 28px ${t.color}28,inset 0 1px 0 rgba(255,255,255,0.12)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <t.icon style={{ width: 24, height: 24, color: t.color }} />
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 20, color: t.color }}>{t.title}</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 13 }}>
                    {t.features.map((feat) => (
                      <li key={feat} style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 14, color: "rgba(216,232,244,0.72)" }}>
                        <CheckCircle2 style={{ width: 16, height: 16, color: t.color, flexShrink: 0 }} />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section style={{ padding: "80px clamp(1rem,5vw,4rem)", maxWidth: 1060, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(52,211,153,0.72)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>From Operators</p>
            <h2 style={{ fontSize: "clamp(1.9rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 14, letterSpacing: "-0.03em" }}>
              Trusted by drone operators
            </h2>
            <p style={{ color: "rgba(216,232,244,0.5)", fontSize: 15, maxWidth: 440, margin: "0 auto" }}>
              Operators across the country use NyxAerial to run leaner, faster businesses.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(295px,1fr))", gap: 22 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} style={{
                background: "linear-gradient(145deg,rgba(255,255,255,0.052),rgba(255,255,255,0.014))",
                backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
                border: `1px solid ${t.color}1c`,
                borderRadius: 22, padding: "32px 28px",
                boxShadow: "0 10px 44px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.07)",
                position: "relative", overflow: "hidden",
              }}>
                {/* Top accent + tracer */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,transparent,${t.color}22,transparent)` }} />
                <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: 2, background: `linear-gradient(90deg,transparent,${t.color}cc,rgba(255,255,255,0.88),${t.color}cc,transparent)`, animation: `tracer ${3.6 + i * 0.4}s linear ${i * 0.65}s infinite` }} />
                <div style={{ position: "absolute", bottom: -20, right: 10, fontSize: "7rem", fontWeight: 900, color: `${t.color}09`, lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>&ldquo;</div>
                <div style={{ display: "flex", gap: 3, marginBottom: 20 }}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} style={{ width: 15, height: 15, fill: "#fbbf24", color: "#fbbf24" }} />
                  ))}
                </div>
                <p style={{ fontSize: 15, color: "rgba(216,232,244,0.84)", lineHeight: 1.78, marginBottom: 24 }}>&ldquo;{t.text}&rdquo;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: "50%",
                    background: `linear-gradient(135deg,${t.color}30,${t.color}10)`,
                    border: `1px solid ${t.color}45`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 800, color: t.color,
                  }}>{t.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#e8f4ff" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "rgba(216,232,244,0.4)" }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ padding: "20px clamp(1rem,5vw,4rem) 100px", position: "relative", zIndex: 1 }}>
          <div style={{
            maxWidth: 920, margin: "0 auto",
            borderRadius: 32, padding: "88px clamp(2rem,7vw,80px)", textAlign: "center",
            background: "linear-gradient(145deg,rgba(0,212,255,0.1),rgba(167,139,250,0.07),rgba(0,212,255,0.05))",
            backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(0,212,255,0.22)",
            boxShadow: "0 0 130px rgba(0,212,255,0.15),0 36px 96px rgba(0,0,0,0.56),inset 0 1px 0 rgba(255,255,255,0.08)",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: "85%", height: "65%", borderRadius: "50%", background: "radial-gradient(ellipse,rgba(0,212,255,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: -1, left: "12%", right: "12%", height: 2, background: "linear-gradient(90deg,transparent,rgba(0,212,255,0.68),transparent)", borderRadius: 2 }} />
            <div style={{ position: "absolute", bottom: -1, left: "28%", right: "28%", height: 1, background: "linear-gradient(90deg,transparent,rgba(167,139,250,0.4),transparent)", borderRadius: 2 }} />
            <p style={{ fontSize: 11, fontWeight: 700, color: "rgba(0,212,255,0.72)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 20 }}>Get Started</p>
            <h2 style={{ fontSize: "clamp(1.9rem,5vw,3.2rem)", fontWeight: 900, marginBottom: 20, letterSpacing: "-0.03em" }}>
              Ready to run a tighter operation?
            </h2>
            <p style={{ color: "rgba(216,232,244,0.6)", fontSize: 16, maxWidth: 500, margin: "0 auto 48px", lineHeight: 1.74 }}>
              Submit a request and we will have your account live within 24&nbsp;hours.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/signup" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                background: "linear-gradient(135deg,#00d4ff,#0099cc)", color: "#03060e",
                fontWeight: 800, fontSize: 16, padding: "17px 42px", borderRadius: 14, textDecoration: "none",
                boxShadow: "0 0 60px rgba(0,212,255,0.62),0 8px 24px rgba(0,0,0,0.46)",
                letterSpacing: "-0.01em",
              }}>
                Request Access <ArrowRight style={{ width: 17, height: 17 }} />
              </Link>
              <Link href="/pricing" style={{
                display: "inline-flex", alignItems: "center", gap: 9,
                background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)",
                color: "#d8e8f4", border: "1px solid rgba(255,255,255,0.14)",
                fontWeight: 600, fontSize: 16, padding: "17px 42px", borderRadius: 14, textDecoration: "none",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.07)",
              }}>
                See Pricing
              </Link>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "40px clamp(1rem,4vw,3rem)", position: "relative", zIndex: 1, background: "rgba(3,6,14,0.72)", backdropFilter: "blur(12px)" }}>
          <div style={{ maxWidth: 1300, margin: "0 auto" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24, marginBottom: 30 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(135deg,rgba(0,212,255,0.22),rgba(167,139,250,0.15))", border: "1px solid rgba(0,212,255,0.28)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#00d4ff", boxShadow: "0 0 14px rgba(0,212,255,0.22)" }}>N</div>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>NyxAerial CRM</span>
                  <span style={{ fontSize: 11, color: "rgba(216,232,244,0.28)", marginLeft: 6 }}>a NyxCollective LLC product</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                {[{ href: "/pricing", label: "Pricing" },{ href: "/quote", label: "Get a Quote" },{ href: "/privacy", label: "Privacy" },{ href: "/terms", label: "Terms" },{ href: "/login", label: "Sign In" }].map((l) => (
                  <Link key={l.href} href={l.href} style={{ color: "rgba(216,232,244,0.36)", textDecoration: "none", fontSize: 13 }}>{l.label}</Link>
                ))}
              </div>
            </div>
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.04)", paddingTop: 22, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: 12, color: "rgba(216,232,244,0.26)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Lock style={{ width: 11, height: 11 }} />
                &copy; {new Date().getFullYear()} NyxCollective LLC. All rights reserved. NyxAerial is a trademark of NyxCollective LLC.
              </div>
              <a href="https://nyxcollective.com" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(0,212,255,0.38)", textDecoration: "none", fontSize: 12 }}>
                nyxcollective.com <ExternalLink style={{ width: 10, height: 10 }} />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}