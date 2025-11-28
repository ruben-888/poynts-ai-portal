"use client";

import * as React from "react";
import { Info, Tag, Database } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

interface CatalogItem {
  utid: string;
  rewardName: string;
  currencyCode: string;
  valueType: string;
  minValue: number;
  maxValue: number;
  countries: string[];
  fulfillmentType: string;
}

interface CatalogEntry {
  brandKey: string;
  brandName: string;
  status: string;
  items: CatalogItem[];
  description?: string;
  shortDescription?: string;
  terms?: string;
  disclaimer?: string;
}

interface ViewRewardDetailsProps {
  reward: CatalogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const detailSections = [
  { name: "Details", icon: Database },
  { name: "Description", icon: Info },
  { name: "Terms & Legal", icon: Tag },
];

export function ViewRewardDetails({
  reward,
  open,
  onOpenChange,
}: ViewRewardDetailsProps) {
  const [activeSection, setActiveSection] = React.useState("Details");

  const renderContent = () => {
    if (!reward) return null;

    switch (activeSection) {
      case "Details":
        const item = reward.items[0];
        if (!item) return <div>No reward details available.</div>;

        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Brand Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Brand Key
                    </dt>
                    <dd className="text-sm mt-1">{reward.brandKey}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Brand Name
                    </dt>
                    <dd className="text-sm mt-1">{reward.brandName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Status
                    </dt>
                    <dd className="text-sm mt-1">
                      <Badge
                        variant={
                          reward.status === "active" ? "default" : "secondary"
                        }
                      >
                        {reward.status}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Reward Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      UTID
                    </dt>
                    <dd className="text-sm mt-1 font-mono">{item.utid}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Reward Name
                    </dt>
                    <dd className="text-sm mt-1">{item.rewardName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Value Type
                    </dt>
                    <dd className="text-sm mt-1">
                      <Badge variant="outline">
                        {item.valueType === "VARIABLE_VALUE"
                          ? "Variable"
                          : "Fixed"}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Value Range</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Currency
                    </dt>
                    <dd className="text-sm mt-1">{item.currencyCode}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Minimum Value
                    </dt>
                    <dd className="text-sm mt-1">
                      {item.currencyCode} {item.minValue}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Maximum Value
                    </dt>
                    <dd className="text-sm mt-1">
                      {item.currencyCode} {item.maxValue}
                    </dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Availability</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Countries
                    </dt>
                    <dd className="text-sm mt-1">
                      {item.countries.map((country) => (
                        <Badge key={country} variant="outline" className="mr-1">
                          {country}
                        </Badge>
                      ))}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Fulfillment Type
                    </dt>
                    <dd className="text-sm mt-1">
                      <Badge variant="outline">{item.fulfillmentType}</Badge>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        );
      case "Description":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Description</h3>
              <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {reward.description || "No description available."}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Short Description</h3>
              <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {reward.shortDescription || "No short description available."}
              </div>
            </div>
          </div>
        );
      case "Terms & Legal":
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Terms & Conditions</h3>
              <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {reward.terms || "No terms available."}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium">Disclaimer</h3>
              <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                {reward.disclaimer || "No disclaimer available."}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px]">
        <DialogTitle className="sr-only">Reward Details</DialogTitle>
        <DialogDescription className="sr-only">
          View detailed information about this reward.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {detailSections.map((section) => (
                      <SidebarMenuItem key={section.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={section.name === activeSection}
                          onClick={() => setActiveSection(section.name)}
                        >
                          <button className="w-full">
                            <section.icon className="h-4 w-4" />
                            <span>{section.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[600px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center border-b px-6">
              <h2 className="text-lg font-semibold">
                {reward?.brandName || "Reward Details"}
              </h2>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
