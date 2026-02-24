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
  ShieldCheck,
  FolderOpen,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

interface SidebarProps {
  role: "ADMIN" | "PILOT" | "CLIENT";
  userName?: string | null;
  userEmail?: string | null;
}

const adminNav: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Pilots", href: "/admin/pilots", icon: Users },
  { label: "Clients", href: "/admin/clients", icon: Building2 },
  { label: "Jobs", href: "/admin/jobs", icon: Briefcase },
  { label: "Deliverables", href: "/admin/deliverables", icon: FolderOpen },
  { label: "Invoices", href: "/admin/invoices", icon: FileText },
  { label: "Compliance", href: "/admin/compliance", icon: ShieldCheck },
];

const pilotNav: NavItem[] = [
  { label: "Dashboard", href: "/pilot/dashboard", icon: LayoutDashboard },
  { label: "My Jobs", href: "/pilot/jobs", icon: Briefcase },
  { label: "Deliverables", href: "/pilot/deliverables", icon: FolderOpen },
  { label: "My Documents", href: "/pilot/documents", icon: ShieldCheck },
  { label: "Payments", href: "/pilot/payments", icon: FileText },
];

const clientNav: NavItem[] = [
  { label: "Dashboard", href: "/client/dashboard", icon: LayoutDashboard },
  { label: "My Projects", href: "/client/projects", icon: Briefcase },
  { label: "Deliverables", href: "/client/deliverables", icon: FolderOpen },
  { label: "Invoices", href: "/client/invoices", icon: FileText },
];

const navByRole = {
  ADMIN: adminNav,
  PILOT: pilotNav,
  CLIENT: clientNav,
};

const roleBadgeColors = {
  ADMIN: "bg-blue-600",
  PILOT: "bg-emerald-600",
  CLIENT: "bg-purple-600",
};

export function Sidebar({ role, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const navItems = navByRole[role];

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sidebar-foreground text-sm leading-none">
              Lumin Aerial
            </p>
            <p className="text-xs text-sidebar-foreground/50 mt-0.5">CRM</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group",
                isActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && (
                <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div className="px-3 pb-4 border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground">
            {userName?.charAt(0).toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">
              {userName ?? "User"}
            </p>
            <p className="text-sidebar-foreground/50 text-xs truncate">
              {userEmail}
            </p>
          </div>
          <span
            className={cn(
              "text-[10px] font-semibold text-white px-1.5 py-0.5 rounded uppercase",
              roleBadgeColors[role]
            )}
          >
            {role}
          </span>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
