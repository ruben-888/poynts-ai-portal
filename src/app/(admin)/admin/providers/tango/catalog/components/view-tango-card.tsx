"use client";

import * as React from "react";
import {
  Info,
  CreditCard,
  FileText,
  DollarSign,
  Globe,
  ShoppingBag,
  List,
} from "lucide-react";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Utility function to format currency without unnecessary decimals
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return "N/A";
  
  // If the amount is a whole number, don't show decimals
  if (amount % 1 === 0) {
    return `$${amount}`;
  }
  
  // Otherwise, show with 2 decimal places
  return `$${amount.toFixed(2)}`;
};

interface GiftCard {
  giftcard_id: string;
  reward_name: string;
  brand_name: string;
  cpidx: string;
  value: number;
  reward_status: string;
  rebate_provider_percentage?: number;
  rebate_base_percentage?: number;
  rebate_customer_percentage?: number;
  rebate_cp_percentage?: number;
}

interface AssociatedItem {
  redemption_id: string;
  cpid: string | null;
  cpidx: string | null;
  type: "giftcard";
  value: string;
  poynts: string;
  title: string;
  name: string | null;
  inventory_remaining: string;
  reward_status: "active" | "suspended" | "deleted";
  reward_availability: string;
  language: string;
  utid: string;
  value_type: string;
  tags?: string;
  priority: number;
  reward_image?: string;
  source_letter: string;
  item_id: number;
  brand_id: number;
  cards?: GiftCard[];
}

interface TangoProduct {
  productId: string;
  brandName: string;
  description: string;
  imageUrl: string;
  minAmount: {
    amount: number;
    currency: string;
  };
  maxAmount: {
    amount: number;
    currency: string;
  };
  terms: string;
  cardExists?: boolean;
  associatedItems?: AssociatedItem[];
}

