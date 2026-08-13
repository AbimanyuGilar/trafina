'use client'

import Wrapper from "../../components/wrapper";
import React from "react";
import {
  Building2,
  Banknote,
  SquareChartGantt,
  HelpCircle,
} from "lucide-react";

// 1. Map string nama icon ke Komponen Lucide Icon
const iconMap: Record<string, React.ElementType> = {
  Building2: Building2,
  Banknote: Banknote,
  SquareChartGantt: SquareChartGantt,
};

export default function DashboardWrapperClient({ 
  navItems,
  user,
  organization,
  children,
}: { 
  navItems: any[], 
  user: any,
  organization: any,
  children: React.ReactNode
}) {
  const mappedNavItems = navItems.map((item) => {
    const IconComponent = typeof item.icon === 'string' 
      ? (iconMap[item.icon] || HelpCircle) 
      : item.icon;

    return {
      ...item,
      icon: IconComponent,
    };
  });

  return (
    <Wrapper user={user} navItems={mappedNavItems} organization={organization}>
      {children}
    </Wrapper>
  );
}