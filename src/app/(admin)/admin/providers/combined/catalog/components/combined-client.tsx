"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createCombinedCatalogColumns } from "./combined-catalog-columns";
import { ViewCombinedCard } from "./view-combined-card";

// Types for the Combined API response data
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

interface CombinedProduct {
  id: string;
  provider: "tango" | "blackhawk";
  productName: string;
  brandName: string;
  description: string;
  imageUrl: string;
  minValue: number;
  maxValue: number;
  currency: string;
  cardExists: boolean;
  associatedItems: AssociatedItem[];
  rebatePercentage?: number;
  providerSpecific: any;
}

interface CombinedApiResponse {
  products: CombinedProduct[];
  metadata: {
    total: number;
    tangoCount: number;
    blackhawkCount: number;
    enabledCount: number;
  };
}

// Client component for displaying combined gift card catalog
export default function CombinedCatalogClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<CombinedProduct | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Define a function to fetch the catalog data
  const fetchCatalog = async () => {
    try {
      const response = await axios.get("/api/legacy/providers/combined/catalog");

      // The API returns data in the CombinedApiResponse format
      return response.data.products;
    } catch (error) {
      console.error("Error fetching combined catalog:", error);
      throw new Error("Failed to fetch combined catalog");
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
    queryKey: ["combined-catalog"],
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
  const handleViewCard = (product: CombinedProduct) => {
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
            : "Failed to load combined catalog data"}
        </AlertDescription>
      </Alert>
    );
  }

  // Get unique brands and providers for filtering
  const uniqueBrands = Array.from(
    new Set(data.map((item: CombinedProduct) => item.brandName))
  ).sort();

  const providerOptions = [
    { value: "tango", label: "Tango" },
    { value: "blackhawk", label: "Blackhawk" },
  ];

  return (
    <>
      <DataTable
        columns={createCombinedCatalogColumns(handleViewCard)}
        data={data}
        searchColumn={{
          id: "productName",
          placeholder: "Search by product name...",
        }}
        searchableColumns={[
          {
            id: "productName",
            displayName: "Product Name",
          },
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
            id: "provider",
            title: "Provider",
            options: providerOptions,
          },
          {
            id: "brandName",
            title: "Brand",
            options: uniqueBrands.map((brand) => ({
              value: brand,
              label: brand,
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
        enableCSVExport={true}
        csvFilename="combined-catalog"
      />
      
      <ViewCombinedCard
        product={selectedProduct}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </>
  );
}