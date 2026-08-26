"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import {
  LucideIcon,
  Menu,
  X,
  LogOut,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";

export default function DashboardWrapper({
  user,
  children,
  navItems,
  organization,
}: {
  user: any;
  organization?: any;
  children: React.ReactNode;
  navItems: {
    label: string;
    href?: string;
    icon: LucideIcon;
    roles?: string[];
    requiredOrganization?: boolean;
    children?: {
      label: string;
      href: string;
      roles?: string[];
      requiredOrganization?: boolean;
    }[];
  }[];
}) {
  const [isWrapperOpen, setIsWrapperOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [openSubMenus, setOpenSubMenus] = useState<Record<string, boolean>>({});
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jalankan hanya di browser untuk mendeteksi mobile
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setIsWrapperOpen(false);
    }
  }, []);

  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const isChildActive = (item: any) => {
    return item.children?.some((child: any) => pathname === child.href);
  };

  const isSubMenuOpen = (item: any) => {
    if (openSubMenus[item.label] !== undefined) {
      return openSubMenus[item.label];
    }
    return isChildActive(item);
  };

  const filteredNavItems = navItems.filter(item => {
    const checkRole = !item.roles || item.roles.includes(user?.role)
    const checkOrganization = !item.requiredOrganization || Boolean(organization)

    return checkRole && checkOrganization
  }).map(item => {
    if (item.children) {
      return {
        ...item,
        children: item.children.filter(child => {
          const checkChildRole = !child.roles || child.roles.includes(user?.role)
          const checkChildOrganization = !child.requiredOrganization || Boolean(organization)
          return checkChildRole && checkChildOrganization
        })
      }
    }
    return item;
  }).filter(item => {
    if (item.children && item.children.length === 0) return false;
    return true;
  });

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
          <div className={`h-16 border-b border-slate-100 flex items-center flex-shrink-0 transition-all duration-300 ${isWrapperOpen ? 'px-6 justify-between' : 'justify-center'} overflow-hidden`}>
            {isWrapperOpen && (
              <div>
                <Link href="/dashboard" className="flex items-center group animate-in fade-in duration-300">
                  <Image
                    alt='trafina logo'
                    src='/logo.png'
                    width={20}
                    height={20}
                  />
                  <span className="mt-2 font-bold text-lg text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                    rafina
                  </span>
                </Link>
              </div>
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
          <div className={`flex-1 overflow-y-auto space-y-1 transition-all duration-300 ${isWrapperOpen ? 'p-4' : 'px-2 py-4'} overflow-x-hidden`}>
            <nav className="space-y-1">
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const hasChildren = item.children && item.children.length > 0;

                if (hasChildren) {
                  const isOpen = isSubMenuOpen(item);
                  const isAnyChildActive = isChildActive(item);

                  return (
                    <div key={item.label} className="relative group">
                      {isWrapperOpen ? (
                        /* Expandable menu ketika sidebar terbuka */
                        <div>
                          <button
                            onClick={() => toggleSubMenu(item.label)}
                            className={`
                              w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer focus:outline-none
                              ${
                                isAnyChildActive
                                  ? "text-blue-600 font-semibold"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                              }
                            `}
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                size={18}
                                strokeWidth={1.75}
                                className={isAnyChildActive ? "text-blue-600" : "text-slate-400"}
                              />
                              <span className="whitespace-nowrap">{item.label}</span>
                            </div>
                            <ChevronDown
                              size={16}
                              className={`text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                            />
                          </button>

                          {/* Kontainer Item Sub-menu */}
                          <div
                            className={`
                              mt-1 space-y-1 pl-9 overflow-hidden transition-all duration-300
                              ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                            `}
                          >
                            {item.children!.map((child) => {
                              const isChildCurrent = pathname === child.href;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => {
                                    if (window.innerWidth < 768) {
                                      setIsWrapperOpen(false);
                                    }
                                  }}
                                  className={`
                                    block py-2 px-3 rounded-lg text-xs font-medium transition-colors
                                    ${
                                      isChildCurrent
                                        ? "bg-blue-50/80 text-blue-600 font-semibold"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                                    }
                                  `}
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Collapsed icon dengan hover popover */
                        <div className="flex justify-center py-1">
                          <button
                            onClick={() => {
                              setIsWrapperOpen(true);
                              setOpenSubMenus((prev) => ({ ...prev, [item.label]: true }));
                            }}
                            className={`
                              w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 focus:outline-none
                              ${
                                isAnyChildActive
                                  ? "bg-blue-50 text-blue-600 font-semibold"
                                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                              }
                            `}
                          >
                            <Icon
                              size={18}
                              strokeWidth={1.75}
                              className={isAnyChildActive ? "text-blue-600" : "text-slate-400"}
                            />
                          </button>

                          {/* Popover */}
                          <div className="absolute left-full top-0 ml-2 bg-white border border-slate-200 shadow-lg rounded-lg py-1.5 w-48 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform translate-x-2 group-hover:translate-x-0 pointer-events-none group-hover:pointer-events-auto">
                            <div className="px-3 py-1.5 border-b border-slate-100 text-xs font-semibold text-slate-400">
                              {item.label}
                            </div>
                            {item.children!.map((child) => {
                              const isChildCurrent = pathname === child.href;
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  onClick={() => {
                                    if (window.innerWidth < 768) {
                                      setIsWrapperOpen(false);
                                    }
                                  }}
                                  className={`
                                    block px-3 py-2 text-sm transition-colors
                                    ${
                                      isChildCurrent
                                        ? "text-blue-600 bg-blue-50/50 font-medium"
                                        : "text-slate-600 hover:text-blue-600 hover:bg-slate-50"
                                    }
                                  `}
                                >
                                  {child.label}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                } else {
                  // Normal item tanpa sub-menu
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href || "#"}
                      title={!isWrapperOpen ? item.label : undefined}
                      onClick={() => {
                        if (window.innerWidth < 768) {
                          setIsWrapperOpen(false);
                        }
                      }}
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
                    </Link>
                  );
                }
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
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
