"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createTangoCatalogColumns } from "./tango-catalog-columns";
import { ViewTangoCard } from "./view-tango-card";

// Types for the Tango API response data
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
  cards?: Array<{
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
  }>;
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

interface TangoApiResponse {
  products: TangoProduct[];
}

// Client component for displaying Tango gift card catalog
export default function TangoCatalogClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TangoProduct | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Define a function to fetch the catalog data
  const fetchCatalog = async () => {
    try {
      const response = await axios.get("/api/legacy/providers/tango/catalog");

      // The API returns data in the TangoApiResponse format
      return response.data.products.map((product: TangoProduct) => ({
        productId: product.productId,
        brandName: product.brandName,
        description: product.description,
        imageUrl: product.imageUrl,
        minAmount: product.minAmount,
        maxAmount: product.maxAmount,
        terms: product.terms,
        cardExists: product.cardExists,
        associatedItems: product.associatedItems || [],
      }));
    } catch (error) {
      console.error("Error fetching Tango catalog:", error);
      throw new Error("Failed to fetch Tango catalog");
    }
  };

  // Use React Query to manage data fetching
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["tango-catalog"],
    queryFn: fetchCatalog,
  });

  // Function to handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Handle view card action
  const handleViewCard = (product: TangoProduct) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  // Handle double-click on table row
  const handleRowDoubleClick = (row: any) => {
    handleViewCard(row.original);
  };

  // Show error if data fetching failed
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Failed to load Tango catalog data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        columns={createTangoCatalogColumns(handleViewCard)}
        data={data}
        searchColumn={{
          id: "brandName",
          placeholder: "Search by brand name...",
        }}
        searchableColumns={[
          {
            id: "brandName",
            displayName: "Brand Name",
          },
          {
            id: "title",
            displayName: "Title",
          },
        ]}
        filters={[
          {
            id: "brandName",
            title: "Brand",
            options: Array.from(
              new Set(
                data.map(
                  (item: { brandName: string }) => item.brandName,
                ),
              ),
            ).map((value) => ({
              value: value as string,
              label: value as string,
            })),
          },
          {
            id: "cardExists",
            title: "Card Status",
            options: [
              { value: "true", label: "Enabled" },
              { value: "false", label: "Disabled" },
            ],
          },
        ]}
        enableRefresh={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
        onRowDoubleClick={handleRowDoubleClick}
      />
      
      <ViewTangoCard
        product={selectedProduct}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </>
  );
}