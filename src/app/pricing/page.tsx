import Link from "next/link";
import { Check, Zap, Building2, Rocket, ArrowRight } from "lucide-react";

const TIERS = [
  {
    name: "Solo",
    price: "$49",
    period: "/mo",
    tagline: "For independent FAA Part 107 pilots",
    icon: Zap,
    color: "#00d4ff",
    popular: false,
    features: [
      "1 admin user + 1 pilot portal",
      "Job creation & lifecycle tracking",
      "Client portal (up to 5 clients)",
      "Invoice generation + Stripe payments",
      "Compliance document tracking",
      "Email notifications (job, invoice, compliance)",
      "Public job tracking link",
      "NyxAerial badge in footer",
    ],
    cta: "Get Started",
    ctaHref: "mailto:ops@nyxaerial.com?subject=NyxAerial Solo Plan",
  },
  {
    name: "Network",
    price: "$149",
    period: "/mo",
    tagline: "For regional networks of 2–15 pilots",
    icon: Building2,
    color: "#a78bfa",
    popular: true,
    features: [
      "Everything in Solo",
      "Unlimited pilots + client portals",
      "Lead pipeline + public quote intake form",
      "Contracts + Adobe Sign e-signature",
      "Google Drive integration",
      "Analytics dashboard",
      "Volo AI assistant",
      "Overdue lead follow-up automation",
      "Full white-label (your logo & brand — NyxAerial badge removed)",
    ],
    cta: "Start Free Trial",
    ctaHref: "mailto:ops@nyxaerial.com?subject=NyxAerial Network Plan",
  },
  {
    name: "Enterprise",
    price: "$399",
    period: "/mo",
    tagline: "For large fleets & national operators",
    icon: Rocket,
    color: "#f59e0b",
    popular: false,
    features: [
      "Everything in Network",
      "Multi-location territory management",
      "QuickBooks live sync",
      "Custom subdomain (portal.yourdomain.com)",
      "API access for custom integrations",
      "Priority support + onboarding call",
      "Custom contract templates",
      "Dedicated deployment",
    ],
    cta: "Contact Sales",
    ctaHref: "mailto:ops@nyxaerial.com?subject=NyxAerial Enterprise Plan",
  },
];

const ADD_ONS = [
  { name: "Extra pilot seats (Solo)", price: "$10 / pilot / mo" },
  { name: "SMS notifications (Twilio)", price: "$19 / mo" },
  { name: "Dedicated onboarding session", price: "$299 one-time" },
  { name: "White-label setup & deploy", price: "$500 – $1,500 one-time" },
  { name: "Custom feature build", price: "Scoped quote" },
];

const USE_CASES = [
  { type: "Solo Part 107 Pilot", desc: "Track jobs, bill clients, stay compliant — all from your phone." },
  { type: "Regional Drone Network", desc: "Dispatch multiple pilots, manage territories, track payouts." },
  { type: "Aerial Photography Studio", desc: "Client delivery portal, contracts, and Stripe billing." },
  { type: "Drone Inspection Company", desc: "Compliance docs, job lifecycle, report delivery." },
  { type: "Real Estate Media Company", desc: "Client self-service portal, quote intake, automated reminders." },
  { type: "Nationwide Fleet Operator", desc: "Full multi-portal platform — admin, pilot, and client roles." },
];

