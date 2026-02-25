"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, ChevronRight, ChevronLeft, Rocket } from "lucide-react";

const TOUR_KEY = "lumin-tour-v1-complete";

const STEPS = [
  {
    icon: "🚁",
    title: "Welcome to Lumin Aerial Command Center",
    body: "This is your ops hub. Every stat, job, lead, and alert lives here. Bailey — you're running a nationwide drone network from this screen. Let's do a quick flight check.",
    cta: null,
  },
  {
    icon: "🗺️",
    title: "Dispatch Board",
    body: "Jobs live here. Create a job, assign a pilot, and track it from DRAFT all the way to COMPLETED. The status flow keeps everyone in sync without a single phone call.",
    cta: { label: "View Jobs", href: "/admin/jobs" },
  },
  {
    icon: "🎯",
    title: "Lead Pipeline",
    body: "Every new client starts as a lead. Move them through stages — New → Contacted → Proposal Sent → Negotiating → Won. Never lose track of a follow-up again.",
    cta: { label: "Open Pipeline", href: "/admin/leads" },
  },
  {
    icon: "📅",
    title: "Mission Calendar",
    body: "See all scheduled jobs at a glance. Spot conflicts, plan coverage, and make sure no flight date falls through the cracks.",
    cta: { label: "Open Calendar", href: "/admin/calendar" },
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    body: "Overdue invoices, unassigned jobs, overdue follow-ups, expiring pilot certs — Lumin Aerial surfaces everything that needs your attention so nothing slips.",
    cta: { label: "Check Alerts", href: "/admin/notifications" },
  },
  {
    icon: "⚡",
    title: "Meet Volo — Your AI Co-Pilot",
    body: "Volo knows your entire CRM in real time. Ask it what to work on, have it draft a client proposal, or just ask it to remind you your mom loves you, BoBo. Hit the lightning bolt to open Volo anytime.",
    cta: null,
  },
];

export function TourGuide() {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Small delay so page finishes rendering before tour pops
    const timer = setTimeout(() => {
      const done = localStorage.getItem(TOUR_KEY);
      if (!done) setVisible(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  function complete() {
    localStorage.setItem(TOUR_KEY, "1");
    setVisible(false);
  }

  function next() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      complete();
    }
  }

  function back() {
    setStep((s) => Math.max(0, s - 1));
  }

  function goTo(href: string) {
    complete();
    router.push(href);
  }

  if (!visible) return null;

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{ background: "rgba(4,8,15,0.75)", backdropFilter: "blur(4px)" }}
        onClick={complete}
      />

      {/* Card */}
      <div
        className="fixed z-[9999] left-1/2 top-1/2"
        style={{ transform: "translate(-50%, -50%)", width: "min(520px, calc(100vw - 32px))" }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #04080f 0%, #080f1e 100%)",
            border: "1px solid rgba(0,212,255,0.2)",
            boxShadow: "0 0 60px rgba(0,212,255,0.12), 0 40px 80px rgba(0,0,0,0.6)",
          }}
        >
          {/* Progress bar */}
          <div className="h-0.5" style={{ background: "rgba(0,212,255,0.08)" }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #00d4ff, #a78bfa)" }}
            />
          </div>

          {/* Header */}
          <div
            className="flex items-center justify-between px-6 pt-5 pb-2"
          >
            <div className="flex items-center gap-2">
              <Rocket className="w-3.5 h-3.5" style={{ color: "#00d4ff" }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#00d4ff" }}>
                Lumin Aerial Tour — {step + 1} of {STEPS.length}
              </span>
            </div>
            <button
              onClick={complete}
              className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors duration-150"
              style={{ color: "rgba(0,212,255,0.4)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#00d4ff"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,212,255,0.4)"; }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step dots */}
          <div className="flex gap-1.5 px-6 pb-4">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className="h-1 rounded-full transition-all duration-300"
                style={{
                  width: i === step ? "24px" : "8px",
                  background: i <= step ? "#00d4ff" : "rgba(0,212,255,0.15)",
                }}
              />
            ))}
          </div>

          {/* Body */}
          <div className="px-6 pb-6">
            <div
              className="text-5xl mb-4 leading-none select-none"
              style={{ filter: "drop-shadow(0 0 16px rgba(0,212,255,0.3))" }}
            >
              {current.icon}
            </div>
            <h2
              className="text-xl font-black mb-3 leading-tight"
              style={{ color: "#d8e8f4" }}
            >
              {current.title}
            </h2>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(216,232,244,0.65)" }}
            >
              {current.body}
            </p>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex gap-2">
                {step > 0 && (
                  <button
                    onClick={back}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150"
                    style={{ color: "rgba(0,212,255,0.5)", background: "rgba(0,212,255,0.06)", border: "1px solid rgba(0,212,255,0.12)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#00d4ff"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,212,255,0.5)"; }}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
                <button
                  onClick={complete}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150"
                  style={{ color: "rgba(0,212,255,0.4)", background: "transparent" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,212,255,0.7)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(0,212,255,0.4)"; }}
                >
                  Skip tour
                </button>
              </div>

              <div className="flex gap-2">
                {current.cta && (
                  <button
                    onClick={() => goTo(current.cta!.href)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-150"
                    style={{ color: "#a78bfa", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(167,139,250,0.18)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(167,139,250,0.1)"; }}
                  >
                    {current.cta.label}
                  </button>
                )}
                <button
                  onClick={next}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-black transition-all duration-150"
                  style={{
                    color: "#04080f",
                    background: "linear-gradient(135deg, #00d4ff, #0099bb)",
                    boxShadow: "0 0 20px rgba(0,212,255,0.3)",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 30px rgba(0,212,255,0.5)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(0,212,255,0.3)"; }}
                >
                  {isLast ? "Let's fly 🚀" : "Next"}
                  {!isLast && <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
