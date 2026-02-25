"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, FileText, Upload, DollarSign, LayoutDashboard } from "lucide-react";

const NAV = [
  { href: "/pilot/dashboard",    label: "Home",       icon: LayoutDashboard },
  { href: "/pilot/jobs",         label: "Jobs",       icon: Briefcase },
  { href: "/pilot/deliverables", label: "Uploads",    icon: Upload },
  { href: "/pilot/documents",    label: "Docs",       icon: FileText },
  { href: "/pilot/payments",     label: "Pay",        icon: DollarSign },
];

export function PilotMobileNav() {
  const pathname = usePathname();

  return (
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
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 transition-all duration-150"
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
    </nav>
  );
}
