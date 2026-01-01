"use client";

import * as React from "react";
import { Info, CreditCard, Globe, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { Reward } from "@/types/reward";

interface ViewRewardProps {
  item: Reward | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const navItems = [
  { name: "General", icon: Info },
  { name: "Details", icon: CreditCard },
  { name: "Countries", icon: Globe },
  { name: "Terms", icon: FileText },
];

// Status badge variant mapping
const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
  suspended: "destructive",
};

export function ViewReward({ item, isOpen, onOpenChange }: ViewRewardProps) {
  const [activeTab, setActiveTab] = React.useState("General");

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("General");
    }
  }, [isOpen]);

  if (!item) return null;

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Name</Label>
                  <div className="text-lg font-medium">
                    {item.name || "—"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Type</Label>
                  <Badge variant={item.type === "gift_card" ? "default" : "secondary"}>
                    {item.type === "gift_card" ? "Gift Card" : item.type || "—"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge variant={statusVariants[item.status || ""] || "secondary"}>
                    {item.status || "—"}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Brand</Label>
                  <div className="text-sm">
                    {item.brand?.name || "—"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Source</Label>
                  <div className="text-sm">
                    {item.source?.name || "—"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {item.image && (
                  <div className="rounded-lg border bg-card p-4">
                    <img
                      src={item.image}
                      alt={item.name || "Reward"}
                      className="w-full h-auto max-h-48 object-contain"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Value</Label>
                  <div className="text-2xl font-bold">
                    {item.value !== undefined
                      ? formatCurrency(item.value, item.currency || "USD")
                      : "—"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Poynts</Label>
                  <Badge variant="outline" className="font-mono">
                    {item.poynts?.toLocaleString() || "—"}
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <div className="rounded-lg border bg-muted/10 p-4 text-sm">
                {item.description || "No description available"}
              </div>
            </div>
          </div>
        );

      case "Details":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">ID</Label>
                  <div className="font-mono text-xs break-all">{item.id}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    External ID
                  </Label>
                  <div className="font-mono text-xs">
                    {item.external_id || "—"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Currency
                  </Label>
                  <div className="text-sm">{item.currency || "—"}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Language
                  </Label>
                  <div className="text-sm">{item.language || "—"}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Inventory
                  </Label>
                  <div className="text-sm">
                    {item.inventory?.type === "unlimited"
                      ? "Unlimited"
                      : item.inventory?.available !== undefined
                      ? `${item.inventory.available} available`
                      : "—"}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Tags</Label>
                  <div className="flex flex-wrap gap-1">
                    {item.tags && item.tags.length > 0 ? (
                      item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Created
                  </Label>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Updated
                  </Label>
                  <div className="text-sm">
                    {formatDistanceToNow(new Date(item.updated_at), {
                      addSuffix: true,
                    })}
                  </div>
                </div>
              </div>
            </div>

            {item.long_description && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Long Description
                  </Label>
                  <div className="rounded-lg border bg-muted/10 p-4 text-sm max-h-48 overflow-y-auto">
                    {item.long_description}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case "Countries":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Available Countries ({item.countries?.length || 0})
              </Label>
              {item.countries && item.countries.length > 0 ? (
                <div className="max-h-96 overflow-y-auto rounded-lg border bg-muted/10 p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {item.countries.map((country) => (
                      <Badge
                        key={country}
                        variant={country === "US" ? "default" : "outline"}
                        className="text-xs justify-center"
                      >
                        {country}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border bg-muted/10 p-4 text-sm text-muted-foreground">
                  No countries specified
                </div>
              )}
            </div>
          </div>
        );

      case "Terms":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Redemption Instructions
              </Label>
              <div className="rounded-lg border bg-muted/10 p-4 text-sm max-h-48 overflow-y-auto">
                {item.redemption_instructions || "No redemption instructions"}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Terms & Conditions
              </Label>
              <div className="rounded-lg border bg-muted/10 p-4 text-sm max-h-64 overflow-y-auto">
                {item.terms || "No terms specified"}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">View Reward</DialogTitle>
        <DialogDescription className="sr-only">
          View details for {item.name}
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navItems.map((navItem, index) => (
                      <SidebarMenuItem
                        key={navItem.name}
                        className={index === 0 ? "mt-[30px]" : ""}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={navItem.name === activeTab}
                          onClick={() => setActiveTab(navItem.name)}
                        >
                          <button className="w-full">
                            <navItem.icon className="h-4 w-4" />
                            <span>{navItem.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[680px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Rewards</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{item.name || item.id}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
