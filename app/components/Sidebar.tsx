"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/clients", label: "Clients", icon: "🏢" },
  { href: "/pilots", label: "Pilots", icon: "🚁" },
  { href: "/leads", label: "Leads", icon: "🎯" },
  { href: "/jobs", label: "Jobs", icon: "💼" },
  { href: "/contracts", label: "Contracts", icon: "📄" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="px-6 py-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚁</span>
          <div>
            <h1 className="text-lg font-bold leading-tight">Drone CRM</h1>
            <p className="text-slate-400 text-xs">Pilot Management</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="px-6 py-4 border-t border-slate-700 text-xs text-slate-500">
        © {new Date().getFullYear()} Drone CRM
      </div>
    </aside>
  );
}
