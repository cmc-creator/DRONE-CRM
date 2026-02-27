"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  jobId: string;
  pilotId: string;
  pilotName: string;
}

export default function ReviewWidget({ jobId, pilotId, pilotName }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if review already exists for this job
  useEffect(() => {
    fetch(`/api/pilots/${pilotId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        const existing = data.reviews?.find(
          (r: { jobId: string }) => r.jobId === jobId
        );
        if (existing) setSubmitted(true);
      })
      .catch(() => {});
  }, [pilotId, jobId]);

  async function handleSubmit() {
    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/pilots/${pilotId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment: comment.trim() || null, jobId }),
      });

      if (res.status === 409) {
        setSubmitted(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to submit review.");
        return;
      }

      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Star className="h-4 w-4 text-yellow-500" />
          Rate This Pilot
        </CardTitle>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
            <Star className="h-4 w-4 fill-green-500 text-green-500" />
            Review submitted for {pilotName}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Rate {pilotName}&apos;s performance on this job:
            </p>

            {/* Star selector */}
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`h-7 w-7 transition-colors ${
                      star <= (hover || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground self-center">
                  {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
                </span>
              )}
            </div>

            <Textarea
              placeholder="Optional notes (punctuality, communication, quality…)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0}
              size="sm"
            >
              {submitting ? "Submitting…" : "Submit Review"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
