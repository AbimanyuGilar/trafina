import Wrapper from "../../components/wrapper";
import React from "react";
import {
  Building2,
  Banknote,
  SquareChartGantt
} from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import DashboardWrapperClient from "./DashboardWrapperClient";

export default async function DashboardWrapper({ 
  children, 
  user,
  permissions = [],
  isOwner = false,
}: { 
  children: React.ReactNode, 
  user: any,
  permissions?: string[],
  isOwner?: boolean,
}) {
  const organization = await auth.api.getFullOrganization({
    headers: await headers(),
  });
  
  const navItems = [
    {
      label: "Dashboard",
      roles: ["USER", "ADMIN"],
      icon: "LayoutDashboard",
      requiredOrganization: true,
      children: [
        {
          label: "Dashboard", 
          href: "/dashboard",
          roles: ["USER", "ADMIN"],
          requiredOrganization: false,
        },
      ]
    },
    {
      label: "Perusahaan",
      roles: ["USER"],
      icon: "Building2",
      requiredOrganization: false,
      children: [
        {
          label: "Daftar Perusahaan", 
          href: "/dashboard/com",
          roles: ["USER"],
          requiredOrganization: false,
        },
        {
          label: "Perusahaan Saat Ini", 
          href: `/dashboard/com/${organization?.slug}`,
          roles: ["USER"],
          requiredOrganization: true,
        },
      ]
    },
    {
      label: "Transaksi",
      roles: ["USER"],
      icon: "Banknote",
      requiredOrganization: true,
      permission: "manage_transactions",
      children: [
        {
          label: "Transaksi Manual", 
          href: `/dashboard/com/${organization?.slug}/manual-transaction`,
          roles: ["USER"],
          requiredOrganization: true,
          permission: "manage_manual_transaction",
        },
        {
          label: "Kasir", 
          href: `/dashboard/com/${organization?.slug}/cashier`,
          roles: ["USER"],
          requiredOrganization: true,
          permission: "manage_cashier",
        },
        {
          label: "Riwayat Transaksi", 
          href: `/dashboard/com/${organization?.slug}/transaction-history`,
          roles: ["USER"],
          requiredOrganization: true,
          permission: "manage_transaction_history",
        },
      ]
    },
    {
      label: "Manajemen", 
      roles: ["USER"],
      icon: "SquareChartGantt",
      requiredOrganization: true,
      children: [
        {
          label: "Produk", 
          href: `/dashboard/com/${organization?.slug}/product`,
          roles: ["USER"],
          requiredOrganization: true,
          permission: "manage_products",
        },
        {
          label: "Karyawan", 
          href: `/dashboard/com/${organization?.slug}/staff`,
          roles: ["USER"],
          requiredOrganization: true,
          permission: "manage_staffs",
        },
      ]
    },
  ];

  // Filter navItems berdasarkan izin
  const filteredNavItems = navItems.map(item => {
    let parentAllowed = true
    if ('permission' in item && typeof item.permission === 'string') {
      parentAllowed = isOwner || permissions.includes(item.permission)
    }

    if (item.children) {
      const allowedChildren = item.children.filter(child => {
        if ('permission' in child && typeof child.permission === 'string') {
          return isOwner || permissions.includes(child.permission)
        }
        return true
      })
      
      // Jika parent tidak diizinkan, dan tidak ada anak yang diizinkan, sembunyikan seluruh grup
      if (!parentAllowed && allowedChildren.length === 0) {
        return null
      }

      return {
        ...item,
        children: allowedChildren
      }
    }

    return parentAllowed ? item : null
  }).filter((item): item is NonNullable<typeof item> => {
    if (!item) return false
    // Jika punya submenu (children) tapi semua submenu disembunyikan, sembunyikan menu utamanya juga
    if (item.children && item.children.length === 0) return false
    return true
  });
  
  return (
    <>
      <DashboardWrapperClient user={user} navItems={filteredNavItems} organization={organization}>
        { children }
      </DashboardWrapperClient>
    </>
  );
}
