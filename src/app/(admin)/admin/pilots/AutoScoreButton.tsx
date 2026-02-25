"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function AutoScoreButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  async function handleScore() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/pilots/score-all/score", { method: "POST" });
      const data = await res.json();
      setResult(`Scored ${data.updated} pilots`);
      router.refresh();
    } catch {
      setResult("Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleScore}
        disabled={loading}
        className="gap-1"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
        Auto-Score All
      </Button>
      {result && <span className="text-xs text-muted-foreground">{result}</span>}
    </div>
  );
}
