'use client'

import Sidebar from "../../components/sidebar";
import React from "react";
import {
  Building2,
} from "lucide-react";

const navItems = [
  {
    label: "Perusahaaan", 
    href: "/organization",
    icon: Building2
  },
];

export default function OrganizationSidebar({ children, user }: { children: React.ReactNode, user: any }) {
  return (
    <>
      <Sidebar user={user} navItems={navItems}>
        { children }
      </Sidebar>
    </>
  );
}