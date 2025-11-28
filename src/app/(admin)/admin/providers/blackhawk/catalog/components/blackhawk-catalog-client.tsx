"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createBlackhawkCatalogColumns } from "./blackhawk-catalog-columns";
import { ViewBlackhawkCard } from "./view-blackhawk-card";

// Types for the BlackHawk API response data
interface AssociatedItem {
  id: number;
  rewardName: string;
  status: string;
  valueType: string;
  minValue?: number;
  maxValue?: number;
  providerRewardId: string;
  createdAt?: string;
  updatedAt?: string;
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

interface BlackhawkApiResponse {
  data: {
    clientProgramId: number;
    currency: string;
    products: BlackhawkProduct[];
  };
}

// Client component for displaying BlackHawk gift card catalog
export default function BlackhawkCatalogClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<BlackhawkProduct | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Define a function to fetch the catalog data
  const fetchCatalog = async () => {
    try {
      const response = await axios.get("/api/legacy/providers/blackhawk");

      // The API returns data in the BlackhawkApiResponse format
      // which has products nested under the data property
      return response.data.data.products.map((product: BlackhawkProduct) => ({
        productName: product.productName,
        parentBrandName: product.parentBrandName,
        productDescription: product.productDescription,
        productImage: product.productImage,
        contentProviderCode: product.contentProviderCode,
        valueRestrictions: product.valueRestrictions,
        eGiftFormat: product.eGiftFormat,
        locale: product.locale,
        logoImage: product.logoImage,
        offFaceDiscountPercent: product.offFaceDiscountPercent,
        redemptionInfo: product.redemptionInfo,
        termsAndConditions: product.termsAndConditions,
        cardExists: product.cardExists,
        associatedItems: product.associatedItems || [],
      }));
    } catch (error) {
      console.error("Error fetching BlackHawk catalog:", error);
      throw new Error("Failed to fetch BlackHawk catalog");
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
    queryKey: ["blackhawk-catalog"],
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
  const handleViewCard = (product: BlackhawkProduct) => {
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
            : "Failed to load BlackHawk catalog data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        columns={createBlackhawkCatalogColumns(handleViewCard)}
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
            id: "parentBrandName",
            displayName: "Brand",
          },
        ]}
        filters={[
          {
            id: "parentBrandName",
            title: "Brand",
            options: Array.from(
              new Set(
                data.map(
                  (item: { parentBrandName: string }) => item.parentBrandName,
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
        enableCSVExport={true}
        csvFilename="blackhawk-catalog"
      />
      
      <ViewBlackhawkCard
        product={selectedProduct}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </>
  );
}
