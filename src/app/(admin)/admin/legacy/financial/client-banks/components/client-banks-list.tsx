"use client";
import React, { useState } from "react";
import {
  useClientBanks,
  ClientBank,
} from "../../journal-entries/hooks/use-client-banks";
import { DataTable } from "@/components/data-table/data-table";
import { clientBankColumns } from "./client-bank-columns";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Row } from "@tanstack/react-table";

/**
 * Component that displays a list of client banks with links to their ledger details
 * using the shared DataTable component with minimal configuration
 */
export function ClientBanksList() {
  const { data: banks = [], isLoading, error, mutate } = useClientBanks();
  const isError = !!error;
  const [selectedBankId, setSelectedBankId] = useState<number | null>(null);

  // Create initial column visibility state
  const initialColumnVisibility = {
    id: false, // Hide the ID column by default
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading client banks...</span>
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load client banks"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => mutate()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Client Banks</h2>
      </div>

      <DataTable
        columns={clientBankColumns}
        data={banks}
        initialColumnVisibility={initialColumnVisibility}
        enableRefresh={false}
        disablePagination={true}
        filters={[]} // Empty filters array to disable facet filters
        onRowClick={(row: Row<ClientBank>) => {
          setSelectedBankId(row.original.id);
        }}
        selectedRowId={selectedBankId?.toString()}
      />
    </div>
  );
}
