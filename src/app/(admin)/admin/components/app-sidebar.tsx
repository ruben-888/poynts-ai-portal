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
      title: "Rewards Management",
      url: "/admin/legacy",
      icon: Gift,
      isActive: true,
      items: [
        {
          title: "Gift Cards",
          url: "/admin/legacy/giftcards",
        },
        {
          title: "Brands",
          url: "/admin/rewards/brands",
        },
        {
          title: "Tango Catalog",
          url: "/admin/providers/tango/catalog",
        },
        {
          title: "Blackhawk Catalog",
          url: "/admin/providers/blackhawk/catalog",
        },
        {
          title: "Tremendous Catalog",
          url: "/admin/providers/tremendous/catalog",
        },
        {
          title: "Test Giftcard",
          url: "/admin/legacy/giftcards/test",
        },
      ],
    },
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
    // {
    //   title: "Settings",
    //   url: "/admin/settings",
    //   icon: Settings2,
    //   items: [

    //     {
    //       title: "Security",
    //       url: "/admin/settings/security",
    //     },
    //     {
    //       title: "Notifications",
    //       url: "/admin/settings/notifications",
    //     }
    //   ],
    // },
  ],
  draftScreens: [
    {
      title: "Rewards",
      url: "/admin/rewards",
      icon: Archive,
      isActive: false,
      items: [
        {
          title: "Gift Cards",
          url: "/admin/rewards/gift-cards",
        },
     
        {
          title: "Inventory",
          url: "/admin/rewards/inventory",
        },
      ],
    },
    {
      title: "Customers",
      url: "#",
      icon: Users,
    },

    {
      title: "Providers",
      url: "/admin/providers",
      icon: Building2,
      isActive: true,
      items: [
        {
          title: "Overview",
          url: "/admin/providers",
        },
        {
          title: "Manage",
          url: "/admin/providers/status",
        },
        {
          title: "Settings",
          url: "/admin/providers/settings",
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
        <NavMain items={data.draftScreens} title="Draft Screens" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
