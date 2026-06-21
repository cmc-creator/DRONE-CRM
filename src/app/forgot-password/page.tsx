"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true); // always show success to prevent enumeration
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#04080f" }}>
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: "#080f1e", border: "1px solid rgba(0,212,255,0.12)" }}
      >
        <div className="mb-6">
          <p className="text-xs font-black tracking-[0.2em] uppercase mb-1" style={{ color: "#00d4ff" }}>
            NyxAerial
          </p>
          <h1 className="text-2xl font-black text-white">Reset Password</h1>
        </div>

        {sent ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <p className="text-white font-semibold">Check your email</p>
            <p className="text-sm" style={{ color: "rgba(216,232,244,0.6)" }}>
              If an account exists for <strong className="text-white">{email}</strong>, a reset link has been sent. It expires in 1 hour.
            </p>
            <Link href="/login" className="flex items-center justify-center gap-2 text-sm mt-4" style={{ color: "#00d4ff" }}>
              <ArrowLeft className="w-4 h-4" /> Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm" style={{ color: "rgba(216,232,244,0.6)" }}>
              Enter your account email and we will send a reset link.
            </p>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>

            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm mt-2"
              style={{ color: "rgba(0,212,255,0.6)" }}
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
