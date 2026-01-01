"use client";

import * as React from "react";
import { Info, Database, Link2, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";

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
import type { RewardSourceItem } from "@/types/reward-source-item";

interface ViewSourceItemProps {
  item: RewardSourceItem | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const navItems = [
  { name: "General", icon: Info },
  { name: "Values", icon: DollarSign },
  { name: "Reward", icon: Link2 },
  { name: "Raw Data", icon: Database },
];

// Types for provider-specific raw data structures
interface TremendousSku {
  min: number;
  max: number;
  currency_code: string;
}

interface ValueRangeInfo {
  type: "variable" | "fixed" | "unknown";
  currency?: string;
  minValue?: number;
  maxValue?: number;
  fixedValues?: number[];
}

// Extract value range information from raw_data based on provider
function extractValueRange(
  rawData: Record<string, unknown> | undefined,
  sourceFk: string
): ValueRangeInfo {
  if (!rawData) {
    return { type: "unknown" };
  }

  // Tremendous: uses skus array with {min, max, currency_code}
  if (sourceFk.includes("tremendous")) {
    const skus = rawData.skus as TremendousSku[] | undefined;
    if (skus && skus.length > 0) {
      const sku = skus[0]; // Take first SKU (usually USD)
      return {
        type: "variable",
        currency: sku.currency_code,
        minValue: sku.min,
        maxValue: sku.max,
      };
    }
  }

  // Tango: uses valueType, faceValue, minValue, maxValue
  if (sourceFk.includes("tango")) {
    const valueType = rawData.valueType as string | undefined;
    const currency = rawData.currencyCode as string | undefined;

    if (valueType === "FIXED_VALUE") {
      const faceValue = rawData.faceValue as number | undefined;
      return {
        type: "fixed",
        currency,
        fixedValues: faceValue ? [faceValue] : undefined,
      };
    } else if (valueType === "VARIABLE_VALUE") {
      return {
        type: "variable",
        currency,
        minValue: rawData.minValue as number | undefined,
        maxValue: rawData.maxValue as number | undefined,
      };
    }
  }

  // Blackhawk: uses minAmount, maxAmount, fixedDenominations
  if (sourceFk.includes("blackhawk")) {
    const currency = rawData.currencyCode as string | undefined;
    const fixedDenominations = rawData.fixedDenominations as number[] | undefined;
    const minAmount = rawData.minAmount as number | undefined;
    const maxAmount = rawData.maxAmount as number | undefined;

    if (fixedDenominations && fixedDenominations.length > 0) {
      return {
        type: "fixed",
        currency,
        fixedValues: fixedDenominations,
      };
    } else if (minAmount !== undefined || maxAmount !== undefined) {
      return {
        type: "variable",
        currency,
        minValue: minAmount,
        maxValue: maxAmount,
      };
    }
  }

  return { type: "unknown" };
}

// Status badge variant mapping
const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
  suspended: "destructive",
};

export function ViewSourceItem({
  item,
  isOpen,
  onOpenChange,
}: ViewSourceItemProps) {
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
                  <Label className="text-sm text-muted-foreground">
                    Source
                  </Label>
                  <div className="text-lg font-medium">
                    {item.source?.name || item.source_fk}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Source Identifier
                  </Label>
                  <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                    {item.source_identifier}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Priority
                  </Label>
                  <Badge variant="secondary" className="font-mono">
                    {item.priority}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">Status</Label>
                  <Badge variant={statusVariants[item.status] || "secondary"}>
                    {item.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">ID</Label>
                  <div className="font-mono text-xs text-muted-foreground break-all">
                    {item.id}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Last Synced
                  </Label>
                  <div className="text-sm">
                    {item.last_synced_at
                      ? formatDistanceToNow(new Date(item.last_synced_at), {
                          addSuffix: true,
                        })
                      : "Never"}
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
          </div>
        );

      case "Values":
        const valueRange = extractValueRange(item.raw_data, item.source_fk);
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Value Type
                </Label>
                <Badge
                  variant={
                    valueRange.type === "variable"
                      ? "default"
                      : valueRange.type === "fixed"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {valueRange.type}
                </Badge>
              </div>

              {valueRange.currency && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Currency
                  </Label>
                  <Badge variant="outline" className="font-mono">
                    {valueRange.currency}
                  </Badge>
                </div>
              )}

              {valueRange.type === "variable" && (
                <div className="rounded-lg border bg-card p-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Minimum Value
                      </Label>
                      <div className="text-2xl font-bold text-green-600">
                        {valueRange.minValue !== undefined
                          ? formatCurrency(
                              valueRange.minValue,
                              valueRange.currency || "USD"
                            )
                          : "—"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Maximum Value
                      </Label>
                      <div className="text-2xl font-bold text-blue-600">
                        {valueRange.maxValue !== undefined
                          ? formatCurrency(
                              valueRange.maxValue,
                              valueRange.currency || "USD"
                            )
                          : "—"}
                      </div>
                    </div>
                  </div>
                  {valueRange.minValue !== undefined &&
                    valueRange.maxValue !== undefined && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          This reward can be fulfilled with any value between{" "}
                          <span className="font-medium text-foreground">
                            {formatCurrency(
                              valueRange.minValue,
                              valueRange.currency || "USD"
                            )}
                          </span>{" "}
                          and{" "}
                          <span className="font-medium text-foreground">
                            {formatCurrency(
                              valueRange.maxValue,
                              valueRange.currency || "USD"
                            )}
                          </span>
                          .
                        </p>
                      </div>
                    )}
                </div>
              )}

              {valueRange.type === "fixed" && valueRange.fixedValues && (
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Available Denominations ({valueRange.fixedValues.length})
                  </Label>
                  <div className="rounded-lg border bg-muted/10 p-4">
                    <div className="flex flex-wrap gap-2">
                      {valueRange.fixedValues.map((value, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="font-mono text-sm px-3 py-1"
                        >
                          {formatCurrency(value, valueRange.currency || "USD")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {valueRange.type === "unknown" && (
                <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
                  <p className="text-sm text-yellow-700">
                    Value range information is not available for this source
                    item. Check the Raw Data tab for provider-specific details.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case "Reward":
        return (
          <div className="space-y-6">
            {item.reward_fk ? (
              <div className="space-y-4">
                <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                  <p className="text-sm text-green-700">
                    This source item is linked to a reward.
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Reward ID
                      </Label>
                      <div className="font-mono text-xs break-all">
                        {item.reward_fk}
                      </div>
                    </div>

                    {item.reward && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            Reward Name
                          </Label>
                          <div className="text-sm font-medium">
                            {item.reward.name || "—"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">
                            Reward Status
                          </Label>
                          <Badge
                            variant={
                              item.reward.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {item.reward.status || "—"}
                          </Badge>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
                <p className="text-sm text-yellow-700">
                  This source item is not linked to any reward yet.
                </p>
              </div>
            )}
          </div>
        );

      case "Raw Data":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Provider Raw Data
              </Label>
              <div className="max-h-[500px] overflow-auto rounded-lg border bg-muted/30 p-4">
                <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                  {item.raw_data
                    ? JSON.stringify(item.raw_data, null, 2)
                    : "No raw data available"}
                </pre>
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
        <DialogTitle className="sr-only">View Source Item</DialogTitle>
        <DialogDescription className="sr-only">
          View details for source item {item.source_identifier}
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
                    <BreadcrumbLink href="#">Source Items</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{item.source_identifier}</BreadcrumbPage>
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
