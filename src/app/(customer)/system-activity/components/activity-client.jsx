"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { columns } from "./columns";
import { SystemActivity } from "@/app/api/sytem-activity/services/get-all-activities";

export function ActivityClient() {
  // State to track if refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get the query client for invalidation
  const queryClient = useQueryClient();

  // Create initial column visibility state
  const initialColumnVisibility = {
    // Hide IP address and reward type columns by default
    reward_type: false,
    ip_address: false,
  };

  // Fetch system activity data using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["systemActivity"],
    queryFn: async () => {
      const response = await axios.get("/api/sytem-activity");
      return response.data;
    },
  });

  // Function to handle refresh
  const handleRefresh = async () => {
    // Set refreshing state to true
    setIsRefreshing(true);

    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["systemActivity"] });
    } finally {
      // Set refreshing state back to false when done
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Small delay to ensure animation is visible
    }
  };

  // Extract activities from the response data
  const activities = data || [];

  // Create dynamic filter options based on actual data
  const typeOptions = React.useMemo(() => {
    if (!activities.length) return [];

    return Array.from(
      new Set(
        activities.map((activity) => activity.type).filter((type) => type) // Filter out null/undefined values
      )
    ).map((value) => ({
      value: value,
      label: value.charAt(0).toUpperCase() + value.slice(1), // Capitalize first letter
    }));
  }, [activities]);

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground p-6 bg-white rounded-lg shadow">
          Loading system activity...
        </div>
      ) : error ? (
        <div className="text-center text-sm text-red-500 p-6 bg-white rounded-lg shadow">
          Error loading system activity
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground p-6 bg-white rounded-lg shadow">
          No system activity to display
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={activities}
          searchableColumns={[
            {
              id: "type",
              displayName: "Type",
            },
            {
              id: "description",
              displayName: "Description",
            },
            {
              id: "member_name",
              displayName: "Member",
            },
          ]}
          searchPlaceholder="Search activity..."
          filters={[
            {
              id: "severity",
              title: "Severity",
              options: [
                { label: "Info", value: "info" },
                { label: "Warning", value: "warning" },
                { label: "Error", value: "error" },
                { label: "Critical", value: "critical" },
              ],
            },
            {
              id: "type",
              title: "Type",
              options: typeOptions,
            },
          ]}
          enableRefresh={true}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          initialColumnVisibility={initialColumnVisibility}
          initialPageSize={20}
        />
      )}
    </div>
  );
}
