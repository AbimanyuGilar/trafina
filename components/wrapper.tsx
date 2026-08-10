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
import { DynamicBreadcrumb } from "./breadcrumb";

export default function DashboardWrapper({
  user,
  children,
  navItems,
}: {
  user: any;
  children: React.ReactNode;
  navItems: { label: string, href: string, icon: LucideIcon, roles?: string[] }[]
}) {
  const [isWrapperOpen, setIsWrapperOpen] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans antialiased relative overflow-hidden h-screen w-screen">
      {/* Overlay Responsif untuk Mobile */}
      {isWrapperOpen && (
        <div
          onClick={() => setIsWrapperOpen(false)}
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-xs z-20 md:hidden transition-opacity"
        />
      )}

      {/* WRAPPER NAVIGATION (SIDEBAR) */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-20 top-0
          bg-white border-r border-slate-200
          flex flex-col justify-between
          h-screen overflow-visible transition-all duration-300 ease-in-out flex-shrink-0
          ${
            isWrapperOpen
              ? "w-64 translate-x-0"
              : "-translate-x-full md:translate-x-0 md:w-16"
          }
        `}
      >
        {/* Bagian Atas: Logo & Navigasi */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Branding Logo & Toggle */}
          <div className={`h-16 border-b border-slate-100 flex items-center flex-shrink-0 transition-all duration-300 ${isWrapperOpen ? 'px-6 justify-between' : 'justify-center'}`}>
            {isWrapperOpen && (
              <Link href="/dashboard" className="flex items-center gap-2 group animate-in fade-in duration-300">
                <span className="font-bold text-lg text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                  FinansialApp
                </span>
              </Link>
            )}
            {/* Tombol Toggle Wrapper (Desktop only or close for mobile) */}
            <button
              onClick={() => setIsWrapperOpen(!isWrapperOpen)}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              aria-label={isWrapperOpen ? "Close Wrapper" : "Open Wrapper"}
            >
              {isWrapperOpen ? <X size={18} /> : <Menu size={18} />}
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
                    title={!isWrapperOpen ? item.label : undefined}
                    className={`
                      flex items-center rounded-lg text-sm font-medium transition-all duration-300
                      ${
                        isActive
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }
                      ${
                        isWrapperOpen
                          ? "px-3 py-2.5 justify-between w-full"
                          : "w-10 h-10 justify-center mx-auto p-0"
                      }
                    `}
                  >
                    <div className={`flex items-center ${isWrapperOpen ? 'gap-3' : 'justify-center'}`}>
                      <Icon
                        size={18}
                        strokeWidth={1.75}
                        className={isActive ? "text-blue-600" : "text-slate-400"}
                      />
                      {isWrapperOpen && (
                        <span className="whitespace-nowrap animate-in fade-in duration-300">
                          {item.label}
                        </span>
                      )}
                    </div>
                    {isWrapperOpen && isActive && (
                      <ChevronRight size={14} className="text-blue-600 animate-in fade-in duration-300" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Bagian Bawah: Profil dengan Popup Logout */}
        <div className={`border-t border-slate-200/60 bg-slate-50 flex flex-col flex-shrink-0 relative transition-all duration-300 ${isWrapperOpen ? 'p-4' : 'p-2'}`}>
          {/* Profil Card (sebagai pemicu/button) */}
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`
              flex items-center rounded-lg bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs cursor-pointer focus:outline-none
              ${isWrapperOpen ? 'w-full px-3 py-2.5 gap-3 text-left' : 'w-10 h-10 p-0 justify-center mx-auto'}
            `}
          >
            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center text-sm font-semibold flex-shrink-0">
              {getUserInitial(user.name)}
            </div>
            {isWrapperOpen && (
              <div className="flex-1 min-w-0 animate-in fade-in duration-300">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-slate-500 font-medium capitalize truncate">
                  {user.role?.toLowerCase() || "user"}
                </p>
              </div>
            )}
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
              <div className={`
                absolute bottom-full mb-2 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 animate-in fade-in slide-in-from-bottom-2 duration-150
                ${isWrapperOpen ? 'left-4 right-4' : 'left-0 w-48'}
              `}>
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

      {/* AREA UTAMA (TOPBAR + MAIN CONTENT) */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Topbar khusus Mobile */}
        <header className="md:hidden h-16 bg-white border-b border-slate-200 px-4 flex items-center justify-between flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsWrapperOpen(true)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95 transition-all"
              aria-label="Open Navigation Wrapper"
            >
              <Menu size={20} strokeWidth={1.75} />
            </button>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              FinansialApp
            </span>
          </div>

          {/* Dropdown Profil di Mobile */}
          <div className="relative">
            <button
              onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
              className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-95 transition-all"
            >
              {getUserInitial(user.name)}
            </button>

            {isMobileProfileOpen && (
              <>
                {/* Backdrop untuk menutup popover saat klik diluar */}
                <div
                  onClick={() => setIsMobileProfileOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute right-0 mt-2 z-50 bg-white border border-slate-200 rounded-lg shadow-lg p-1.5 w-48 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {user.name || "User"}
                    </p>
                    <p className="text-xs text-slate-500 font-medium capitalize truncate">
                      {user.role?.toLowerCase() || "user"}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileProfileOpen(false);
                      handleLogout();
                    }}
                    className="cursor-pointer flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-all w-full"
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    <span>Keluar Akun</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 bg-slate-50 p-4 sm:p-6 md:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            <DynamicBreadcrumb 
              className="hidden lg:block mb-6 px-1 text-sm font-medium tracking-wide text-slate-500" 
            />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
