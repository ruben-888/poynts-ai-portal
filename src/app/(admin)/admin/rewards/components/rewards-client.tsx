"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createRewardsColumns } from "./rewards-columns";
import { ViewReward } from "./view-reward";
import type { Reward, RewardsResponse } from "@/types/reward";

// Client component for displaying global rewards
export default function RewardsClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Reward | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch rewards with relations
  const fetchRewards = async (): Promise<Reward[]> => {
    const response = await axios.get<RewardsResponse>("/api/v1/rewards", {
      params: {
        include_brand: true,
        include_source: true,
        limit: 1000,
      },
    });
    return response.data.data;
  };

  // Use React Query to manage data fetching
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["rewards"],
    queryFn: fetchRewards,
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
  const handleViewItem = (item: Reward) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  // Handle double-click on table row
  const handleRowDoubleClick = (row: { original: Reward }) => {
    handleViewItem(row.original);
  };

  // Get unique types for filter options
  const typeOptions = Array.from(new Set(data.map((item) => item.type)))
    .filter(Boolean)
    .map((type) => ({
      value: type as string,
      label: type === "gift_card" ? "Gift Card" : "Offer",
    }));

  // Get unique sources for filter options
  const sourceOptions = Array.from(
    new Map(
      data
        .filter((item) => item.source)
        .map((item) => [item.source_fk, item.source])
    ).entries()
  ).map(([id, source]) => ({
    value: id as string,
    label: source?.name || (id as string),
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
            : "Failed to load rewards data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        columns={createRewardsColumns(handleViewItem)}
        data={data}
        searchColumn={{
          id: "name",
          placeholder: "Search by name...",
        }}
        searchableColumns={[
          {
            id: "name",
            displayName: "Name",
          },
        ]}
        filters={[
          {
            id: "type",
            title: "Type",
            options: typeOptions,
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
          ...(sourceOptions.length > 0
            ? [
                {
                  id: "source",
                  title: "Source",
                  options: sourceOptions,
                },
              ]
            : []),
        ]}
        enableRefresh={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
        onRowDoubleClick={handleRowDoubleClick}
      />

      <ViewReward
        item={selectedItem}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </>
  );
}
