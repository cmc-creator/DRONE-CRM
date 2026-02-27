"use client";

import { useState } from "react";
import Link from "next/link";

const SERVICE_TYPES = [
  "Real Estate Photography",
  "Construction Progress",
  "Commercial/Advertising",
  "Inspection (Roof/Infrastructure)",
  "Event Coverage",
  "Agriculture/Survey",
  "Film & Production",
  "Other",
];

const BUDGET_RANGES = [
  "Under $500",
  "$500 – $1,000",
  "$1,000 – $2,500",
  "$2,500 – $5,000",
  "$5,000+",
  "Not sure yet",
];

export default function QuotePage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    city: "",
    state: "",
    serviceType: "",
    description: "",
    budget: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        fontFamily: "-apple-system, sans-serif",
        background: "#04080f",
        minHeight: "100vh",
        color: "#d8e8f4",
        padding: "0",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "linear-gradient(135deg,#080f1e,#0c1628)",
          borderBottom: "1px solid rgba(0,212,255,0.12)",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#00d4ff",
            }}
          >
            Lumin Aerial
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(216,232,244,0.5)" }}>
            nationwide drone pilot network
          </p>
        </div>
        <a
          href="https://luminaerial.com"
          style={{ fontSize: 13, color: "#00d4ff", textDecoration: "none" }}
        >
          luminaerial.com
        </a>
      </header>

      {/* Main */}
      <main
        style={{ maxWidth: 640, margin: "48px auto", padding: "0 24px 64px" }}
      >
        {success ? (
          /* ── Success state ── */
          <div
            style={{
              background: "#080f1e",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: 16,
              padding: "48px 40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(0,212,255,0.1)",
                border: "1px solid rgba(0,212,255,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                fontSize: 28,
              }}
            >
              ✓
            </div>
            <h2
              style={{ margin: "0 0 12px", fontSize: 24, fontWeight: 900, color: "#d8e8f4" }}
            >
              Quote Request Received!
            </h2>
            <p style={{ color: "rgba(216,232,244,0.65)", lineHeight: 1.6, margin: "0 0 32px" }}>
              Thanks, {form.name.split(" ")[0]}! Our team will review your request and
              get back to you within 1 business day.
            </p>
            <a
              href="https://luminaerial.com"
              style={{
                display: "inline-block",
                background: "#00d4ff",
                color: "#04080f",
                fontWeight: 900,
                padding: "12px 28px",
                borderRadius: 8,
                textDecoration: "none",
                fontSize: 14,
              }}
            >
              Back to luminaerial.com
            </a>
          </div>
        ) : (
          /* ── Form ── */
          <>
            <div style={{ marginBottom: 32 }}>
              <h1
                style={{
                  margin: "0 0 8px",
                  fontSize: 32,
                  fontWeight: 900,
                  color: "#d8e8f4",
                }}
              >
                Request a Quote
              </h1>
              <p style={{ margin: 0, color: "rgba(216,232,244,0.55)", fontSize: 15 }}>
                Tell us about your aerial photography or drone services need. We&apos;ll
                match you with a certified pilot in your area.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              style={{
                background: "#080f1e",
                border: "1px solid rgba(0,212,255,0.12)",
                borderRadius: 16,
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}
            >
              {/* Name + Email */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Full Name *" required>
                  <input
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Jane Smith"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Email Address *" required>
                  <input
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="jane@example.com"
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Phone + Company */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Phone">
                  <input
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="(555) 000-0000"
                    style={inputStyle}
                  />
                </Field>
                <Field label="Company / Organization">
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Real Estate"
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* City + State */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Field label="City">
                  <input
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Houston"
                    style={inputStyle}
                  />
                </Field>
                <Field label="State">
                  <input
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    placeholder="TX"
                    maxLength={2}
                    style={inputStyle}
                  />
                </Field>
              </div>

              {/* Service Type */}
              <Field label="Type of Service">
                <select
                  name="serviceType"
                  value={form.serviceType}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">— Select a service type —</option>
                  {SERVICE_TYPES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Description */}
              <Field label="Project Description">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell us about your project — location details, timeline, deliverables needed, etc."
                  style={{ ...inputStyle, resize: "vertical" }}
                />
              </Field>

              {/* Budget */}
              <Field label="Estimated Budget">
                <select
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  style={inputStyle}
                >
                  <option value="">— Select a range —</option>
                  {BUDGET_RANGES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </Field>

              {error && (
                <p style={{ color: "#ef4444", fontSize: 14, margin: 0 }}>{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: submitting ? "rgba(0,212,255,0.4)" : "#00d4ff",
                  color: "#04080f",
                  border: "none",
                  borderRadius: 8,
                  padding: "14px 28px",
                  fontSize: 15,
                  fontWeight: 900,
                  cursor: submitting ? "not-allowed" : "pointer",
                  letterSpacing: 0.5,
                  transition: "opacity 0.2s",
                }}
              >
                {submitting ? "Submitting…" : "Submit Quote Request →"}
              </button>

              <p style={{ margin: 0, fontSize: 12, color: "rgba(216,232,244,0.35)", textAlign: "center" }}>
                We typically respond within 1 business day. No spam, ever.
              </p>
            </form>
          </>
        )}

        {/* Footer */}
        <p
          style={{
            marginTop: 40,
            textAlign: "center",
            fontSize: 12,
            color: "rgba(216,232,244,0.25)",
          }}
        >
          Lumin Aerial LLC &middot;{" "}
          <Link href="https://luminaerial.com" style={{ color: "#00d4ff" }}>
            luminaerial.com
          </Link>{" "}
          &middot; Powered by{" "}
          <span style={{ color: "#a78bfa" }}>NyxCollective™</span>
        </p>
      </main>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        style={{
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: "rgba(0,212,255,0.6)",
        }}
      >
        {label}
        {required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(0,212,255,0.15)",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#d8e8f4",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};
