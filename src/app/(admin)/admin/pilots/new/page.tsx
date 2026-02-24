"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewPilotPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    state: "",
    faaPartNumber: "",
    faaExpiry: "",
    bio: "",
    markets: "",    // comma-separated "Phoenix, AZ"
  });

  function set(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/pilots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          faaPartNumber: form.faaPartNumber || undefined,
          faaExpiry: form.faaExpiry || undefined,
          bio: form.bio || undefined,
          markets: form.markets
            ? form.markets.split(",").map((m) => {
                const parts = m.trim().split(" ");
                const state = parts.pop() ?? "";
                const city = parts.join(" ");
                return { state, city: city || undefined };
              }).filter((m) => m.state)
            : [],
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create pilot");
        return;
      }

      router.push("/admin/pilots");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <Link
          href="/admin/pilots"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pilots
        </Link>
        <h1 className="text-2xl font-bold">Add New Pilot</h1>
        <p className="text-muted-foreground">
          Create a pilot profile and portal account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Jake Mitchell"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="(555) 000-0000"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="Phoenix"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={form.state}
                  onChange={(e) => set("state", e.target.value)}
                  placeholder="AZ"
                  maxLength={2}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="pilot@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Temporary Password *</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min 8 characters"
                  minLength={8}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAA Certification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">FAA Certification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="faaPartNumber">FAA Certificate Number</Label>
                <Input
                  id="faaPartNumber"
                  value={form.faaPartNumber}
                  onChange={(e) => set("faaPartNumber", e.target.value)}
                  placeholder="FA1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faaExpiry">Certificate Expiry</Label>
                <Input
                  id="faaExpiry"
                  type="date"
                  value={form.faaExpiry}
                  onChange={(e) => set("faaExpiry", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rates - removed since not in schema */}

        {/* Markets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Service Markets</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="markets">
                Markets (e.g. "Phoenix AZ, Scottsdale AZ, Tucson AZ")
              </Label>
              <Input
                id="markets"
                value={form.markets}
                onChange={(e) => set("markets", e.target.value)}
                placeholder="Phoenix AZ, Scottsdale AZ"
              />
              <p className="text-xs text-muted-foreground">City + state abbreviation per entry, comma-separated.</p>
            </div>
          </CardContent>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Bio</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              placeholder="Brief professional background..."
              rows={3}
            />
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Create Pilot
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/pilots">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  );
}
