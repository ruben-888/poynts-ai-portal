"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createSourceItemsColumns } from "./source-items-columns";
import { ViewSourceItem } from "./view-source-item";
import type {
  RewardSourceItem,
  RewardSourceItemsResponse,
} from "@/types/reward-source-item";

// Client component for displaying source items across all providers
export default function SourceItemsClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RewardSourceItem | null>(
    null
  );
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch source items with relations
  const fetchSourceItems = async (): Promise<RewardSourceItem[]> => {
    const response = await axios.get<RewardSourceItemsResponse>(
      "/api/v1/source-items",
      {
        params: {
          include_source: true,
          include_reward: true,
          limit: 1000,
        },
      }
    );
    return response.data.data;
  };

  // Use React Query to manage data fetching
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["source-items"],
    queryFn: fetchSourceItems,
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
  const handleViewItem = (item: RewardSourceItem) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  // Handle double-click on table row
  const handleRowDoubleClick = (row: { original: RewardSourceItem }) => {
    handleViewItem(row.original);
  };

  // Get unique sources for filter options
  const sourceOptions = Array.from(
    new Map(
      data
        .filter((item) => item.source)
        .map((item) => [item.source_fk, item.source])
    ).entries()
  ).map(([id, source]) => ({
    value: id,
    label: source?.name || id,
  }));

  // Show error if data fetching failed
  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error
            ? error.message
            : "Failed to load source items data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        columns={createSourceItemsColumns(handleViewItem)}
        data={data}
        searchColumn={{
          id: "source_identifier",
          placeholder: "Search by identifier...",
        }}
        searchableColumns={[
          {
            id: "source_identifier",
            displayName: "Identifier",
          },
        ]}
        filters={[
          {
            id: "source",
            title: "Source",
            options: sourceOptions,
          },
          {
            id: "status",
            title: "Status",
            options: [
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
              { value: "pending", label: "Pending" },
              { value: "suspended", label: "Suspended" },
            ],
          },
        ]}
        enableRefresh={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
        onRowDoubleClick={handleRowDoubleClick}
      />

      <ViewSourceItem
        item={selectedItem}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </>
  );
}
