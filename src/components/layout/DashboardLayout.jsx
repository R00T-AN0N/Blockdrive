"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/blocks/sidebar";
import { AppSidebar } from "@/components/blocks/whatsapp-sidebar";
import { Header } from "@/components/blocks/Header"; // updated import

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="min-h-screen bg-white pt-14 p-4 transition-all duration-300">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
