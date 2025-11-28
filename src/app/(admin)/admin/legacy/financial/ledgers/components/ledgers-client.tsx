"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { ledgerColumns, Ledger } from "./ledger-columns";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Row } from "@tanstack/react-table";
import React from "react";

// Define API response interface
interface ApiResponse {
  data: Ledger[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  error?: string;
}

/**
 * Client component for displaying ledger entries in a data table
 */
export default function LedgersClient() {
  // State to track if refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLedgerId, setSelectedLedgerId] = useState<number | null>(null);

  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  // Create initial column visibility state
  const initialColumnVisibility = {
    id: false, // Hide the ID column by default
  };

  // Fetch ledger entries directly using React Query
  const fetchLedgers = async (): Promise<Ledger[]> => {
    try {
      const response = await axios.get<ApiResponse>(
        "/api/legacy/financial/ledger",
      );

      // Check if data exists in the response
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          "Failed to fetch ledger entries: Invalid response format",
        );
      }
    } catch (error) {
      console.error("Error fetching ledger entries:", error);
      throw new Error("Failed to fetch ledger entries");
    }
  };

  // Use React Query to manage data fetching
  const {
    data: ledgers = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["ledgers"],
    queryFn: fetchLedgers,
  });

  // Function to handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["ledgers"] });
    } finally {
      // Set refreshing state back to false after a short delay
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Extract unique bank names and codes for filters
  const bankOptions = React.useMemo(() => {
    const banksMap = new Map<number, { name: string; code: string }>();

    ledgers.forEach((ledger) => {
      if (ledger.bank) {
        banksMap.set(ledger.bank.id, {
          name: ledger.bank.name,
          code: ledger.bank.code,
        });
      }
    });

    return Array.from(banksMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((bank) => ({
        value: bank.code,
        label: bank.name,
      }));
  }, [ledgers]);

  // Display error message if there's an error
  if (isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to fetch ledger entries"}
          </AlertDescription>
        </Alert>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Try Again
        </Button>
      </div>
    );
  }

  // Display loading state
  if (isLoading && !isRefreshing) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        columns={ledgerColumns}
        data={ledgers}
        initialColumnVisibility={initialColumnVisibility}
        enableRefresh={true}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        searchColumn={{
          id: "billing_reference",
          placeholder: "Search by billing reference...",
        }}
        filters={[
          {
            id: "bank_code",
            title: "Bank",
            options: bankOptions,
          },
        ]}
        onRowClick={(row: Row<Ledger>) => {
          setSelectedLedgerId(row.original.id);
        }}
        selectedRowId={selectedLedgerId?.toString()}
      />
    </div>
  );
}
