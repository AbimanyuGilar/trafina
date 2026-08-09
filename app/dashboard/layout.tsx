import Sidebar from "../../components/sidebar";
import React from "react";
import { requireRoles } from "@/lib/auth-guard";
import { DynamicBreadcrumb } from "@/components/breadcrumb";
import {
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronRight,
  FileUser,
  Store,
  ShelvingUnit,
  ShoppingBag,
  Warehouse
} from "lucide-react";
import DashboardSidebar from "./DashboardSidebar";



export default async function DashboardPage({ children }: { children: React.ReactNode }) {
  const session = await requireRoles(['ADMIN', 'USER',])

  return (
    <>
      <DashboardSidebar user={session.user}>
        <DynamicBreadcrumb />
        { children }
      </DashboardSidebar>
    </>
  );
}