interface ViewTangoCardProps {
  product: TangoProduct | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const cardSettings = {
  nav: [
    { name: "General", icon: Info },
    { name: "Product Details", icon: CreditCard },
    { name: "Terms & Conditions", icon: FileText },
    { name: "Provider Info", icon: ShoppingBag },
  ],
  separatedNav: [
    { name: "Associated Items", icon: List },
  ],
};

export function ViewTangoCard({
  product,
  isOpen,
  onOpenChange,
}: ViewTangoCardProps) {
  const [activeTab, setActiveTab] = React.useState("General");

  React.useEffect(() => {
    // Reset to General tab when dialog opens
    if (isOpen) {
      setActiveTab("General");
    }
  }, [isOpen]);

  if (!product) return null;

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
                  <div className="text-lg font-medium">{product.brandName}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Product ID
                  </Label>
                  <div className="font-mono text-sm">
                    {product.productId}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Card Status
                  </Label>
                  <div className="flex items-center gap-2">
                    {product.cardExists ? (
                      <Badge
                        variant="default"
                        className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
                      >
                        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                        Disabled
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Currency
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {product.minAmount.currency}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {product.imageUrl && (
                  <div className="rounded-lg border bg-card p-4">
                    <img
                      src={product.imageUrl}
                      alt={product.brandName}
                      className="w-full h-auto max-h-48 object-contain"
                    />
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      Product Image
                    </p>
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
                {product.description || "No description available"}
              </div>
            </div>
          </div>
        );

      case "Product Details":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Product ID (UTID)
                  </Label>
                  <div className="font-mono text-sm">
                    {product.productId}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Brand Name
                  </Label>
                  <div className="text-sm">{product.brandName}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Currency
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {product.minAmount.currency}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Image URL
                  </Label>
                  <div className="text-sm font-mono break-all">
                    {product.imageUrl || "Not available"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {product.imageUrl && (
                  <div className="rounded-lg border bg-card p-4">
                    <img
                      src={product.imageUrl}
                      alt={`${product.brandName} image`}
                      className="w-full h-auto max-h-32 object-contain"
                    />
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      Brand Image
                    </p>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Value Restrictions</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Minimum Value
                    </Label>
                    <div className="text-2xl font-bold">
                      {formatCurrency(product.minAmount.amount)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Maximum Value
                    </Label>
                    <div className="text-2xl font-bold">
                      {formatCurrency(product.maxAmount.amount)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This gift card accepts values between {formatCurrency(product.minAmount.amount)}{" "}
                      and {formatCurrency(product.maxAmount.amount)}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Terms & Conditions":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Terms & Conditions
              </Label>
              <div className="rounded-lg border bg-muted/10 p-4 max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {product.terms ? (
                    <div className="whitespace-pre-wrap text-sm">
                      {product.terms}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No terms and conditions available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "Provider Info":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Provider
                </Label>
                <div className="text-lg font-medium">Tango Card</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Product ID (UTID)
                </Label>
                <div className="font-mono">{product.productId}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Currency Support
                </Label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {product.minAmount.currency}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  API Endpoint
                </Label>
                <div className="rounded-lg border bg-muted/10 p-4">
                  <code className="text-sm">
                    https://api.tangocard.com/raas/v2/catalogs
                  </code>
                </div>
              </div>
            </div>
          </div>
        );

      case "Associated Items":
        // Get the first associated item for the header
        const firstItem = product.associatedItems?.[0];
        const allCards = firstItem?.cards || [];
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Associated Items</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Gift card items connected to this Tango product
                </p>
              </div>
              <Badge variant="outline">
                {product.associatedItems?.length || 0} {(product.associatedItems?.length || 0) === 1 ? 'item' : 'items'}
              </Badge>
            </div>

            {firstItem ? (
              <>
                {/* Header Card with Item Information */}
                <Card className="border-2 border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{firstItem.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            firstItem.reward_status === "active" 
                              ? "default" 
                              : firstItem.reward_status === "suspended"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            firstItem.reward_status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : ""
                          }
                        >
                          {firstItem.reward_status}
                        </Badge>
                        <Badge variant="outline">
                          {firstItem.value_type === "FIXED_VALUE" ? "Fixed Value" : "Variable Value"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">Brand</Label>
                        <div className="text-sm font-medium">{firstItem.name || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Value</Label>
                        <div className="text-sm font-medium">{formatCurrency(Number(firstItem.value))}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Points</Label>
                        <div className="text-sm font-medium">{firstItem.poynts}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Inventory</Label>
                        <div className="text-sm font-medium">{firstItem.inventory_remaining}</div>
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">CPID</Label>
                        <div className="text-sm font-mono">{firstItem.cpid || "N/A"}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Provider Code (UTID)</Label>
                        <div className="text-sm font-mono">{firstItem.utid}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Language</Label>
                        <div className="text-sm">{firstItem.language.toUpperCase()}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Gift Cards Table */}
                {allCards.length > 0 && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-base font-medium mb-1">Gift Cards</h4>
                      <p className="text-sm text-muted-foreground">
                        Individual gift cards for this item ({allCards.length} total)
                      </p>
                    </div>
                    
                    <div className="rounded-lg border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Card ID</TableHead>
                            <TableHead>Reward Name</TableHead>
                            <TableHead>Brand</TableHead>
                            <TableHead>Value</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>CPID</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allCards.map((card) => (
                            <TableRow key={card.giftcard_id}>
                              <TableCell className="font-mono text-xs">
                                {card.giftcard_id}
                              </TableCell>
                              <TableCell>{card.reward_name}</TableCell>
                              <TableCell>{card.brand_name}</TableCell>
                              <TableCell className="font-mono">
                                {formatCurrency(card.value)}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    card.reward_status === "active" 
                                      ? "default" 
                                      : card.reward_status === "suspended"
                                        ? "secondary"
                                        : "destructive"
                                  }
                                  className={
                                    card.reward_status === "active"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : ""
                                  }
                                >
                                  {card.reward_status}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs">
                                {card.cpidx}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <List className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No associated items
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This Tango product has no connected gift card items.
                </p>
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
        <DialogTitle className="sr-only">View Tango Card</DialogTitle>
        <DialogDescription className="sr-only">
          View details for {product.brandName}
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {cardSettings.nav.map((item, index) => (
                      <SidebarMenuItem
                        key={item.name}
                        className={index === 0 ? "mt-[30px]" : ""}
                      >
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === activeTab}
                          onClick={() => setActiveTab(item.name)}
                        >
                          <button className="w-full">
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              
              <div className="px-3 py-2">
                <Separator />
              </div>
              
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {cardSettings.separatedNav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === activeTab}
                          onClick={() => setActiveTab(item.name)}
                        >
                          <button className="w-full">
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
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
                    <BreadcrumbLink href="#">Tango Catalog</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{product.brandName}</BreadcrumbPage>
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