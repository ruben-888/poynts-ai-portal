"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { createOrganizationsColumns } from "./organizations-columns";
import { ViewOrganization } from "./view-organization";
import type {
  Organization,
  OrganizationListResponse,
} from "@/app/api/v1/(admin)/organizations/schema";

// Client component for displaying all organizations
export default function OrganizationsClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Organization | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Fetch organizations from API
  const fetchOrganizations = async (): Promise<Organization[]> => {
    const response = await axios.get<OrganizationListResponse>(
      "/api/v1/organizations",
      {
        params: {
          limit: 1000,
        },
      }
    );
    return response.data.data;
  };

  // Use React Query to manage data fetching
  const { data = [], isLoading, isError, error, refetch } = useQuery({
    queryKey: ["organizations"],
    queryFn: fetchOrganizations,
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
  const handleViewItem = (item: Organization) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  // Handle double-click on table row
  const handleRowDoubleClick = (row: { original: Organization }) => {
    handleViewItem(row.original);
  };

  // Get unique parent organizations for filter options
  const parentOrgOptions = Array.from(
    new Map(
      data
        .filter((org) => org.parent_id)
        .map((org) => {
          const parent = data.find((p) => p.id === org.parent_id);
          return [org.parent_id, parent?.name || org.parent_id];
        })
    ).entries()
  ).map(([id, name]) => ({
    value: id as string,
    label: name as string,
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
            : "Failed to load organizations data"}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <DataTable
        columns={createOrganizationsColumns(handleViewItem)}
        data={data}
        searchColumn={{
          id: "name",
          placeholder: "Search organizations...",
        }}
        searchableColumns={[
          {
            id: "name",
            displayName: "Name",
          },
        ]}
        filters={[
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
          ...(parentOrgOptions.length > 0
            ? [
                {
                  id: "parent_id",
                  title: "Parent Org",
                  options: parentOrgOptions,
                },
              ]
            : []),
        ]}
        enableRefresh={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing || isLoading}
        onRowDoubleClick={handleRowDoubleClick}
      />

      <ViewOrganization
        item={selectedItem}
        isOpen={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
      />
    </>
  );
}
