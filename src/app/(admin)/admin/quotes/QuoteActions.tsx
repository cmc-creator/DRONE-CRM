"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "NEW", label: "New" },
  { value: "REVIEWED", label: "Reviewed" },
  { value: "CONVERTED", label: "Converted" },
  { value: "DISMISSED", label: "Dismissed" },
];

interface Props {
  quoteId: string;
  currentStatus: string;
}

export default function QuoteActions({ quoteId, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function updateStatus(status: string) {
    if (status === currentStatus) return;
    setLoading(true);
    try {
      await fetch(`/api/quotes/${quoteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex gap-1 flex-wrap justify-end">
      {STATUS_OPTIONS.filter((s) => s.value !== currentStatus).map((s) => (
        <Button
          key={s.value}
          variant="outline"
          size="sm"
          disabled={loading}
          className="h-7 text-xs px-2"
          onClick={() => updateStatus(s.value)}
        >
          Mark {s.label}
        </Button>
      ))}
    </div>
  );
}
