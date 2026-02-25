"use client";

import Link from "next/link";
import { Plus, Briefcase, Building2, Target, FileText, Users, Calendar } from "lucide-react";

const QUICK_ACTIONS = [
  { label: "New Job",     href: "/admin/jobs/new",      icon: Briefcase, color: "#00d4ff" },
  { label: "Add Client",  href: "/admin/clients/new",   icon: Building2, color: "#a78bfa" },
  { label: "Add Lead",    href: "/admin/leads/new",     icon: Target,    color: "#fbbf24" },
  { label: "New Invoice", href: "/admin/invoices/new",  icon: FileText,  color: "#34d399" },
  { label: "Add Pilot",   href: "/admin/pilots/new",    icon: Users,     color: "#60a5fa" },
  { label: "Calendar",    href: "/admin/calendar",      icon: Calendar,  color: "#f472b6" },
];

export function QuickActions() {
  return (
    <div
      className="rounded-xl p-4"
      style={{ background: "rgba(0,212,255,0.03)", border: "1px solid rgba(0,212,255,0.07)" }}
    >
      <p className="label-cyan mb-3">Quick Actions</p>
      <div className="flex flex-wrap gap-2">
        {QUICK_ACTIONS.map((a) => {
          const Icon = a.icon;
          return (
            <Link key={a.label} href={a.href}>
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
                style={{
                  background: `${a.color}12`,
                  border: `1px solid ${a.color}30`,
                  color: a.color,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${a.color}22`;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 16px ${a.color}22`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = `${a.color}12`;
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                <Icon className="w-3.5 h-3.5" />
                {a.label}
              </button>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
