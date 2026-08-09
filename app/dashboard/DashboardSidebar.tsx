'use client'

import Sidebar from "../../components/sidebar";
import React from "react";
import {
  X,
  LayoutDashboard,
  FileUser,
  Store,
  ShelvingUnit,
  ShoppingBag,
  Warehouse,
  Building2
} from "lucide-react";

const navItems = [
  {
    label: "Dashboard", 
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Kasir", 
    href: "/dashboard/cashier",
    roles: ["USER"],
    icon: ShoppingBag
  },
  {
    label: "Inventaris", 
    href: "/dashboard/inventory",
    roles: ["USER"],
    icon: ShelvingUnit
  },
  {
    label: "Toko", 
    href: "/dashboard/store",
    roles: ["USER"],
    icon: Store
  },
  {
    label: "Gudang", 
    href: "/dashboard/warehouse",
    roles: ["USER"],
    icon: Warehouse
  },
  {
    label: "Karyawan", 
    href: "/dashboard/staff",
    roles: ["USER"],
    icon: FileUser
  },
  {
    label: "Perusahaan", 
    href: "/organization",
    roles: ["USER"],
    icon: Building2
  },
];

export default function DashboardSidebar({ children, user }: { children: React.ReactNode, user: any }) {
  return (
    <>
      <Sidebar user={user} navItems={navItems}>
        { children }
      </Sidebar>
    </>
  );
}