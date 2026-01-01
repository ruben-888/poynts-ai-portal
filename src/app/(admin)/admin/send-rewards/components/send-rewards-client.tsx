"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronRight, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecipientsManager } from "./recipients-manager";
import { ProviderSelector } from "./provider-selector";
import Link from "next/link";

interface Catalog {
  id: string;
  name: string;
  description?: string;
}

interface CatalogsResponse {
  data: Catalog[];
}

interface Recipient {
  id: string;
  name: string;
  email: string;
  amount: number;
  currency: string;
  language: string;
}

export default function SendRewardsClient() {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedCatalog, setSelectedCatalog] = useState<string>("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("balance");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch catalogs
  const { data: catalogsData } = useQuery({
    queryKey: ["catalogs"],
    queryFn: async () => {
      const response = await axios.get<CatalogsResponse>("/api/v1/catalogs");
      return response.data;
    },
  });

  const catalogs = catalogsData?.data || [];

  // Calculate totals
  const totalAmount = recipients.reduce((sum, r) => sum + r.amount, 0);
  const isProviderComplete = !!selectedProvider;
  const isCatalogComplete = !!selectedCatalog;
  const isRecipientsComplete = recipients.length > 0;
  const isPaymentComplete = !!selectedPaymentMethod;

  const handleSubmit = async () => {
    if (!isProviderComplete || !isCatalogComplete || !isRecipientsComplete || !isPaymentComplete) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Create order with recipients
      await axios.post("/api/v1/orders", {
        provider_id: selectedProvider,
        catalog_id: selectedCatalog,
        payment_method: selectedPaymentMethod,
        recipients: recipients.map((r) => ({
          name: r.name,
          email: r.email,
          amount: r.amount,
          currency: r.currency,
          language: r.language,
        })),
      });

      // Reset form on success
      setSelectedProvider("");
      setSelectedCatalog("");
      setRecipients([]);
      alert("Order created successfully!");
    } catch (error) {
      console.error("Failed to create order:", error);
      alert("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-full">
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/send-rewards/edit-email"
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Edit email template
        </Link>
      </div>

      <Card className="p-6">
        {/* Step 1: Provider Selection */}
        <div className="flex flex-col py-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isProviderComplete
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              )}
            >
              {isProviderComplete ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <div>
              <div className="font-semibold">Reward Provider</div>
              <div className="text-sm text-muted-foreground">
                Choose your reward fulfillment provider
              </div>
            </div>
          </div>

          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider}
          />
        </div>

        {/* Step 2: Campaign/Catalog */}
        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isCatalogComplete
                  ? "bg-green-500 text-white"
                  : isProviderComplete
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isCatalogComplete ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <div>
              <div className="font-semibold">Catalog</div>
              <div className="text-sm text-muted-foreground">
                Select the catalog for your recipients
              </div>
            </div>
          </div>
          <div className="w-64">
            <Select
              value={selectedCatalog}
              onValueChange={setSelectedCatalog}
              disabled={!isProviderComplete}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a catalog" />
              </SelectTrigger>
              <SelectContent>
                {catalogs.map((catalog) => (
                  <SelectItem key={catalog.id} value={catalog.id}>
                    {catalog.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Step 3: Recipients */}
        <div className="flex items-start justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isRecipientsComplete
                  ? "bg-green-500 text-white"
                  : isCatalogComplete
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isRecipientsComplete ? <Check className="h-5 w-5" /> : "3"}
            </div>
            <div>
              <div className="font-semibold">Recipients</div>
              <div className="text-sm text-muted-foreground">
                Enter reward amounts and delivery information
              </div>
            </div>
          </div>
          {!isCatalogComplete && (
            <div className="text-sm text-muted-foreground italic">
              Select a catalog first
            </div>
          )}
        </div>

        {isCatalogComplete && (
          <div className="py-4 border-b">
            <RecipientsManager
              recipients={recipients}
              onChange={setRecipients}
            />
          </div>
        )}

        {/* Step 4: Payment Method */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isPaymentComplete
                  ? "bg-green-500 text-white"
                  : isRecipientsComplete
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isPaymentComplete ? <Check className="h-5 w-5" /> : "4"}
            </div>
            <div>
              <div className="font-semibold">Payment method</div>
            </div>
          </div>
          <div className="w-64">
            <Select
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              disabled={!isRecipientsComplete}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="balance">
                  Balance (${totalAmount.toFixed(2)} USD)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {recipients.length} recipient{recipients.length !== 1 ? "s" : ""} •
            Total: ${totalAmount.toFixed(2)} USD
          </div>
          <Button
            onClick={handleSubmit}
            disabled={
              !isProviderComplete ||
              !isCatalogComplete ||
              !isRecipientsComplete ||
              !isPaymentComplete ||
              isSubmitting
            }
            className="min-w-32"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Order <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
