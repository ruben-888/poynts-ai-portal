"use client";

import * as React from "react";
import {
  Info,
  CreditCard,
  FileText,
  Globe,
  ShoppingBag,
  Plus,
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
import { Button } from "@/components/ui/button";

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

interface TremendousImage {
  src: string;
  type: string;
  content_type: string;
}

interface TremendousSku {
  min: number;
  max: number;
}

interface TremendousCountry {
  abbr: string;
}

interface TremendousDocuments {
  cardholder_agreement_pdf?: string;
  cardholder_agreement_url?: string;
  privacy_policy_url?: string;
}

interface TremendousProduct {
  id: string;
  name: string;
  currency_codes: string[];
  category: string;
  images: TremendousImage[];
  skus: TremendousSku[];
  countries: TremendousCountry[];
  disclosure: string;
  usage_instructions: string;
  description: string;
  documents?: TremendousDocuments;
}

interface ViewTremendousCardProps {
  product: TremendousProduct | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddBrandItem?: (product: TremendousProduct) => void;
  existingItemIds?: string[];
}

const cardSettings = {
  nav: [
    { name: "General", icon: Info },
    { name: "Product Details", icon: CreditCard },
    { name: "Terms & Usage", icon: FileText },
    { name: "Provider Info", icon: ShoppingBag },
  ],
};

export function ViewTremendousCard({
  product,
  isOpen,
  onOpenChange,
  onAddBrandItem,
  existingItemIds = [],
}: ViewTremendousCardProps) {
  const [activeTab, setActiveTab] = React.useState("General");

  React.useEffect(() => {
    // Reset to General tab when dialog opens
    if (isOpen) {
      setActiveTab("General");
    }
  }, [isOpen]);

  if (!product) return null;

  // Get the best image for display
  const getProductImage = () => {
    const cardImage = product.images?.find(img => img.type === "card");
    const logoImage = product.images?.find(img => img.type === "logo");
    return cardImage || logoImage;
  };

  const productImage = getProductImage();

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
                  <div className="text-lg font-medium">{product.name}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Category
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {product.category.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Supported Currencies
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {product.currency_codes.map((currency) => (
                      <Badge key={currency} variant="secondary" className="font-mono text-xs">
                        {currency}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Countries Available
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {product.countries.length} {product.countries.length === 1 ? 'country' : 'countries'}
                    </Badge>
                    {product.countries.some(c => c.abbr === "US") && (
                      <Badge variant="default" className="text-xs">
                        US Supported
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {productImage && (
                  <div className="rounded-lg border bg-card p-4">
                    <img
                      src={productImage.src}
                      alt={product.name}
                      className="w-full h-auto max-h-48 object-contain"
                    />
                    <p className="mt-2 text-sm text-muted-foreground text-center capitalize">
                      {productImage.type} Image
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
                    Product ID
                  </Label>
                  <div className="font-mono text-sm">
                    {product.id}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Category
                  </Label>
                  <div className="text-sm capitalize">
                    {product.category.replace(/_/g, " ")}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Available Images
                  </Label>
                  <div className="flex flex-wrap gap-1">
                    {product.images.map((image, index) => (
                      <Badge key={index} variant="secondary" className="text-xs capitalize">
                        {image.type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {product.images.filter(img => img.type === "logo").map((logoImage, index) => (
                  <div key={index} className="rounded-lg border bg-card p-4">
                    <img
                      src={logoImage.src}
                      alt={`${product.name} logo`}
                      className="w-full h-auto max-h-32 object-contain"
                    />
                    <p className="mt-2 text-sm text-muted-foreground text-center">
                      Logo Image
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-4">Value Restrictions</h3>
              {product.skus.map((sku, index) => (
                <div key={index} className="grid grid-cols-2 gap-6 mb-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Minimum Value
                      </Label>
                      <div className="text-2xl font-bold">
                        {formatCurrency(sku.min)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">
                        Maximum Value
                      </Label>
                      <div className="text-2xl font-bold">
                        {formatCurrency(sku.max)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 mt-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-blue-700">
                      This gift card accepts values between {formatCurrency(product.skus[0]?.min)}{" "}
                      and {formatCurrency(product.skus[0]?.max)}.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Terms & Usage":
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Usage Instructions
                </Label>
                <div className="rounded-lg border bg-muted/10 p-4 max-h-64 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {product.usage_instructions ? (
                      <div dangerouslySetInnerHTML={{ 
                        __html: product.usage_instructions.replace(/\n/g, '<br>') 
                      }} />
                    ) : (
                      <p className="text-muted-foreground">
                        No usage instructions available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Terms & Conditions / Disclosure
                </Label>
                <div className="rounded-lg border bg-muted/10 p-4 max-h-96 overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    {product.disclosure ? (
                      <div dangerouslySetInnerHTML={{ 
                        __html: product.disclosure.replace(/\n/g, '<br>') 
                      }} />
                    ) : (
                      <p className="text-muted-foreground">
                        No terms and conditions available
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {product.documents && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Additional Documents
                    </Label>
                    <div className="space-y-2">
                      {product.documents.cardholder_agreement_url && (
                        <div>
                          <a 
                            href={product.documents.cardholder_agreement_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Cardholder Agreement
                          </a>
                        </div>
                      )}
                      {product.documents.privacy_policy_url && (
                        <div>
                          <a 
                            href={product.documents.privacy_policy_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:text-blue-800 underline"
                          >
                            Privacy Policy
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
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
                <div className="text-lg font-medium">Tremendous</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Product ID
                </Label>
                <div className="font-mono">{product.id}</div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  API Endpoint
                </Label>
                <div className="text-sm font-mono break-all">
                  https://api.tremendous.com/api/v2/products
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Supported Countries ({product.countries.length})
                </Label>
                <div className="max-h-48 overflow-y-auto rounded-lg border bg-muted/10 p-4">
                  <div className="grid grid-cols-6 gap-2">
                    {product.countries.map((country) => (
                      <Badge key={country.abbr} variant="outline" className="text-xs">
                        {country.abbr}
                      </Badge>
                    ))}
                  </div>
                </div>
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
        <DialogTitle className="sr-only">View Tremendous Card</DialogTitle>
        <DialogDescription className="sr-only">
          View details for {product.name}
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
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[680px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Tremendous Catalog</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{product.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              <Button
                onClick={() => onAddBrandItem?.(product)}
                disabled={!product || !onAddBrandItem || existingItemIds.includes(product?.id || "")}
                className="mr-8"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Brand to System
              </Button>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}