"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send, CheckCircle, Loader2 } from "lucide-react";

interface Props {
  invoiceId: string;
  disabled?: boolean;
}

export function SendPaymentLinkButton({ invoiceId, disabled }: Props) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSend() {
    setState("loading");
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-payment-link`, {
        method: "POST",
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-semibold">
        <CheckCircle className="h-3 w-3" /> Sent
      </span>
    );
  }

  return (
    <Button
      size="sm"
      variant="outline"
      className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
      disabled={disabled || state === "loading"}
      onClick={handleSend}
    >
      {state === "loading" ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <Send className="h-3 w-3" />
      )}
      {state === "error" ? "Retry" : "Send Link"}
    </Button>
  );
}
