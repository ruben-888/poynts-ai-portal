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
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { ManageBlackhawkCards } from "./manage-blackhawk-cards";
import { EditBlackhawkCard } from "./edit-blackhawk-card";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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

interface BlackhawkProduct {
  contentProviderCode: string;
  eGiftFormat: string;
  locale: string;
  logoImage: string;
  offFaceDiscountPercent: number;
  parentBrandName: string;
  productDescription: string;
  productImage: string;
  productName: string;
  redemptionInfo: string;
  termsAndConditions: {
    text: string;
    type: string;
  };
  valueRestrictions: {
    maximum: number;
    minimum: number;
  };
  cardExists?: boolean;
  associatedItems?: AssociatedItem[];
}

interface ViewBlackhawkCardProps {
  product: BlackhawkProduct | null;
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

export function ViewBlackhawkCard({
  product,
  isOpen,
  onOpenChange,
}: ViewBlackhawkCardProps) {
  const [activeTab, setActiveTab] = React.useState("General");
  const [editingCardId, setEditingCardId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Reset to General tab when dialog opens
    if (isOpen) {
      setActiveTab("General");
      setEditingCardId(null); // Reset editing state
    }
  }, [isOpen]);

  // Get the card being edited
  const editingCard = React.useMemo(() => {
    if (!editingCardId || !product?.associatedItems?.[0]?.cards) return null;
    return product.associatedItems[0].cards.find(card => card.giftcard_id === editingCardId) || null;
  }, [editingCardId, product?.associatedItems]);

  const handleEditCard = (cardId: string) => {
    setEditingCardId(cardId);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
  };

  const handleSaveCard = (cardId: string, formData: any) => {
    console.log("Saving card:", cardId, formData);
    // In real implementation, this would make an API call
    setEditingCardId(null);
  };

  const handleDeleteCard = (cardId: string) => {
    console.log("Deleting card:", cardId);
    // In real implementation, this would make an API call
    setEditingCardId(null);
  };

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
                    Product Name
                  </Label>
                  <div className="text-lg font-medium">{product.productName}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Brand Name
                  </Label>
                  <div className="text-lg font-medium">
                    {product.parentBrandName}
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
                    Rebate Percentage
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {Math.abs(product.offFaceDiscountPercent).toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {product.productImage && (
                  <div className="rounded-lg border bg-card p-4">
                    <img
                      src={product.productImage}
                      alt={product.productName}
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
                Product Description
              </Label>
              <div className="rounded-lg border bg-muted/10 p-4 text-sm">
                {product.productDescription || "No description available"}
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
                    Content Provider Code
                  </Label>
                  <div className="font-mono text-sm">
                    {product.contentProviderCode}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    E-Gift Format
                  </Label>
                  <div className="text-sm">{product.eGiftFormat}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Locale
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {product.locale || "en-US"}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Logo Image URL
                  </Label>
                  <div className="text-sm font-mono break-all">
                    {product.logoImage || "Not available"}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {product.logoImage && (
                  <div className="rounded-lg border bg-card p-4">
                    <img
                      src={product.logoImage}
                      alt={`${product.productName} logo`}
                      className="w-full h-auto max-h-32 object-contain"
                    />
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      Logo Image
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
                      {formatCurrency(product.valueRestrictions?.minimum)}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Maximum Value
                    </Label>
                    <div className="text-2xl font-bold">
                      {formatCurrency(product.valueRestrictions?.maximum)}
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
                      This gift card accepts values between {formatCurrency(product.valueRestrictions?.minimum)}{" "}
                      and {formatCurrency(product.valueRestrictions?.maximum)}.
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
              <div className="flex items-center justify-between">
                <Label className="text-sm text-muted-foreground">
                  Terms Type
                </Label>
                <Badge variant="outline">
                  {product.termsAndConditions?.type || "Standard"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Terms & Conditions Text
              </Label>
              <div className="rounded-lg border bg-muted/10 p-4 max-h-96 overflow-y-auto">
                <div className="prose prose-sm max-w-none">
                  {product.termsAndConditions?.text ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: product.termsAndConditions.text 
                    }} />
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
                <div className="text-lg font-medium">Blackhawk Network</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Content Provider Code
                </Label>
                <div className="font-mono">{product.contentProviderCode}</div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Redemption Information
                </Label>
                <div className="rounded-lg border bg-muted/10 p-4 max-h-64 overflow-y-auto">
                  {product.redemptionInfo ? (
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: product.redemptionInfo 
                      }} 
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No redemption information available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case "Associated Items":
        // Get the first associated item for the header
        const firstItem = product.associatedItems?.[0];
        const allCards = firstItem?.cards || [];
        
        // If editing a card, show the edit form
        if (editingCardId && editingCard) {
          return (
            <EditBlackhawkCard
              card={editingCard}
              onCancel={handleCancelEdit}
              onSave={handleSaveCard}
              onDelete={handleDeleteCard}
              canEdit={true}
              canDelete={true}
            />
          );
        }
        
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Associated Items</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Gift card items connected to this Blackhawk product
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

                {/* Gift Cards Management */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-base font-medium mb-1">Gift Cards</h4>
                    <p className="text-sm text-muted-foreground">
                      Individual gift cards for this item ({allCards.length} total)
                    </p>
                  </div>
                  
                  {allCards.length > 0 ? (
                    <ManageBlackhawkCards
                      cards={allCards}
                      onEditCard={handleEditCard}
                      canEditCards={true}
                      canSuspendCards={true}
                      canActivateCards={true}
                    />
                  ) : (
                    <div className="text-center py-8 rounded-lg border border-dashed">
                      <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No gift cards available
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This item has no individual gift cards configured.
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <List className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  No associated items
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  This Blackhawk product has no connected gift card items.
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
        <DialogTitle className="sr-only">View Blackhawk Card</DialogTitle>
        <DialogDescription className="sr-only">
          View details for {product.productName}
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
                    <BreadcrumbLink href="#">Blackhawk Catalog</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{product.productName}</BreadcrumbPage>
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