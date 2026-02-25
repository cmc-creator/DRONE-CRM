"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Link2, CheckCircle } from "lucide-react";

interface Props {
  trackingToken: string | null;
  jobId: string;
}

export function CopyTrackingLinkButton({ trackingToken, jobId }: Props) {
  const [state, setState] = useState<"idle" | "generating" | "copied" | "error">("idle");
  const [token, setToken] = useState<string | null>(trackingToken);

  async function ensureToken(): Promise<string | null> {
    if (token) return token;
    setState("generating");
    try {
      const res = await fetch(`/api/jobs/${jobId}/generate-tracking-token`, { method: "POST" });
      if (!res.ok) { setState("error"); return null; }
      const data = await res.json();
      setToken(data.trackingToken);
      return data.trackingToken;
    } catch {
      setState("error");
      return null;
    }
  }

  async function handleCopy() {
    const t = await ensureToken();
    if (!t) return;
    const url = `${window.location.origin}/track/${t}`;
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2500);
    } catch {
      setState("error");
    }
  }

  if (state === "copied") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
        <CheckCircle className="h-3.5 w-3.5" /> Link copied!
      </span>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5 text-xs border-[#00d4ff]/20 text-[#00d4ff] hover:bg-[#00d4ff]/10"
      disabled={state === "generating"}
      onClick={handleCopy}
    >
      {token ? <Copy className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {state === "generating" ? "Generating…" : state === "error" ? "Retry" : "Copy Tracking Link"}
    </Button>
  );
}
