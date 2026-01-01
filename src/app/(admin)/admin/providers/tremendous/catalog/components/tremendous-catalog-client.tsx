"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { createCatalogColumns } from "./tremendous-catalog-columns";
import { ViewCatalogItem } from "./view-tremendous-card";
import type { CatalogItem, CatalogResponse } from "@/types/reward-catalog";

// Client component for displaying Tremendous gift card catalog
export default function TremendousCatalogClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch catalog data from unified endpoint
  const fetchCatalog = async (): Promise<CatalogItem[]> => {
    const response = await axios.get<CatalogResponse>(
      "/api/v1/reward-sources/source-tremendous/catalog"
    );
    return response.data.data;
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

  // Handle view item action
  const handleViewItem = (item: CatalogItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  // Handle add/sync item action
  const handleAddBrandItem = async (item: CatalogItem) => {
    try {
      toast.loading("Syncing item to source items...", { id: "sync-item" });

      const response = await axios.post(
        "/api/v1/reward-sources/source-tremendous/catalog/sync",
        { sourceIdentifiers: [item.sourceIdentifier] }
      );

      const { created, updated } = response.data;

      if (created > 0) {
        toast.success(
          `Successfully added "${item.productName}" to source items`,
          { id: "sync-item" }
        );
      } else if (updated > 0) {
        toast.success(
          `Successfully updated "${item.productName}" in source items`,
          { id: "sync-item" }
        );
      } else {
        toast.info("Item is already up to date", { id: "sync-item" });
      }

      // Invalidate the catalog query to refresh the sync status
      queryClient.invalidateQueries({ queryKey: ["tremendous-catalog"] });
    } catch (error) {
      console.error("Error syncing item:", error);
      toast.error("Failed to sync item. Please try again.", {
        id: "sync-item",
      });
    }
  };

  // Handle double-click on table row
  const handleRowDoubleClick = (row: { original: CatalogItem }) => {
    handleViewItem(row.original);
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
        columns={createCatalogColumns(handleViewItem)}
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
            displayName: "Brand",
          },
        ]}
        filters={[
          {
            id: "currency",
            title: "Currency",
            options: Array.from(
              new Set(data.map((item) => item.currency))
            ).map((value) => ({
              value: value,
              label: value,
            })),
          },
          {
            id: "status",
            title: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ],
          },
          {
            id: "sourceItem",
            title: "Sync Status",
            options: [
              { value: "true", label: "Synced" },
              { value: "false", label: "Not Synced" },
            ],
          },
        ]}
        enableRefresh={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
        onRowDoubleClick={handleRowDoubleClick}
      />

      <ViewCatalogItem
        item={selectedItem}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        onAddBrandItem={handleAddBrandItem}
      />
    </>
  );
}