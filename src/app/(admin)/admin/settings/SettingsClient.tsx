"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Palette, Globe, CreditCard, Save, CheckCircle } from "lucide-react";

interface OrgData {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  primaryColor?: string | null;
  accentColor?: string | null;
  customDomain?: string | null;
  supportEmail?: string | null;
  stripeAccountId?: string | null;
  planTier?: string | null;
}

interface SettingsClientProps {
  org: OrgData | null;
}

export function SettingsClient({ org }: SettingsClientProps) {
  const [form, setForm] = useState({
    name: org?.name ?? "Lumin Aerial",
    slug: org?.slug ?? "lumin",
    logoUrl: org?.logoUrl ?? "",
    faviconUrl: org?.faviconUrl ?? "",
    primaryColor: org?.primaryColor ?? "#00d4ff",
    accentColor: org?.accentColor ?? "#fbbf24",
    customDomain: org?.customDomain ?? "",
    supportEmail: org?.supportEmail ?? "",
    stripeAccountId: org?.stripeAccountId ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" />
            Organization Identity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Organization Name</Label>
              <Input value={form.name} onChange={(e) => update("name", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Slug (URL identifier)</Label>
              <Input value={form.slug} onChange={(e) => update("slug", e.target.value.toLowerCase().replace(/\s/g, "-"))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Logo URL</Label>
            <Input placeholder="https://..." value={form.logoUrl} onChange={(e) => update("logoUrl", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Favicon URL</Label>
            <Input placeholder="https://..." value={form.faviconUrl} onChange={(e) => update("faviconUrl", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Support Email</Label>
            <Input placeholder="support@yourdomain.com" value={form.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-primary" />
            Brand Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <Input
                value={form.primaryColor}
                onChange={(e) => update("primaryColor", e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={form.accentColor}
                onChange={(e) => update("accentColor", e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-white/10 bg-transparent"
              />
              <Input
                value={form.accentColor}
                onChange={(e) => update("accentColor", e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domain */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" />
            Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Custom Domain</Label>
            <Input
              placeholder="crm.yourdomain.com"
              value={form.customDomain}
              onChange={(e) => update("customDomain", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Point a CNAME DNS record to your Vercel deployment URL, then add it here.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stripe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Stripe Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Stripe Account ID (Connect)</Label>
            <Input
              placeholder="acct_..."
              value={form.stripeAccountId}
              onChange={(e) => update("stripeAccountId", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              For Stripe Connect multi-tenant payments. Leave blank for platform-level Stripe keys.
            </p>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Required Vercel Environment Variables:</p>
            <p><code className="bg-white/5 px-1 rounded">STRIPE_SECRET_KEY</code> — Your Stripe secret key</p>
            <p><code className="bg-white/5 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> — From Stripe Dashboard &gt; Webhooks</p>
            <p><code className="bg-white/5 px-1 rounded">CRON_SECRET</code> — Random string to protect cron endpoints</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saving ? "Saving…" : saved ? "Saved!" : "Save Settings"}
        </Button>
        {saved && (
          <span className="text-sm text-emerald-400">Settings saved successfully.</span>
        )}
      </div>
    </div>
  );
}
