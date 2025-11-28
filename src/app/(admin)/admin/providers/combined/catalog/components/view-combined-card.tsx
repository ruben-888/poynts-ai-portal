"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ViewCombinedCardProps {
  product: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ViewCombinedCard({ product, isOpen, onOpenChange }: ViewCombinedCardProps) {
  if (!product) return null;

  const isTango = product.provider === "tango";
  const providerData = product.providerSpecific;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {product.productName}
              <Badge 
                variant={isTango ? "default" : "secondary"}
                className={isTango 
                  ? "bg-orange-100 text-orange-800" 
                  : "bg-blue-100 text-blue-800"
                }
              >
                {isTango ? "Tango" : "Blackhawk"}
              </Badge>
            </DialogTitle>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-8rem)]">
          <div className="space-y-6">
            {/* Product Image */}
            {product.imageUrl && (
              <div className="flex justify-center">
                <img
                  src={product.imageUrl}
                  alt={product.productName}
                  className="max-w-[200px] max-h-[200px] object-contain"
                />
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Brand</p>
                  <p className="text-sm">{product.brandName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Product ID</p>
                  <p className="text-sm font-mono">{product.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Min Value</p>
                  <p className="text-sm font-mono">{formatCurrency(product.minValue)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Max Value</p>
                  <p className="text-sm font-mono">{formatCurrency(product.maxValue)}</p>
                </div>
                {product.rebatePercentage !== undefined && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rebate</p>
                    <Badge variant="outline" className="font-mono">
                      {product.rebatePercentage.toFixed(2)}%
                    </Badge>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  {product.cardExists ? (
                    <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                  ) : (
                    <Badge variant="secondary">Disabled</Badge>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <p className="text-sm mt-1">{product.description}</p>
              </div>
            </div>

            <Separator />

            {/* Provider-Specific Details */}
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Provider Details</TabsTrigger>
                <TabsTrigger value="items">Associated Items</TabsTrigger>
                <TabsTrigger value="terms">Terms & Conditions</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <h3 className="font-semibold">Provider-Specific Information</h3>
                {isTango ? (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Currency</p>
                      <p className="text-sm">{providerData?.minAmount?.currency || "USD"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">E-Gift Format</p>
                      <p className="text-sm">{providerData?.eGiftFormat || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Locale</p>
                      <p className="text-sm">{providerData?.locale || "N/A"}</p>
                    </div>
                    {providerData?.redemptionInfo && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Redemption Info</p>
                        <p className="text-sm">{providerData.redemptionInfo}</p>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="items" className="space-y-4">
                <h3 className="font-semibold">Associated Items ({product.associatedItems?.length || 0})</h3>
                {product.associatedItems && product.associatedItems.length > 0 ? (
                  <div className="space-y-3">
                    {product.associatedItems.map((item: any, index: number) => (
                      <div key={index} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{item.title}</p>
                          <Badge 
                            variant={item.reward_status === "active" ? "default" : "secondary"}
                            className={item.reward_status === "active" 
                              ? "bg-green-100 text-green-800" 
                              : ""
                            }
                          >
                            {item.reward_status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-muted-foreground">Value: </span>
                            <span className="font-mono">{formatCurrency(Number(item.value))}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Points: </span>
                            <span>{item.poynts}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Inventory: </span>
                            <span>{item.inventory_remaining}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Type: </span>
                            <span>{item.value_type}</span>
                          </div>
                        </div>
                        {item.cards && item.cards.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground">
                              {item.cards.length} card configuration(s) available
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No associated items found</p>
                )}
              </TabsContent>

              <TabsContent value="terms" className="space-y-4">
                <h3 className="font-semibold">Terms & Conditions</h3>
                <div className="prose prose-sm max-w-none">
                  {isTango ? (
                    <p className="text-sm whitespace-pre-wrap">{providerData?.terms || "No terms available"}</p>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {providerData?.termsAndConditions?.text || "No terms available"}
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}