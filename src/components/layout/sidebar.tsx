"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  FileText,
  FileSignature,
  ShieldCheck,
  FolderOpen,
  LogOut,
  CalendarDays,
  TrendingUp,
  Target,
  Bell,
  Plug,
  Map,
  Settings2,
  Beaker,
  MessageSquare,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  role: "ADMIN" | "PILOT" | "CLIENT";
  userName?: string | null;
  userEmail?: string | null;
}

const adminGroups: NavGroup[] = [
  {
    label: "Command",
    items: [
      { label: "Command Center", href: "/admin/dashboard",      icon: LayoutDashboard },
      { label: "Notifications",  href: "/admin/notifications",   icon: Bell },
      { label: "Calendar",       href: "/admin/calendar",        icon: CalendarDays },
    ],
  },
  {
    label: "Operations",
    items: [
      { label: "Jobs",           href: "/admin/jobs",            icon: Briefcase },
      { label: "Pilots",         href: "/admin/pilots",          icon: Users },
      { label: "Deliverables",   href: "/admin/deliverables",    icon: FolderOpen },
    ],
  },
  {
    label: "Business",
    items: [
      { label: "Clients",        href: "/admin/clients",         icon: Building2 },
      { label: "Leads",          href: "/admin/leads",           icon: Target },
      { label: "Quotes",         href: "/admin/quotes",          icon: MessageSquare },
      { label: "Invoices",       href: "/admin/invoices",        icon: FileText },
      { label: "Contracts",      href: "/admin/contracts",       icon: FileSignature },
    ],
  },
  {
    label: "Compliance & Intel",
    items: [
      { label: "Documents",      href: "/admin/compliance",      icon: ShieldCheck },
      { label: "Analytics",      href: "/admin/analytics",       icon: TrendingUp },
      { label: "Dispatch Map",   href: "/admin/dispatch",        icon: Map },
    ],
  },
  {
    label: "Settings",
    items: [
      { label: "Integrations",   href: "/admin/integrations",   icon: Plug },
      { label: "Account & Team", href: "/admin/settings",        icon: Settings2 },
      { label: "Dev Tools",      href: "/admin/dev-tools",       icon: Beaker },
    ],
  },
];

const pilotGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",    href: "/pilot/dashboard",    icon: LayoutDashboard },
      { label: "My Jobs",      href: "/pilot/jobs",         icon: Briefcase },
    ],
  },
  {
    label: "Files",
    items: [
      { label: "Deliverables", href: "/pilot/deliverables", icon: FolderOpen },
      { label: "My Documents", href: "/pilot/documents",    icon: ShieldCheck },
    ],
  },
  {
    label: "Finance",
    items: [
      { label: "Payments",     href: "/pilot/payments",     icon: FileText },
    ],
  },
];

const clientGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",    href: "/client/dashboard",    icon: LayoutDashboard },
      { label: "My Projects",  href: "/client/projects",     icon: Briefcase },
    ],
  },
  {
    label: "Files & Billing",
    items: [
      { label: "Deliverables", href: "/client/deliverables", icon: FolderOpen },
      { label: "Invoices",     href: "/client/invoices",     icon: FileText },
      { label: "Contracts",    href: "/client/contracts",    icon: FileSignature },
    ],
  },
];

const groupsByRole = { ADMIN: adminGroups, PILOT: pilotGroups, CLIENT: clientGroups };

const roleConfig = {
  ADMIN:  { label: "Admin",  color: "#00d4ff",  bg: "rgba(0,212,255,0.12)"  },
  PILOT:  { label: "Pilot",  color: "#34d399",  bg: "rgba(52,211,153,0.12)" },
  CLIENT: { label: "Client", color: "#a78bfa",  bg: "rgba(167,139,250,0.12)"},
};

function DroneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none">
      <circle cx="15" cy="15" r="4" fill="currentColor" />
      <line x1="15" y1="11" x2="15" y2="4"  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="15" y1="19" x2="15" y2="26" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="11" y1="15" x2="4"  y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="19" y1="15" x2="26" y2="15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="15" cy="3"  r="2.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="15" cy="27" r="2.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="3"  cy="15" r="2.5" fill="currentColor" fillOpacity="0.5" />
      <circle cx="27" cy="15" r="2.5" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const groups   = groupsByRole[role];
  const rConf    = roleConfig[role];

  return (
    <aside
      className="w-60 min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #02050d 0%, #030810 60%, #020509 100%)",
        borderRight: "1px solid rgba(0,212,255,0.07)",
      }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Logo */}
      <div
        className="relative z-10 px-5 py-4 flex items-center gap-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(0,212,255,0.06)" }}
      >
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 login-glow-pulse"
          style={{ background: "linear-gradient(135deg, #0052cc 0%, #00a8e8 50%, #00d4ff 100%)", color: "white" }}
        >
          <DroneIcon size={18} />
        </div>
        <div>
          <div
            className="font-black tracking-[0.10em] uppercase text-sm login-text-glow"
            style={{ color: "#00d4ff" }}
          >
            Lumin Aerial
          </div>
          <div className="text-[9px] tracking-widest uppercase" style={{ color: "rgba(0,212,255,0.3)" }}>
            Mission Control
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="relative z-10 flex-1 px-3 py-3 overflow-y-auto space-y-3">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="label-cyan px-2 mb-1">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                      isActive ? "text-white" : "text-sidebar-foreground/55 hover:text-sidebar-foreground/90"
                    )}
                    style={
                      isActive
                        ? {
                            background: "rgba(0,212,255,0.09)",
                            borderLeft: "2px solid #00d4ff",
                            paddingLeft: "10px",
                          }
                        : {
                            borderLeft: "2px solid transparent",
                          }
                    }
                  >
                    <Icon
                      className="w-4 h-4 flex-shrink-0"
                      style={isActive ? { color: "#00d4ff" } : {}}
                    />
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{ background: "rgba(0,212,255,0.15)", color: "#00d4ff" }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        className="relative z-10 px-4 pb-4 pt-3 flex-shrink-0"
        style={{ borderTop: "1px solid rgba(0,212,255,0.06)" }}
      >
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0"
            style={{ background: rConf.bg, color: rConf.color, border: `1px solid ${rConf.color}33` }}
          >
            {userName?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: "#d8e8f4" }}>
              {userName ?? "User"}
            </p>
            <p className="text-[10px] truncate" style={{ color: "rgba(0,212,255,0.32)" }}>
              {userEmail}
            </p>
          </div>
          <span
            className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded"
            style={{ background: rConf.bg, color: rConf.color }}
          >
            {rConf.label}
          </span>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all duration-150"
          style={{ color: "rgba(0,212,255,0.35)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.08)";
            e.currentTarget.style.color = "#f87171";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "rgba(0,212,255,0.35)";
          }}
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign out
        </button>
        <p className="text-[9px] mt-2 px-2" style={{ color: "rgba(0,212,255,0.15)" }}>
          © 2026 NyxAerial · Built for Lumin Aerial LLC
        </p>
      </div>
    </aside>
  );
}
