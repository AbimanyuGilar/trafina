'use client'

import Wrapper from "../../components/wrapper";
import React from "react";
import {
  Building2,
  Banknote,
  SquareChartGantt
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function DashboardWrapper({ children, user }: { children: React.ReactNode, user: any}) {
   const { data: organization } = authClient.useActiveOrganization()
  const navItems = [
    {
      label: "Perusahaan",
      roles: ["USER"],
      icon: Building2,
      requiredOrganization: false,
      children: [
        {
          label: "Daftar Perusahaan", 
          href: "/dashboard",
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
      icon: Banknote,
      requiredOrganization: true,
      children: [
        {
          label: "Kasir", 
          href: `/dashboard/com/${organization?.slug}/cashier`,
          roles: ["USER"],
          requiredOrganization: true,
        },
        {
          label: "Transaksi Manual", 
          href: `/dashboard/com/${organization?.slug}/manual-transaction`,
          roles: ["USER"],
          requiredOrganization: true,
        },
        {
          label: "Riwayat Transaksi", 
          href: `/dashboard/com/${organization?.slug}/transaction-history`,
          roles: ["USER"],
          requiredOrganization: true,
        },
      ]
    },
    {
      label: "Manajemen", 
      roles: ["USER"],
      icon: SquareChartGantt,
      requiredOrganization: true,
      children: [
        {
          label: "Inventaris", 
          href: `/dashboard/com/${organization?.slug}/inventory`,
          roles: ["USER"],
          requiredOrganization: true,
        },
        {
          label: "Karyawan", 
          href: `/dashboard/com/${organization?.slug}/staff`,
          roles: ["USER"],
          requiredOrganization: true,
        },
      ]
    },
  ];
  
  return (
    <>
      <Wrapper user={user} navItems={navItems} organization={organization}>
        { children }
      </Wrapper>
    </>
  );
}
