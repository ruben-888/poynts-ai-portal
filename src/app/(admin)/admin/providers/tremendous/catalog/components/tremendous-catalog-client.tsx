"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createTremendousCatalogColumns } from "./tremendous-catalog-columns";
import { ViewTremendousCard } from "./view-tremendous-card";

// Types for the Tremendous API response data
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

interface TremendousApiResponse {
  products: TremendousProduct[];
}

// Client component for displaying Tremendous gift card catalog
export default function TremendousCatalogClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<TremendousProduct | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch existing gift card items to check if they're already in the database
  const { data: existingItems = [] } = useQuery({
    queryKey: ["existing-tremendous-items"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/legacy/giftcard-items");
        // Filter for provider 5 (Tremendous) items
        return response.data.data
          .filter((item: any) => item.provider?.id === 5)
          .map((item: any) => item.providerRewardId); // utid field
      } catch (error) {
        console.error("Error fetching existing items:", error);
        return [];
      }
    },
  });

  // Define a function to fetch the catalog data
  const fetchCatalog = async () => {
    try {
      const response = await axios.get("/api/legacy/providers/tremendous/catalog");

      // The API returns data in the TremendousApiResponse format
      return response.data.products.map((product: TremendousProduct) => ({
        id: product.id,
        name: product.name,
        currency_codes: product.currency_codes,
        category: product.category,
        images: product.images,
        skus: product.skus,
        countries: product.countries,
        disclosure: product.disclosure,
        usage_instructions: product.usage_instructions,
        description: product.description,
        documents: product.documents,
      }));
    } catch (error) {
      console.error("Error fetching Tremendous catalog:", error);
      throw new Error("Failed to fetch Tremendous catalog");
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
    queryKey: ["tremendous-catalog"],
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
  const handleViewCard = (product: TremendousProduct) => {
    setSelectedProduct(product);
    setIsViewDialogOpen(true);
  };

  // Handle add brand item action
  const handleAddBrandItem = async (product: TremendousProduct) => {
    try {
      toast.loading("Adding item to system...", { id: "add-item" });
      
      const response = await axios.post('/api/legacy/providers/tremendous/catalog/add-item', {
        product
      });
      
      if (response.data.success) {
        toast.success(
          `Successfully added "${response.data.item_name}" to the system`,
          { id: "add-item" }
        );
        // Invalidate the query to refetch existing items
        queryClient.invalidateQueries({ queryKey: ["existing-tremendous-items"] });
      } else {
        toast.error(
          response.data.error || "Item already exists in the system",
          { id: "add-item" }
        );
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error(
        "Failed to add item to system. Please try again.",
        { id: "add-item" }
      );
    }
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
            : "Failed to load Tremendous catalog data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        columns={createTremendousCatalogColumns(handleViewCard)}
        data={data}
        searchColumn={{
          id: "name",
          placeholder: "Search by product name...",
        }}
        searchableColumns={[
          {
            id: "name",
            displayName: "Product Name",
          },
          {
            id: "category",
            displayName: "Category",
          },
        ]}
        filters={[
          {
            id: "category",
            title: "Category",
            options: Array.from(
              new Set(
                data.map(
                  (item: { category: string }) => item.category,
                ),
              ),
            ).map((value) => ({
              value: value as string,
              label: (value as string).replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            })),
          },
          {
            id: "currency_codes",
            title: "Currency",
            options: Array.from(
              new Set(
                data.flatMap(
                  (item: { currency_codes: string[] }) => item.currency_codes,
                ),
              ),
            ).map((value) => ({
              value: value as string,
              label: value as string,
            })),
          },
        ]}
        enableRefresh={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
        onRowDoubleClick={handleRowDoubleClick}
      />
      
      <ViewTremendousCard
        product={selectedProduct}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onAddBrandItem={handleAddBrandItem}
        existingItemIds={existingItems}
      />
    </>
  );
}