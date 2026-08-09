"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LucideIcon,
  Menu,
  X,
  LogOut,
  ChevronRight,
} from "lucide-react";

export default function DashboardShell({
  user,
  children,
  navItems,
}: {
  user: any;
  children: React.ReactNode;
  navItems: { label: string, href: string, icon: LucideIcon, roles?: string[] }[]
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const filteredNavItems = navItems.filter(item => {
    if (!item.roles) return true

    return item.roles.includes(user.role)
  })

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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased relative overflow-hidden">
      {/* Overlay Responsif untuk Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-20 md:hidden transition-opacity"
        />
      )}

      {/* Floating Toggle Button (visible only when sidebar is closed) */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-30 p-2.5 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          aria-label="Open Navigation Sidebar"
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-20 top-0
          bg-white border-r border-slate-200
          flex flex-col justify-between
          h-screen overflow-hidden transition-all duration-300 ease-in-out
          ${
            isSidebarOpen
              ? "w-64 translate-x-0"
              : "-translate-x-full md:translate-x-0 md:w-0 md:border-none"
          }
        `}
      >
        {/* Bagian Atas: Logo & Navigasi */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Branding Logo */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <span className="font-bold text-lg text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                FinansialApp
              </span>
            </Link>
            {/* Tombol Toggle Sidebar */}
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label="Close Sidebar"
            >
              <X size={18} />
            </button>
          </div>

          {/* Menu Navigasi (Scrollable) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-1">
            <nav className="space-y-1">
              {filteredNavItems.map((item) => {
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

        {/* Bagian Bawah: Profil dengan Popup Logout */}
        <div className="p-4 border-t border-slate-200/60 bg-slate-50 flex flex-col flex-shrink-0 relative">
          {/* Profil Card (sebagai pemicu/button) */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer focus:outline-none"
          >
            <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {getUserInitial(user.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {user.name || "User"}
              </p>
              <p className="text-xs text-slate-500 font-medium capitalize truncate">
                {user.role?.toLowerCase() || "user"}
              </p>
            </div>
          </button>

          {/* Popup Dropdown Logout */}
          {isProfileOpen && (
            <>
              {/* Backdrop tak terlihat untuk menutup dropdown saat klik di luar */}
              <div
                onClick={() => setIsProfileOpen(false)}
                className="fixed inset-0 z-40 cursor-default"
              />
              {/* Dropdown Menu */}
              <div className="absolute bottom-full left-4 right-4 mb-2 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  className="cursor-pointer flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all w-full"
                >
                  <LogOut size={16} strokeWidth={1.75} />
                  <span>Keluar Akun</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className={`flex-1 bg-slate-50 p-4 sm:p-6 md:p-8 overflow-y-auto h-screen transition-all duration-300 ${!isSidebarOpen ? 'pt-16 md:pt-8 md:pl-16' : ''}`}>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}