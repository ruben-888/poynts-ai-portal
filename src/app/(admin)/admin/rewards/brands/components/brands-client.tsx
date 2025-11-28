"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/data-table";
import { brandColumns } from "./columns";
import { Brand, BrandsResponse } from "../types";
import { toast } from "sonner";

async function fetchBrands(): Promise<Brand[]> {
  const response = await fetch("/api/rewards/brands");
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to fetch brands");
  }
  
  const data: BrandsResponse = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data.data;
}

export default function BrandsClient() {
  const queryClient = useQueryClient();
  
  const {
    data: brands,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Brand[]>({
    queryKey: ["brands"],
    queryFn: fetchBrands,
  });

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["brands"] });
    toast.success("Brands refreshed");
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-muted animate-pulse rounded-md" />
        <div className="h-[400px] bg-muted animate-pulse rounded-md" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">
          Failed to load brands: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  return (
    <DataTable
      columns={brandColumns}
      data={brands || []}
      searchableColumns={[
        { id: "key", displayName: "Brand Key" },
        { id: "name", displayName: "Brand Name" },
        { id: "display_name", displayName: "Display Name" },
      ]}
      filters={[
        {
          id: "name",
          title: "Brand Name",
          options: Array.from(
            new Set(
              (brands || []).map((brand) => brand.name).filter(Boolean)
            )
          ).sort().map((value) => ({
            value: value as string,
            label: value as string,
          })),
        },
      ]}
      enableRefresh
      onRefresh={handleRefresh}
      isRefreshing={false}
      enableCSVExport
      csvFilename="brands"
      initialColumnVisibility={{
        id: false,
        tag: false,
        description: false,
        tango_items: true,
        blackhawk_items: true,
        amazon_items: true,
        tremendous_items: true,
      }}
    />
  );
}