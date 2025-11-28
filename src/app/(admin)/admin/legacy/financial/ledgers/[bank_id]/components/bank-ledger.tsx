"use client";

import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { useClientBank } from "../../../journal-entries/hooks/use-client-banks";

// Define the BankTransaction type based on the API response
interface BankTransaction {
  id: number;
  transaction_date: string;
  amount: number;
  notes: string;
  billing_reference: string;
  bank: {
    id: number;
    name: string;
    code: string;
  };
  running_balance: number;
}

// Define API response interface
interface ApiResponse {
  data: BankTransaction[];
  success?: boolean;
  error?: string;
}

export function BankLedger() {
  const params = useParams();
  const bankId = params.bank_id as string;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Fetch the bank details to get the name
  const { data: bankDetails, isLoading: isBankLoading } = useClientBank(bankId);

  // Define columns for the data table
  const columns: ColumnDef<BankTransaction>[] = [
    {
      id: "id",
      accessorKey: "id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
      cell: ({ row }) => {
        return <span className="font-mono text-xs">{row.original.id}</span>;
      },
    },
    {
      id: "transaction_date",
      accessorKey: "transaction_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.transaction_date);
        return (
          <span>
            {date.toLocaleDateString()} {date.toLocaleTimeString()}
          </span>
        );
      },
    },
    {
      id: "notes",
      accessorKey: "notes",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Notes" />
      ),
      cell: ({ row }) => (
        <div
          className="max-w-[200px] truncate"
          title={row.original.notes || ""}
        >
          {row.original.notes || "N/A"}
        </div>
      ),
    },
    {
      id: "billing_reference",
      accessorKey: "billing_reference",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Billing Reference" />
      ),
      cell: ({ row }) => (
        <div
          className="max-w-[300px] truncate"
          title={row.original.billing_reference || ""}
        >
          {row.original.billing_reference || "N/A"}
        </div>
      ),
    },
    {
      id: "bank_name",
      accessorKey: "bank.name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bank" />
      ),
      cell: ({ row }) => row.original.bank?.name || "N/A",
    },
    {
      id: "bank_code",
      accessorKey: "bank.code",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Bank Code" />
      ),
      cell: ({ row }) => row.original.bank?.code || "N/A",
    },
    {
      id: "amount",
      accessorKey: "amount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" />
      ),
      cell: ({ row }) => {
        const amount = row.original.amount;
        const formattedAmount =
          amount != null
            ? `$${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
            : "N/A";

        // Add color based on positive/negative amount
        const colorClass = amount < 0 ? "text-red-500" : "text-green-500";

        return <span className={colorClass}>{formattedAmount}</span>;
      },
    },
    {
      id: "running_balance",
      accessorKey: "running_balance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Running Balance" />
      ),
      cell: ({ row }) => {
        const balance = row.original.running_balance;
        return (
          <span className="font-medium">
            $
            {Number(balance).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
          </span>
        );
      },
    },
  ];

  // Function to fetch bank transactions
  const fetchBankTransactions = async (): Promise<BankTransaction[]> => {
    try {
      const response = await axios.get<ApiResponse>(
        `/api/legacy/financial/ledger/${bankId}`,
      );

      // Check if data exists in the response
      if (response.data && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.error ||
            "Failed to fetch bank transactions: Invalid response format",
        );
      }
    } catch (error) {
      console.error("Error fetching bank transactions:", error);
      throw new Error("Failed to fetch bank transactions");
    }
  };

  // Use React Query to fetch and manage data
  const {
    data = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["bankTransactions", bankId],
    queryFn: fetchBankTransactions,
    enabled: !!bankId, // Only run the query if bankId is available
  });

  // Function to handle refresh button click
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({
        queryKey: ["bankTransactions", bankId],
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Custom actions component with refresh button
  const customActions = (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="h-8 gap-1"
    >
      <RefreshCw
        className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
      />
      Refresh
    </Button>
  );

  // Generate the title with the bank name if available
  const pageTitle = bankDetails ? `${bankDetails.name} Ledger` : "Bank Ledger";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "Failed to load bank transactions"}
          </AlertDescription>
        </Alert>
      )}

      <DataTable
        columns={columns}
        data={data}
        customActions={customActions}
        searchColumn={{
          id: "billing_reference",
          placeholder: "Search billing references...",
        }}
        searchableColumns={[
          {
            id: "notes",
            displayName: "Notes",
          },
          {
            id: "billing_reference",
            displayName: "Billing Reference",
          },
        ]}
      />
    </div>
  );
}
