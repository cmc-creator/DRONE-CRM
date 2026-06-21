"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Building2,
  MoreHorizontal,
  Settings,
  ShieldCheck,
  Receipt,
  BarChart2,
  ClipboardList,
  Map,
  Plug,
  X,
} from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/admin/dashboard", label: "Home",     icon: LayoutDashboard },
  { href: "/admin/jobs",      label: "Jobs",     icon: Briefcase },
  { href: "/admin/pilots",    label: "Pilots",   icon: Users },
  { href: "/admin/invoices",  label: "Invoices", icon: FileText },
  { href: "/admin/clients",   label: "Clients",  icon: Building2 },
];

const MORE_ITEMS = [
  { href: "/admin/settings",     label: "Settings",     icon: Settings },
  { href: "/admin/compliance",   label: "Compliance",   icon: ShieldCheck },
  { href: "/admin/tax",          label: "Tax",          icon: Receipt },
  { href: "/admin/analytics",    label: "Analytics",    icon: BarChart2 },
  { href: "/admin/reports",      label: "Reports",      icon: ClipboardList },
  { href: "/admin/dispatch",     label: "Dispatch Map", icon: Map },
  { href: "/admin/integrations", label: "Integrations", icon: Plug },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Bottom tab bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex items-stretch"
        style={{
          background: "rgba(4,8,15,0.97)",
          borderTop: "1px solid rgba(0,212,255,0.1)",
          backdropFilter: "blur(16px)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-all duration-150"
              style={{ color: active ? "#00d4ff" : "rgba(255,255,255,0.35)" }}
            >
              <Icon className="w-5 h-5" />
              <span
                className="text-[9px] font-bold tracking-wide uppercase"
                style={{ color: active ? "#00d4ff" : "rgba(255,255,255,0.3)" }}
              >
                {label}
              </span>
              {active && (
                <div
                  className="absolute bottom-0 h-0.5 w-8 rounded-t-full"
                  style={{ background: "#00d4ff" }}
                />
              )}
            </Link>
          );
        })}

        {/* More tab */}
        <button
          onClick={() => setOpen(true)}
          className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 relative transition-all duration-150"
          style={{ color: open ? "#00d4ff" : "rgba(255,255,255,0.35)" }}
        >
          <MoreHorizontal className="w-5 h-5" />
          <span
            className="text-[9px] font-bold tracking-wide uppercase"
            style={{ color: open ? "#00d4ff" : "rgba(255,255,255,0.3)" }}
          >
            More
          </span>
        </button>
      </nav>

      {/* More drawer — bottom sheet */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 md:hidden"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setOpen(false)}
          />
          {/* Sheet */}
          <div
            className="fixed left-0 right-0 bottom-0 z-50 md:hidden rounded-t-2xl"
            style={{
              background: "#080f1e",
              border: "1px solid rgba(0,212,255,0.15)",
              paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
            }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(0,212,255,0.08)" }}>
              <span className="text-sm font-semibold" style={{ color: "#d8e8f4" }}>More</span>
              <button onClick={() => setOpen(false)} className="p-1 rounded-lg" style={{ color: "rgba(216,232,244,0.5)" }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1 p-4">
              {MORE_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl transition-all"
                    style={{
                      background: active ? "rgba(0,212,255,0.1)" : "rgba(0,212,255,0.03)",
                      color: active ? "#00d4ff" : "rgba(216,232,244,0.7)",
                      border: `1px solid ${active ? "rgba(0,212,255,0.25)" : "rgba(0,212,255,0.07)"}`,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                    <span className="text-[10px] font-semibold tracking-wide text-center leading-tight">
                      {label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}

