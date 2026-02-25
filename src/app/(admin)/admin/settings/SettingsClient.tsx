"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2, Palette, Globe, CreditCard, Save, CheckCircle,
  User, Users, Bell, Lock, Trash2, Plus, Shield, AlertCircle,
  Eye, EyeOff,
} from "lucide-react";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface OrgData {
  id: string; name: string; slug: string;
  logoUrl?: string | null; faviconUrl?: string | null;
  primaryColor?: string | null; accentColor?: string | null;
  customDomain?: string | null; supportEmail?: string | null;
  stripeAccountId?: string | null;
}

interface TeamMember {
  id: string; name: string | null; email: string; image?: string | null;
  role: "ADMIN" | "PILOT" | "CLIENT"; createdAt: string;
  pilot?: { id: string } | null;
  client?: { id: string; companyName: string } | null;
}

interface CurrentUser {
  id: string; name: string | null; email: string; image?: string | null;
  preferences?: Record<string, boolean> | null;
}

interface Props {
  currentUser: CurrentUser | null;
  org: OrgData | null;
  teamMembers: TeamMember[];
  currentUserId: string;
}

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SaveBar({ saving, saved, onSave, label = "Save Changes" }: {
  saving: boolean; saved: boolean; onSave: () => void; label?: string;
}) {
  return (
    <div className="flex items-center gap-3 pt-2">
      <Button onClick={onSave} disabled={saving} className="gap-2">
        {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {saving ? "Savingâ€¦" : saved ? "Saved!" : label}
      </Button>
      {saved && <span className="text-sm text-emerald-400">Changes saved successfully.</span>}
    </div>
  );
}

function roleBadge(role: string) {
  if (role === "ADMIN") return <Badge variant="default">Admin</Badge>;
  if (role === "PILOT") return <Badge variant="info">Pilot</Badge>;
  return <Badge variant="secondary">Client</Badge>;
}

// â”€â”€â”€ Tab: My Account â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function AccountTab({ user }: { user: CurrentUser | null }) {
  const [form, setForm] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    image: user?.image ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [err, setErr] = useState("");

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function saveProfile() {
    setSaving(true); setErr("");
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const d = await res.json(); setErr(d.error ?? "Error saving"); return; }
      setSaved(true);
    } finally { setSaving(false); }
  }

  async function changePassword() {
    if (pw.next !== pw.confirm) { setPwMsg({ ok: false, text: "Passwords do not match" }); return; }
    setPwSaving(true); setPwMsg(null);
    try {
      const res = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const d = await res.json();
      if (!res.ok) { setPwMsg({ ok: false, text: d.error ?? "Error" }); return; }
      setPwMsg({ ok: true, text: "Password updated successfully." });
      setPw({ current: "", next: "", confirm: "" });
    } finally { setPwSaving(false); }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="h-4 w-4 text-primary" /> Profile Information
          </CardTitle>
          <CardDescription>Update your name, email address and avatar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            {form.image ? (
              <img src={form.image} alt="avatar" className="h-16 w-16 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold text-primary">
                {(form.name || form.email)?.[0]?.toUpperCase() ?? "A"}
              </div>
            )}
            <div className="flex-1 space-y-1.5">
              <Label>Avatar URL</Label>
              <Input
                placeholder="https://..."
                value={form.image}
                onChange={(e) => { setForm(p => ({ ...p, image: e.target.value })); setSaved(false); }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => { setForm(p => ({ ...p, name: e.target.value })); setSaved(false); }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => { setForm(p => ({ ...p, email: e.target.value })); setSaved(false); }}
              />
            </div>
          </div>
          {err && <p className="text-sm text-destructive">{err}</p>}
          <SaveBar saving={saving} saved={saved} onSave={saveProfile} />
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4 text-primary" /> Change Password
          </CardTitle>
          <CardDescription>Requires your current password to confirm the change.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={pw.current}
                onChange={(e) => setPw(p => ({ ...p, current: e.target.value }))}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type={showPw ? "text" : "password"} value={pw.next}
                onChange={(e) => setPw(p => ({ ...p, next: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type={showPw ? "text" : "password"} value={pw.confirm}
                onChange={(e) => setPw(p => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          {pwMsg && (
            <div className={`flex items-center gap-2 text-sm ${pwMsg.ok ? "text-emerald-400" : "text-destructive"}`}>
              {pwMsg.ok ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              {pwMsg.text}
            </div>
          )}
          <Button onClick={changePassword} disabled={pwSaving || !pw.current || !pw.next} variant="outline" className="gap-2">
            <Lock className="h-4 w-4" />
            {pwSaving ? "Updatingâ€¦" : "Update Password"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// â”€â”€â”€ Tab: Team / Accounts â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TeamTab({ members: initial, currentUserId }: { members: TeamMember[]; currentUserId: string }) {
  const [members, setMembers] = useState(initial);
  const [showInvite, setShowInvite] = useState(false);
  const [invite, setInvite] = useState({ name: "", email: "", password: "", role: "ADMIN" });
  const [inviting, setInviting] = useState(false);
  const [inviteErr, setInviteErr] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function createUser() {
    setInviting(true); setInviteErr("");
    try {
      const res = await fetch("/api/admin/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invite),
      });
      const d = await res.json();
      if (!res.ok) { setInviteErr(d.error ?? "Error creating user"); return; }
      setMembers(prev => [...prev, { ...d, pilot: null, client: null }]);
      setInvite({ name: "", email: "", password: "", role: "ADMIN" });
      setShowInvite(false);
    } finally { setInviting(false); }
  }

  async function changeRole(id: string, role: string) {
    await fetch(`/api/admin/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role: role as TeamMember["role"] } : m));
  }

  async function deleteUser(id: string) {
    if (!confirm("Delete this user? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/team/${id}`, { method: "DELETE" });
      setMembers(prev => prev.filter(m => m.id !== id));
    } finally { setDeletingId(null); }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-primary" /> Team Accounts
            </CardTitle>
            <CardDescription>{members.length} users in this CRM instance.</CardDescription>
          </div>
          <Button size="sm" className="gap-2" onClick={() => setShowInvite(v => !v)}>
            <Plus className="h-4 w-4" /> Add User
          </Button>
        </CardHeader>

        {showInvite && (
          <CardContent className="border-t border-white/10 pt-4">
            <p className="text-sm font-medium mb-3">Create New Account</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={invite.name} onChange={(e) => setInvite(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input type="email" value={invite.email} onChange={(e) => setInvite(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Password <span className="text-destructive">*</span></Label>
                <Input type="password" value={invite.password} onChange={(e) => setInvite(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={invite.role} onValueChange={(v) => setInvite(p => ({ ...p, role: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="PILOT">Pilot</SelectItem>
                    <SelectItem value="CLIENT">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {inviteErr && <p className="text-sm text-destructive mt-2">{inviteErr}</p>}
            <div className="flex gap-2 mt-4">
              <Button onClick={createUser} disabled={inviting || !invite.email || !invite.password} size="sm">
                {inviting ? "Creatingâ€¦" : "Create Account"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowInvite(false)}>Cancel</Button>
            </div>
          </CardContent>
        )}

        <CardContent className={showInvite ? "border-t border-white/10 pt-4" : ""}>
          <div className="space-y-2">
            {members.map((m) => (
              <div key={m.id}
                className="flex items-center gap-3 rounded-lg border border-white/8 bg-white/2 px-4 py-3">
                <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-primary shrink-0">
                  {(m.name || m.email)?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{m.name ?? "(no name)"}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {m.id === currentUserId ? (
                    <div className="flex items-center gap-1.5">
                      {roleBadge(m.role)}
                      <Badge variant="outline" className="text-xs">You</Badge>
                    </div>
                  ) : (
                    <Select value={m.role} onValueChange={(v) => changeRole(m.id, v)}>
                      <SelectTrigger className="h-7 text-xs w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                        <SelectItem value="PILOT">Pilot</SelectItem>
                        <SelectItem value="CLIENT">Client</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  {m.id !== currentUserId && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      disabled={deletingId === m.id}
                      onClick={() => deleteUser(m.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" /> Role Guide
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">{roleBadge("ADMIN")} <span className="font-medium">Admin</span></div>
            <p className="text-muted-foreground text-xs">Full access to all CRM features, settings, invoicing, and team management.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">{roleBadge("PILOT")} <span className="font-medium">Pilot</span></div>
            <p className="text-muted-foreground text-xs">Can view assigned jobs, upload deliverables, and manage their documents.</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">{roleBadge("CLIENT")} <span className="font-medium">Client</span></div>
            <p className="text-muted-foreground text-xs">Can view project status, download deliverables, and pay invoices.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// â”€â”€â”€ Tab: Notifications â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function NotificationsTab({ user }: { user: CurrentUser | null }) {
  const prefs = (user?.preferences as Record<string, boolean> | null) ?? {};
  const [form, setForm] = useState({
    emailNewJob:        prefs.emailNewJob        ?? true,
    emailPayment:       prefs.emailPayment       ?? true,
    emailCompliance:    prefs.emailCompliance    ?? true,
    emailWeeklyDigest:  prefs.emailWeeklyDigest  ?? false,
    emailNewLead:       prefs.emailNewLead       ?? true,
    emailContractSigned: prefs.emailContractSigned ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: form }),
      });
      setSaved(true);
    } finally { setSaving(false); }
  }

  const toggle = (key: keyof typeof form) => {
    setForm(p => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  };

  const rows: { key: keyof typeof form; label: string; desc: string }[] = [
    { key: "emailNewJob",         label: "New Job Created",        desc: "Email when a new job is dispatched." },
    { key: "emailPayment",        label: "Payment Received",       desc: "Email when an invoice is marked PAID." },
    { key: "emailCompliance",     label: "Compliance Expiry",      desc: "Email alerts when pilot docs are expiring soon." },
    { key: "emailNewLead",        label: "New Lead",               desc: "Email when a new lead is added to the CRM." },
    { key: "emailContractSigned", label: "Contract Signed",        desc: "Email when a client signs a contract." },
    { key: "emailWeeklyDigest",   label: "Weekly Digest",          desc: "Weekly summary of jobs, revenue, and activity." },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-primary" /> Email Notifications
          </CardTitle>
          <CardDescription>Choose which events trigger email alerts to your admin address.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {rows.map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <button
                type="button"
                onClick={() => toggle(key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  form[key] ? "bg-primary" : "bg-white/10"
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form[key] ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>
      <SaveBar saving={saving} saved={saved} onSave={save} />
    </div>
  );
}

// â”€â”€â”€ Tab: Organization (white-label) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function OrgTab({ org }: { org: OrgData | null }) {
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
    } finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="h-4 w-4 text-primary" /> Organization Identity
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Palette className="h-4 w-4 text-primary" /> Brand Colors
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor} onChange={(e) => update("primaryColor", e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-white/10 bg-transparent" />
              <Input value={form.primaryColor} onChange={(e) => update("primaryColor", e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.accentColor} onChange={(e) => update("accentColor", e.target.value)}
                className="h-10 w-16 cursor-pointer rounded border border-white/10 bg-transparent" />
              <Input value={form.accentColor} onChange={(e) => update("accentColor", e.target.value)} className="font-mono text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4 text-primary" /> Custom Domain
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Custom Domain</Label>
            <Input placeholder="crm.yourdomain.com" value={form.customDomain} onChange={(e) => update("customDomain", e.target.value)} />
            <p className="text-xs text-muted-foreground">Point a CNAME DNS record to your Vercel deployment URL, then add it here.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CreditCard className="h-4 w-4 text-primary" /> Stripe Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Stripe Account ID (Connect)</Label>
            <Input placeholder="acct_..." value={form.stripeAccountId} onChange={(e) => update("stripeAccountId", e.target.value)} />
            <p className="text-xs text-muted-foreground">For Stripe Connect multi-tenant payments. Leave blank for platform-level Stripe keys.</p>
          </div>
          <Separator />
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-semibold text-foreground">Required Vercel Environment Variables:</p>
            <p><code className="bg-white/5 px-1 rounded">STRIPE_SECRET_KEY</code> â€” Your Stripe secret key</p>
            <p><code className="bg-white/5 px-1 rounded">STRIPE_WEBHOOK_SECRET</code> â€” From Stripe Dashboard &gt; Webhooks</p>
            <p><code className="bg-white/5 px-1 rounded">CRON_SECRET</code> â€” Random string to protect cron endpoints</p>
          </div>
        </CardContent>
      </Card>

      <SaveBar saving={saving} saved={saved} onSave={handleSave} />
    </div>
  );
}

// â”€â”€â”€ Main Shell â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function SettingsClient({ currentUser, org, teamMembers, currentUserId }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account, team, and platform configuration.</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="mb-6">
          <TabsTrigger value="account" className="gap-2"><User className="h-4 w-4" /> My Account</TabsTrigger>
          <TabsTrigger value="team" className="gap-2"><Users className="h-4 w-4" /> Team</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2"><Bell className="h-4 w-4" /> Notifications</TabsTrigger>
          <TabsTrigger value="org" className="gap-2"><Building2 className="h-4 w-4" /> Organization</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <AccountTab user={currentUser} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab members={teamMembers as TeamMember[]} currentUserId={currentUserId} />
        </TabsContent>

        <TabsContent value="notifications">
          <NotificationsTab user={currentUser} />
        </TabsContent>

        <TabsContent value="org">
          <OrgTab org={org} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
