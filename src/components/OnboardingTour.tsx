"use client";

/**
 * Guided Onboarding Tour
 *
 * Shows a step-by-step overlay walkthrough for first-time admin users.
 * Completion state is persisted in localStorage under "nyxaerial_tour_done".
 *
 * To trigger manually: localStorage.removeItem("nyxaerial_tour_done") and refresh.
 */

import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, CheckCircle2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Step {
  title:    string;
  body:     string;
  link?:    string;
  linkText?: string;
  emoji:    string;
}

const STEPS: Step[] = [
  {
    emoji: "✈️",
    title: "Welcome to NyxAerial",
    body:  "This quick tour covers the five things that matter most. Takes about 90 seconds. You can skip at any time.",
  },
  {
    emoji: "🎯",
    title: "Command Center",
    body:  "Start every day at the Command Center. It shows live job counts, overdue invoices, hot leads, and compliance alerts at a glance.",
    link:  "/admin/dashboard",
    linkText: "Go to Command Center →",
  },
  {
    emoji: "📋",
    title: "Jobs → Dispatch",
    body:  "Create a job, assign a pilot, and the pilot gets an email + SMS instantly. Track progress through 7 status stages from DRAFT to COMPLETED.",
    link:  "/admin/jobs",
    linkText: "Open Jobs →",
  },
  {
    emoji: "💰",
    title: "Invoices + Stripe",
    body:  "Create an invoice and hit 'Send Payment Link'. Stripe handles collection and automatically marks it PAID when the client pays online.",
    link:  "/admin/invoices",
    linkText: "Open Invoices →",
  },
  {
    emoji: "🔗",
    title: "Integrations",
    body:  "Connect Google Drive, OneDrive, Slack, Twilio SMS, DocuSign, and more. All wired — just add your API keys in Settings → Integrations.",
    link:  "/admin/integrations",
    linkText: "Open Integrations →",
  },
  {
    emoji: "🤖",
    title: "Meet Volo",
    body:  "Volo is your AI co-pilot. Ask it anything: 'What should I focus on today?', 'Draft a proposal for a $2k real estate shoot', or 'Explain LAANC authorization.'",
    link:  "/admin/dashboard",
    linkText: "Open Command Center →",
  },
  {
    emoji: "🚀",
    title: "You're ready.",
    body:  "That's the core. Explore Pilots, Leads, Compliance, Analytics, and the Dispatch Map as you grow. Hit the ground flying.",
  },
];

const STORAGE_KEY = "nyxaerial_tour_done_v1";

export default function OnboardingTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep]       = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Only show on first visit — check localStorage
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Delay slightly so the page content renders first
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
    } catch { /* SSR / blocked storage */ }
  }, []);

  function complete() {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* ignore */ }
    setVisible(false);
    setDismissed(true);
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else complete();
  }

  function prev() { setStep((s) => Math.max(0, s - 1)); }

  if (!visible || dismissed) return null;

  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
        onClick={complete}
        aria-hidden
      />

      {/* Card */}
      <div
        className="fixed z-[9999] bottom-6 right-6 w-full max-w-sm rounded-2xl shadow-2xl"
        style={{
          background:  "linear-gradient(135deg, #080f1e, #0d1a2e)",
          border:      "1px solid rgba(0,212,255,0.2)",
          boxShadow:   "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,212,255,0.08)",
        }}
      >
        {/* Close */}
        <button
          onClick={complete}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-sm transition-colors"
          style={{ color: "rgba(0,212,255,0.4)" }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5 pt-4 px-5">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full transition-all"
              style={{
                width:      i === step ? 20 : 6,
                background: i <= step ? "#00d4ff" : "rgba(0,212,255,0.15)",
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="px-5 pt-4 pb-2">
          <div className="text-3xl mb-3">{current.emoji}</div>
          <h3 className="text-base font-bold mb-2" style={{ color: "#d8e8f4" }}>{current.title}</h3>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(216,232,244,0.65)" }}>{current.body}</p>

          {current.link && (
            <a
              href={current.link}
              className="inline-block mt-3 text-xs font-semibold"
              style={{ color: "#00d4ff" }}
              onClick={complete}
            >
              {current.linkText}
            </a>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={prev}
            disabled={step === 0}
            className="flex items-center gap-1 text-xs transition-opacity disabled:opacity-30"
            style={{ color: "rgba(0,212,255,0.6)" }}
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back
          </button>

          <span className="text-xs" style={{ color: "rgba(0,212,255,0.3)" }}>
            {step + 1} / {STEPS.length}
          </span>

          <Button
            size="sm"
            onClick={next}
            className="text-xs h-8 px-4 rounded-xl"
            style={{
              background: isLast ? "rgba(52,211,153,0.15)" : "rgba(0,212,255,0.12)",
              color:      isLast ? "#34d399" : "#00d4ff",
              border:     `1px solid ${isLast ? "rgba(52,211,153,0.25)" : "rgba(0,212,255,0.2)"}`,
            }}
          >
            {isLast ? (
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Done
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Next <ChevronRight className="w-3.5 h-3.5" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </>
  );
}
