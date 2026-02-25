"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Deterministic star positions (avoids hydration mismatch with SSR)
const STARS = [
  { left: 8,  top: 12, delay: 0.0, size: 2 },
  { left: 23, top: 5,  delay: 0.4, size: 1 },
  { left: 37, top: 28, delay: 1.2, size: 2 },
  { left: 52, top: 9,  delay: 0.7, size: 1 },
  { left: 61, top: 41, delay: 1.8, size: 2 },
  { left: 74, top: 18, delay: 0.3, size: 1 },
  { left: 83, top: 55, delay: 2.1, size: 2 },
  { left: 91, top: 7,  delay: 0.9, size: 1 },
  { left: 15, top: 70, delay: 1.5, size: 2 },
  { left: 30, top: 83, delay: 0.2, size: 1 },
  { left: 45, top: 62, delay: 2.4, size: 2 },
  { left: 66, top: 77, delay: 1.1, size: 1 },
  { left: 78, top: 88, delay: 0.6, size: 2 },
  { left: 5,  top: 45, delay: 1.9, size: 1 },
  { left: 96, top: 33, delay: 0.8, size: 2 },
  { left: 19, top: 91, delay: 1.3, size: 1 },
  { left: 57, top: 50, delay: 2.0, size: 2 },
  { left: 88, top: 72, delay: 0.5, size: 1 },
];

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Already signed in → go straight to dashboard
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role) {
      const role = session.user.role;
      if (role === "ADMIN")  router.replace("/admin/dashboard");
      else if (role === "PILOT")  router.replace("/pilot/dashboard");
      else if (role === "CLIENT") router.replace("/client/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => { setMounted(true); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    // Redirect to role-appropriate dashboard after sign-in
    const meRes = await fetch("/api/auth/session");
    const me = await meRes.json();
    const role = me?.user?.role;
    if (role === "ADMIN")  { router.push("/admin/dashboard");  router.refresh(); return; }
    if (role === "PILOT")  { router.push("/pilot/dashboard");  router.refresh(); return; }
    if (role === "CLIENT") { router.push("/client/dashboard"); router.refresh(); return; }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: "#04080f" }}
    >
      {/* ── LEFT HERO PANEL ── */}
      <div
        className="hidden lg:flex lg:w-[58%] relative flex-col justify-between p-12 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #04080f 0%, #060d1a 40%, #071224 70%, #04080f 100%)",
        }}
      >
        {/* Animated perspective grid */}
        <div
          className="absolute inset-0 login-grid-flow"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,212,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.06) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage:
              "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
          }}
        />

        {/* Star field */}
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full login-star"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              background: "#00d4ff",
              animationName: "star-twinkle",
              animationDuration: "2.5s",
              animationDelay: `${s.delay}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
            }}
          />
        ))}

        {/* Deep glow orbs */}
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 500,
            height: 500,
            background: "radial-gradient(circle, rgba(0,100,255,0.15) 0%, transparent 70%)",
            top: "10%",
            left: "-10%",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl"
          style={{
            width: 400,
            height: 400,
            background: "radial-gradient(circle, rgba(0,212,255,0.10) 0%, transparent 70%)",
            bottom: "5%",
            right: "-5%",
          }}
        />

        {/* Logo + wordmark */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div
              className="login-glow-pulse rounded-xl flex items-center justify-center"
              style={{
                width: 52,
                height: 52,
                background: "linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)",
              }}
            >
              {/* Drone top-down SVG */}
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
                <circle cx="15" cy="15" r="4" fill="white" />
                {/* Arms */}
                <line x1="15" y1="11" x2="15" y2="4"  stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="15" y1="19" x2="15" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="11" y1="15" x2="4"  y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1="19" y1="15" x2="26" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
                {/* Propellers */}
                <circle cx="15" cy="3"  r="2.5" fill="rgba(255,255,255,0.5)" />
                <circle cx="15" cy="27" r="2.5" fill="rgba(255,255,255,0.5)" />
                <circle cx="3"  cy="15" r="2.5" fill="rgba(255,255,255,0.5)" />
                <circle cx="27" cy="15" r="2.5" fill="rgba(255,255,255,0.5)" />
              </svg>
            </div>
            <div>
              <div
                className="font-black tracking-[0.15em] uppercase text-xl login-text-glow"
                style={{ color: "#00d4ff" }}
              >
                Lumin Aerial
              </div>
              <div
                className="text-xs tracking-widest uppercase font-medium"
                style={{ color: "rgba(0,212,255,0.45)" }}
              >
                Command &amp; Control
              </div>
            </div>
          </div>
        </div>

        {/* Center piece: Radar + floating drone */}
        <div className="relative z-10 flex items-center justify-center flex-1">
          <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>

            {/* Radar rings */}
            {[1, 0.72, 0.45].map((scale, i) => (
              <div
                key={i}
                className="absolute rounded-full border"
                style={{
                  width: 280 * scale,
                  height: 280 * scale,
                  borderColor: `rgba(0,212,255,${0.12 + i * 0.06})`,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                }}
              />
            ))}

            {/* Ping rings */}
            {[1.0, 0.7, 0.42].map((scale, i) => (
              <div
                key={i}
                className="absolute rounded-full login-radar-ping"
                style={{
                  width: 280 * scale,
                  height: 280 * scale,
                  border: "1px solid rgba(0,212,255,0.3)",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  animationDelay: `${i * 0.8}s`,
                }}
              />
            ))}

            {/* Radar sweep */}
            <div
              className="absolute login-radar-sweep"
              style={{
                width: 140,
                height: 140,
                top: "50%",
                left: "50%",
                marginTop: -140,
                marginLeft: -140,
                transformOrigin: "140px 140px",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background:
                    "conic-gradient(from 0deg, transparent 50%, rgba(0,212,255,0.35) 90%, rgba(0,212,255,0.0) 100%)",
                  borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
                }}
              />
            </div>

            {/* Orbiting dot */}
            <div
              className="absolute login-orbit-dot"
              style={{
                width: 8,
                height: 8,
                background: "#00d4ff",
                borderRadius: "50%",
                top: "50%",
                left: "50%",
                marginTop: -4,
                marginLeft: -4,
                boxShadow: "0 0 10px #00d4ff, 0 0 20px rgba(0,212,255,0.5)",
              }}
            />
            <div
              className="absolute login-orbit-dot-2"
              style={{
                width: 5,
                height: 5,
                background: "#6ee7ff",
                borderRadius: "50%",
                top: "50%",
                left: "50%",
                marginTop: -2.5,
                marginLeft: -2.5,
                boxShadow: "0 0 6px #6ee7ff",
              }}
            />

            {/* Floating drone icon center */}
            <div className="relative z-10 login-float-drone">
              <div
                className="rounded-2xl flex items-center justify-center login-glow-pulse"
                style={{
                  width: 72,
                  height: 72,
                  background:
                    "linear-gradient(135deg, rgba(0,60,160,0.9) 0%, rgba(0,140,255,0.9) 100%)",
                  border: "1px solid rgba(0,212,255,0.4)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
                  <circle cx="21" cy="21" r="5.5" fill="white" fillOpacity="0.9" />
                  <line x1="21" y1="15.5" x2="21" y2="6"  stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="21" y1="26.5" x2="21" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="15.5" y1="21" x2="6"  y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="26.5" y1="21" x2="36" y2="21" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="21" cy="5"  r="3.5" fill="rgba(255,255,255,0.6)" />
                  <circle cx="21" cy="37" r="3.5" fill="rgba(255,255,255,0.6)" />
                  <circle cx="5"  cy="21" r="3.5" fill="rgba(255,255,255,0.6)" />
                  <circle cx="37" cy="21" r="3.5" fill="rgba(255,255,255,0.6)" />
                </svg>
              </div>
            </div>

          </div>
        </div>

        {/* Headline */}
        <div className="relative z-10 text-center mb-4">
          <h1
            className="text-5xl font-black tracking-tight leading-none mb-3"
            style={{
              background: "linear-gradient(135deg, #ffffff 0%, #00d4ff 60%, #0066ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Eyes in the Sky.
            <br />
            <span style={{ fontSize: "0.75em", opacity: 0.85 }}>
              Boots on the Ground.
            </span>
          </h1>
          <p
            className="text-sm tracking-widest uppercase font-medium"
            style={{ color: "rgba(0,212,255,0.5)" }}
          >
            Nationwide drone pilot operations platform
          </p>
        </div>

        {/* Stats bar */}
        <div
          className="relative z-10 grid grid-cols-3 gap-4 rounded-2xl p-5"
          style={{
            background: "rgba(0,212,255,0.04)",
            border: "1px solid rgba(0,212,255,0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          {[
            { value: "200+", label: "Active Missions" },
            { value: "48",   label: "States Covered" },
            { value: "FAA",  label: "Part 107 Certified" },
          ].map((stat) => (
            <div key={stat.value} className="text-center">
              <div
                className="text-2xl font-black login-text-glow"
                style={{ color: "#00d4ff" }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-medium mt-0.5"
                style={{ color: "rgba(0,212,255,0.45)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT LOGIN PANEL ── */}
      <div
        className="flex-1 flex flex-col justify-between relative"
        style={{
          background:
            "linear-gradient(160deg, #060d1a 0%, #040810 50%, #060d18 100%)",
          borderLeft: "1px solid rgba(0,212,255,0.08)",
        }}
      >
        {/* Scan line effect */}
        {mounted && (
          <div
            className="absolute left-0 right-0 h-px pointer-events-none z-0"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)",
              animationName: "scan-line",
              animationDuration: "6s",
              animationTimingFunction: "linear",
              animationIterationCount: "infinite",
            }}
          />
        )}

        {/* Mobile logo */}
        <div className="lg:hidden relative z-10 flex items-center gap-3 p-8 pb-0">
          <div
            className="login-glow-pulse rounded-xl flex items-center justify-center"
            style={{
              width: 44,
              height: 44,
              background: "linear-gradient(135deg, #0066ff 0%, #00d4ff 100%)",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="4" fill="white" />
              <line x1="15" y1="11" x2="15" y2="4"  stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="15" y1="19" x2="15" y2="26" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="11" y1="15" x2="4"  y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <line x1="19" y1="15" x2="26" y2="15" stroke="white" strokeWidth="2" strokeLinecap="round" />
              <circle cx="15" cy="3"  r="2.5" fill="rgba(255,255,255,0.5)" />
              <circle cx="15" cy="27" r="2.5" fill="rgba(255,255,255,0.5)" />
              <circle cx="3"  cy="15" r="2.5" fill="rgba(255,255,255,0.5)" />
              <circle cx="27" cy="15" r="2.5" fill="rgba(255,255,255,0.5)" />
            </svg>
          </div>
          <span
            className="font-black text-lg tracking-widest uppercase login-text-glow"
            style={{ color: "#00d4ff" }}
          >
            Lumin Aerial
          </span>
        </div>

        {/* Form area */}
        <div className="relative z-10 flex-1 flex items-center justify-center px-8 py-12">
          <div className="w-full max-w-sm login-slide-in">

            {/* Heading */}
            <div className="mb-8">
              <h2
                className="text-3xl font-black tracking-tight mb-2"
                style={{ color: "#f0f8ff" }}
              >
                Welcome back.
              </h2>
              <p
                className="text-sm font-medium"
                style={{ color: "rgba(0,212,255,0.45)" }}
              >
                Sign in to access the operations platform
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                className="text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2"
                style={{
                  background: "rgba(255,60,60,0.08)",
                  border: "1px solid rgba(255,60,60,0.25)",
                  color: "#ff8080",
                }}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: "rgba(0,212,255,0.6)" }}
                >
                  Email Address
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(0,212,255,0.4)" }}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                    placeholder="you@luminaerial.com"
                    style={{
                      background: "rgba(0,212,255,0.05)",
                      border: "1px solid rgba(0,212,255,0.15)",
                      color: "#e8f4ff",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(0,212,255,0.5)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.05)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(0,212,255,0.15)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-bold tracking-widest uppercase mb-2"
                  style={{ color: "rgba(0,212,255,0.6)" }}
                >
                  Password
                </label>
                <div className="relative">
                  <div
                    className="absolute left-4 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(0,212,255,0.4)" }}
                  >
                    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm font-medium outline-none transition-all duration-200"
                    placeholder="••••••••"
                    style={{
                      background: "rgba(0,212,255,0.05)",
                      border: "1px solid rgba(0,212,255,0.15)",
                      color: "#e8f4ff",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(0,212,255,0.5)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,212,255,0.08), 0 0 20px rgba(0,212,255,0.05)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.border = "1px solid rgba(0,212,255,0.15)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-black tracking-widest uppercase transition-all duration-200 relative overflow-hidden"
                style={{
                  background: loading
                    ? "rgba(0,100,200,0.4)"
                    : "linear-gradient(135deg, #0052cc 0%, #00a8e8 50%, #00d4ff 100%)",
                  color: "white",
                  boxShadow: loading
                    ? "none"
                    : "0 0 30px rgba(0,212,255,0.3), 0 4px 20px rgba(0,100,255,0.4)",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.boxShadow = "0 0 50px rgba(0,212,255,0.5), 0 6px 30px rgba(0,100,255,0.5)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.boxShadow = "0 0 30px rgba(0,212,255,0.3), 0 4px 20px rgba(0,100,255,0.4)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  "Launch Mission Control →"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div
          className="relative z-10 text-center pb-8 px-8"
          style={{ borderTop: "1px solid rgba(0,212,255,0.05)" }}
        >
          <p
            className="text-xs font-medium mb-1 pt-6"
            style={{ color: "rgba(0,212,255,0.25)" }}
          >
            © 2026 Lumin Aerial LLC™ · Internal Operations Platform
          </p>
          <div className="flex items-center justify-center gap-3">
            <a
              href="/terms"
              className="text-xs transition-colors"
              style={{ color: "rgba(0,212,255,0.25)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(0,212,255,0.7)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(0,212,255,0.25)"; }}
            >
              Terms of Service
            </a>
            <span style={{ color: "rgba(0,212,255,0.15)" }}>·</span>
            <a
              href="/privacy"
              className="text-xs transition-colors"
              style={{ color: "rgba(0,212,255,0.25)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(0,212,255,0.7)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(0,212,255,0.25)"; }}
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
