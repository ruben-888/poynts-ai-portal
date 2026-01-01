"use client";

import * as React from "react";
import { Info, CreditCard, Globe, Plus, Check } from "lucide-react";

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
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import type { CatalogItem } from "@/types/reward-catalog";

interface ViewCatalogItemProps {
  item: CatalogItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddBrandItem?: (item: CatalogItem) => void;
}

const navItems = [
  { name: "General", icon: Info },
  { name: "Details", icon: CreditCard },
  { name: "Countries", icon: Globe },
];

export function ViewCatalogItem({
  item,
  isOpen,
  onOpenChange,
  onAddBrandItem,
}: ViewCatalogItemProps) {
  const [activeTab, setActiveTab] = React.useState("General");

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab("General");
    }
  }, [isOpen]);

  if (!item) return null;

  const isSynced = item.sourceItem !== null && item.sourceItem !== undefined;

  const renderContent = () => {
    switch (activeTab) {
      case "General":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Brand Name
                  </Label>
                  <div className="text-lg font-medium">{item.brandName}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Product Name
                  </Label>
                  <div className="text-sm">{item.productName}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Currency
                  </Label>
                  <Badge variant="secondary" className="font-mono">
                    {item.currency}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Face Value
                  </Label>
                  <div className="text-2xl font-bold">
                    {formatCurrency(item.faceValue, item.currency)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge
                    variant={item.status === "active" ? "default" : "secondary"}
                  >
                    {item.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {item.imageUrl && (
                  <div className="rounded-lg border bg-card p-4">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-auto max-h-48 object-contain"
                    />
                  </div>
                )}
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
                  <Label className="text-sm text-muted-foreground">
                    Source Identifier
                  </Label>
                  <div className="font-mono text-sm">{item.sourceIdentifier}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Brand Name
                  </Label>
                  <div className="text-sm">{item.brandName}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Product Name
                  </Label>
                  <div className="text-sm">{item.productName}</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Currency
                  </Label>
                  <div className="text-sm">{item.currency}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Face Value
                  </Label>
                  <div className="text-sm">
                    {formatCurrency(item.faceValue, item.currency)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <div className="text-sm capitalize">{item.status}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Countries":
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Available Countries ({item.countries.length})
              </Label>
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
            </div>

            {item.countries.includes("US") && (
              <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-green-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      This item is available in the United States.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">View Catalog Item</DialogTitle>
        <DialogDescription className="sr-only">
          View details for {item.productName}
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
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Catalog</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{item.brandName}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              {isSynced ? (
                <Button
                  variant="secondary"
                  disabled
                  className="mr-8"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Already Synced
                </Button>
              ) : (
                <Button
                  onClick={() => onAddBrandItem?.(item)}
                  disabled={!item || !onAddBrandItem}
                  className="mr-8"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Sync to Source Items
                </Button>
              )}
            </header>
            <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
