"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronRight,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/owner", icon: LayoutDashboard },
];

export default function DashboardShell({
  user,
  children,
}: {
  user: any;
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Gagal melakukan logout:", error);
    }
  };

  // Helper untuk inisial nama user
  const getUserInitial = (name?: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* 1. NAVBAR ATAS */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm transition-all">
        <div className="flex items-center gap-3">
          {/* Tombol Toggle Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            aria-label="Toggle Navigation Sidebar"
          >
            {isSidebarOpen ? <X size={20} strokeWidth={1.75} /> : <Menu size={20} strokeWidth={1.75} />}
          </button>

          {/* Identity & Logo App */}
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <span className="font-bold text-lg text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
              FinansialApp
            </span>
          </Link>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center text-xs font-semibold">
              {getUserInitial(user.name)}
            </div>
            <span className="text-sm font-medium text-slate-700 hidden sm:inline-block max-w-[150px] truncate">
              {user.name || user.email || "User"}
            </span>
          </div>

          {/* Tombol Logout */}
          <button
            onClick={handleLogout}
            className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg transition-all shadow-sm"
            title="Keluar Akun"
          >
            <LogOut size={16} strokeWidth={1.75} />
          </button>
        </div>
      </header>

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CONTENT) */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Overlay Responsif untuk Mobile */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-20 md:hidden transition-opacity"
          />
        )}

        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`
            fixed md:static inset-y-0 left-0 z-20 top-16
            bg-white border-r border-slate-200
            flex flex-col justify-between
            overflow-hidden transition-all duration-300 ease-in-out
            ${
              isSidebarOpen
                ? "w-64 translate-x-0"
                : "-translate-x-full md:translate-x-0 md:w-0 md:border-none"
            }
          `}
        >
          <div className="p-4 space-y-6 overflow-y-auto w-64">
            {/* Sidebar Group Header */}
            <div>
              <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Navigasi Utama
              </p>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                        ${
                          isActive
                            ? "bg-blue-50 text-blue-600 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          strokeWidth={1.75}
                          className={isActive ? "text-blue-600" : "text-slate-400"}
                        />
                        <span className="whitespace-nowrap">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-blue-600" />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 bg-slate-50 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}