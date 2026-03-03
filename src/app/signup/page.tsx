"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";

const PLANS = ["Solo Operator", "Regional Network", "Enterprise Fleet", "Not sure yet"];
const SOURCES = ["Google Search", "Social Media", "Referral / Word of Mouth", "Industry Event / Trade Show", "Other"];

export default function SignupPage() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    plan: "",
    source: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        const d = await res.json();
        throw new Error(d.error ?? "Something went wrong");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Submission failed");
    }
  }

  const inp: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10, padding: "11px 14px",
    color: "#d8e8f4", fontSize: 14, outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "rgba(216,232,244,0.6)", marginBottom: 6,
    textTransform: "uppercase", letterSpacing: "0.06em",
  };

  return (
    <div
      style={{
        background: "#04080f", color: "#d8e8f4",
        fontFamily: "system-ui, -apple-system, sans-serif",
        minHeight: "100vh", display: "flex", flexDirection: "column",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          padding: "0 2rem", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(4,8,15,0.92)", backdropFilter: "blur(12px)",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex", alignItems: "center", gap: 8,
            color: "rgba(216,232,244,0.6)", textDecoration: "none", fontSize: 13,
          }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to home
        </Link>
        <Link href="/login" style={{ fontSize: 13, color: "#00d4ff", textDecoration: "none" }}>
          Already have an account? Sign in →
        </Link>
      </nav>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 2rem" }}>
        <div style={{ width: "100%", maxWidth: 540 }}>

          {status === "success" ? (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div
                style={{
                  width: 64, height: 64, borderRadius: "50%", margin: "0 auto 24px",
                  background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <CheckCircle2 style={{ width: 28, height: 28, color: "#00d4ff" }} />
              </div>
              <h1 style={{ fontSize: "1.9rem", fontWeight: 800, marginBottom: 12 }}>You&apos;re on the list!</h1>
              <p style={{ color: "rgba(216,232,244,0.6)", fontSize: 15, marginBottom: 32 }}>
                We received your request and will be in touch within 24 hours to set up your account.
              </p>
              <Link
                href="/"
                style={{
                  display: "inline-block", background: "rgba(0,212,255,0.1)",
                  border: "1px solid rgba(0,212,255,0.3)", color: "#00d4ff",
                  borderRadius: 10, padding: "10px 24px", textDecoration: "none", fontSize: 14, fontWeight: 600,
                }}
              >
                Back to home
              </Link>
            </div>
          ) : (
            <>
              <div style={{ textAlign: "center", marginBottom: 40 }}>
                <h1 style={{ fontSize: "2rem", fontWeight: 800, marginBottom: 10 }}>Request Access</h1>
                <p style={{ color: "rgba(216,232,244,0.55)", fontSize: 14 }}>
                  We&apos;ll review your request and get your NyxAerial account ready within 24 hours.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {/* Name + Company */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Full Name *</label>
                    <input
                      required style={inp}
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Company / DBA</label>
                    <input
                      style={inp}
                      placeholder="Acme Aerial LLC"
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                    />
                  </div>
                </div>

                {/* Email + Phone */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Email *</label>
                    <input
                      required type="email" style={inp}
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Phone (optional)</label>
                    <input
                      type="tel" style={inp}
                      placeholder="(555) 555-5555"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                    />
                  </div>
                </div>

                {/* Plan interest */}
                <div>
                  <label style={labelStyle}>Plan Interest</label>
                  <select
                    style={{ ...inp, cursor: "pointer" }}
                    value={form.plan}
                    onChange={(e) => set("plan", e.target.value)}
                  >
                    <option value="">Select a plan…</option>
                    {PLANS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {/* How did you hear */}
                <div>
                  <label style={labelStyle}>How did you hear about us?</label>
                  <select
                    style={{ ...inp, cursor: "pointer" }}
                    value={form.source}
                    onChange={(e) => set("source", e.target.value)}
                  >
                    <option value="">Select…</option>
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div>
                  <label style={labelStyle}>Anything else?</label>
                  <textarea
                    rows={4}
                    style={{ ...inp, resize: "vertical" }}
                    placeholder="Tell us about your operation — number of pilots, typical job types, volume, etc."
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
                </div>

                {status === "error" && (
                  <p style={{ color: "#f87171", fontSize: 13, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", borderRadius: 8, padding: "10px 14px" }}>
                    {errorMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    background: "#00d4ff", color: "#04080f", fontWeight: 700, fontSize: 15,
                    border: "none", borderRadius: 12, padding: "14px", cursor: "pointer",
                    opacity: status === "submitting" ? 0.7 : 1,
                  }}
                >
                  {status === "submitting" ? (
                    <><Loader2 style={{ width: 16, height: 16, animation: "spin 1s linear infinite" }} /> Submitting…</>
                  ) : (
                    "Submit Request"
                  )}
                </button>

                <p style={{ textAlign: "center", fontSize: 12, color: "rgba(216,232,244,0.35)" }}>
                  By submitting you agree to our{" "}
                  <Link href="/terms" style={{ color: "rgba(0,212,255,0.7)", textDecoration: "none" }}>Terms</Link> &amp;{" "}
                  <Link href="/privacy" style={{ color: "rgba(0,212,255,0.7)", textDecoration: "none" }}>Privacy Policy</Link>.
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
