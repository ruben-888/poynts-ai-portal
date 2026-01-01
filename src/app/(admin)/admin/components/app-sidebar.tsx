"use client";

import * as React from "react";
import {
  LayoutDashboard,
  ShoppingCart,
  Gift,
  Building2,
  Command,
  AudioWaveform,
  GalleryVerticalEnd,
  Users,
  LineChart,
  Activity,
  History,
  ArrowLeft,
  Archive,
  Send,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: AudioWaveform,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: false,
      items: [
        {
          title: "Overview",
          url: "/admin/dashboard",
        }
      ],
    },
    {
      title: "Organizations",
      url: "/admin/organizations",
      icon: Users,
      isActive: true,
      items: [
        {
          title: "Browse",
          url: "/admin/organizations",
        },
      ],
    },
    {
      title: "Send Rewards",
      url: "/admin/send-rewards",
      icon: Send,
      isActive: true,
      items: [
        {
          title: "New Order",
          url: "/admin/send-rewards",
        },
        {
          title: "Edit Email Template",
          url: "/admin/send-rewards/edit-email",
        },
      ],
    },
    {
      title: "Rewards & Catalog",
      url: "/admin/rewards",
      icon: Gift,
      isActive: true,
      items: [
        {
          title: "Gift Cards",
          url: "/admin/rewards",
        },
        {
          title: "Offers",
          url: "/admin/rewards/offers",
        },
        {
          title: "Brands",
          url: "/admin/rewards/brands",
        },
      ],
    },
    {
      title: "Source Providers",
      url: "/admin/providers",
      icon: Building2,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/admin/providers",
        },
        {
          title: "Source Items",
          url: "/admin/rewards/source-items",
        },
        {
          title: "Catalogs",
          url: "/admin/providers/catalogs",
          items: [
            {
              title: "Tango",
              url: "/admin/providers/tango/catalog",
            },
            {
              title: "Blackhawk",
              url: "/admin/providers/blackhawk/catalog",
            },
            {
              title: "Tremendous",
              url: "/admin/providers/tremendous/catalog",
            },
          ],
        },
        {
          title: "Settings",
          url: "/admin/providers/settings",
        },
      ],
    },
    {
      title: "Financial",
      url: "/admin/financial",
      icon: LineChart,
      items: [
        {
          title: "Overview",
          url: "/admin/financial",
        },
        {
          title: "Ledgers",
          url: "/admin/legacy/financial/ledgers",
        },
        {
          title: "Journal Entries",
          url: "/admin/legacy/financial/journal-entries",
        },
        {
          title: "Client Banks",
          url: "/admin/legacy/financial/client-banks",
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="px-4 py-2">
          <div className="grid text-left text-sm leading-tight">
            <span className="truncate text-lg font-semibold">Poynts AI Portal</span>
            <span className="truncate text-sm text-muted-foreground">
              Rewards Management
            </span>
          </div>
        </div>
        <div className="border-t">
          <a
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="truncate">Return to Customer View</span>
          </a>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} title="Platform" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