export default function PricingPage() {
  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #0a0f1e 0%, #0d1b2a 50%, #0a1628 100%)" }}
    >
      {/* Header */}
      <div className="border-b" style={{ borderColor: "rgba(0,212,255,0.1)" }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="font-black tracking-widest uppercase text-sm"
              style={{ color: "#00d4ff" }}
            >
              NyxAerial
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/quote"
              className="text-sm"
              style={{ color: "rgba(0,212,255,0.6)" }}
            >
              Get a Quote
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-1.5 rounded-lg border font-medium"
              style={{ borderColor: "rgba(0,212,255,0.3)", color: "#00d4ff" }}
            >
              Log In
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-20 space-y-24">

        {/* Hero */}
        <div className="text-center space-y-5">
          <div
            className="inline-block text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full border mb-2"
            style={{ borderColor: "rgba(0,212,255,0.3)", color: "#00d4ff", background: "rgba(0,212,255,0.05)" }}
          >
            Simple, Transparent Pricing
          </div>
          <h1
            className="text-5xl font-black tracking-tight"
            style={{ color: "#e2e8f0" }}
          >
            Built for drone operators.
            <br />
            <span style={{ color: "#00d4ff" }}>Priced like one.</span>
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "rgba(148,163,184,0.8)" }}>
            The only CRM engineered specifically for drone service businesses.
            White-label ready — deploy under your brand for any drone operation.
          </p>
          <p className="text-sm" style={{ color: "rgba(0,212,255,0.5)" }}>
            Annual plans available — 2 months free (pay for 10, get 12)
          </p>
        </div>

        {/* Pricing tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TIERS.map((tier) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className="relative rounded-2xl p-8 flex flex-col gap-6"
                style={{
                  background: tier.popular
                    ? "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(0,212,255,0.05))"
                    : "rgba(255,255,255,0.03)",
                  border: tier.popular
                    ? "1px solid rgba(167,139,250,0.4)"
                    : "1px solid rgba(0,212,255,0.1)",
                }}
              >
                {tier.popular && (
                  <div
                    className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest uppercase px-4 py-1 rounded-full"
                    style={{ background: "#a78bfa", color: "#fff" }}
                  >
                    Most Popular
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ background: `${tier.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: tier.color }} />
                    </div>
                    <span className="font-bold text-lg" style={{ color: tier.color }}>
                      {tier.name}
                    </span>
                  </div>
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black" style={{ color: "#e2e8f0" }}>
                      {tier.price}
                    </span>
                    <span className="text-sm pb-1" style={{ color: "rgba(148,163,184,0.6)" }}>
                      {tier.period}
                    </span>
                  </div>
                  <p className="text-sm" style={{ color: "rgba(148,163,184,0.6)" }}>
                    {tier.tagline}
                  </p>
                </div>

                <ul className="space-y-2.5 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "rgba(226,232,240,0.85)" }}>
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: tier.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={tier.ctaHref}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
                  style={
                    tier.popular
                      ? { background: "#a78bfa", color: "#fff" }
                      : { background: `${tier.color}15`, color: tier.color, border: `1px solid ${tier.color}30` }
                  }
                >
                  {tier.cta} <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Setup fee callout */}
        <div
          className="rounded-2xl p-8 text-center"
          style={{ background: "rgba(0,212,255,0.04)", border: "1px solid rgba(0,212,255,0.12)" }}
        >
          <h2 className="text-xl font-bold mb-2" style={{ color: "#e2e8f0" }}>
            White-Label Setup Fee
          </h2>
          <p className="max-w-xl mx-auto text-sm mb-4" style={{ color: "rgba(148,163,184,0.7)" }}>
            One-time fee covers your custom branding deployment — your logo, colors, company name,
            email sender domain, and custom subdomain. Paid once. Yours forever.
          </p>
          <div className="text-2xl font-black" style={{ color: "#00d4ff" }}>$500 – $1,500</div>
          <div className="text-sm mt-1" style={{ color: "rgba(0,212,255,0.5)" }}>
            one-time · scope depends on customization depth
          </div>
        </div>

        {/* Add-ons */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#e2e8f0" }}>
            Add-Ons
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADD_ONS.map((a) => (
              <div
                key={a.name}
                className="rounded-xl p-5 flex items-center justify-between gap-4"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.08)" }}
              >
                <span className="text-sm" style={{ color: "rgba(226,232,240,0.8)" }}>{a.name}</span>
                <span className="text-sm font-bold whitespace-nowrap" style={{ color: "#00d4ff" }}>{a.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Use cases */}
        <div>
          <h2 className="text-2xl font-bold text-center mb-3" style={{ color: "#e2e8f0" }}>
            Built for every drone business model
          </h2>
          <p className="text-center text-sm mb-10" style={{ color: "rgba(148,163,184,0.6)" }}>
            One platform, six deployment types — rebrand it and ship it in days.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((uc) => (
              <div
                key={uc.type}
                className="rounded-xl p-6"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.08)" }}
              >
                <p className="font-bold text-sm mb-1.5" style={{ color: "#00d4ff" }}>{uc.type}</p>
                <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>{uc.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "#e2e8f0" }}>
            Common Questions
          </h2>
          {[
            {
              q: "Can I try it before committing?",
              a: "Yes — request a demo instance and we'll spin up a seeded environment so you can click through every feature before any payment.",
            },
            {
              q: "Do I need to be a developer to set it up?",
              a: "No. White-label setup is handled by NyxAerial — we configure your branding, connect your domain, and hand you the keys.",
            },
            {
              q: "What does 'white-label' actually mean?",
              a: "Your company name, logo, colors, and domain — zero NyxAerial branding visible to your clients or pilots unless you want it.",
            },
            {
              q: "Can I switch tiers later?",
              a: "Yes, at any time. Upgrades are prorated. No contracts required on monthly plans.",
            },
            {
              q: "Is the data mine?",
              a: "Completely. Your Neon PostgreSQL database is yours. Export everything as CSV at any time from the built-in export tools.",
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              className="rounded-xl p-6"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(0,212,255,0.08)" }}
            >
              <p className="font-semibold text-sm mb-2" style={{ color: "#e2e8f0" }}>{q}</p>
              <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>{a}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-12 text-center"
          style={{ background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(167,139,250,0.06))", border: "1px solid rgba(0,212,255,0.15)" }}
        >
          <h2 className="text-3xl font-black mb-3" style={{ color: "#e2e8f0" }}>
            Ready to launch?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: "rgba(148,163,184,0.7)" }}>
            Email us and we'll get your instance configured within 48 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:ops@nyxaerial.com?subject=NyxAerial — I%27m interested"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm"
              style={{ background: "#00d4ff", color: "#0a0f1e" }}
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/quote"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-sm border"
              style={{ borderColor: "rgba(0,212,255,0.3)", color: "#00d4ff" }}
            >
              Request a Demo
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t pt-8" style={{ borderColor: "rgba(0,212,255,0.08)" }}>
          <p className="text-xs" style={{ color: "rgba(0,212,255,0.3)" }}>
            © 2026 NyxCollective LLC · NyxAerial is a product of NyxCollective LLC ·{" "}
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            {" · "}
            <Link href="/terms" className="hover:underline">Terms</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
