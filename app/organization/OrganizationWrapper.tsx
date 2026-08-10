'use client'

import Wrapper from "../../components/wrapper";
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

export default function OrganizationWrapper({ children, user }: { children: React.ReactNode, user: any }) {
  return (
    <>
      <Wrapper user={user} navItems={navItems}>
        { children }
      </Wrapper>
    </>
  );
}
