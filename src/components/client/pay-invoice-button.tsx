"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";

interface PayInvoiceButtonProps {
  invoiceId: string;
  paymentUrl?: string | null;
  className?: string;
}

export function PayInvoiceButton({ invoiceId, paymentUrl, className }: PayInvoiceButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePayNow() {
    setLoading(true);
    try {
      if (paymentUrl) {
        window.location.href = paymentUrl;
        return;
      }

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId }),
      });

      if (!res.ok) {
        throw new Error("Unable to start checkout");
      }

      const data = await res.json();
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      // Keep this simple client-side; server logs carry detail.
      alert("Unable to open payment checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <Button
      size="sm"
      onClick={handlePayNow}
      disabled={loading}
      className={className}
    >
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
      Pay Now
    </Button>
  );
}
