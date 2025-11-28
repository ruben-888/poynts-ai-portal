"use client";

import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/data-table/data-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { columns, Transaction } from "./columns";
import { ManageOrder } from "./manage-order";
import { Row } from "@tanstack/react-table";

export function SearchClient() {
  // State to track if refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);
  // New state for the manage order dialog
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  // Get the query client for invalidation
  const queryClient = useQueryClient();

  // Create initial column visibility state
  const initialColumnVisibility = {
    id: false, // Hide the ID column by default
    entName: false, // Hide the Client column by default
    source: false, // Hide the Source column by default
    brand: false, // Hide the Brand column by default
    custTransactionReference: false, // Hide the Customer Ref. ID column by default
    memberid: false, // Hide the Member ID column by default
  };

  // Effect to listen for the custom event
  useEffect(() => {
    const handleViewTransaction = (event: CustomEvent<Transaction>) => {
      setSelectedTransaction(event.detail);
      setIsManageOpen(true);
    };

    // Add event listener
    document.addEventListener(
      "transaction:view",
      handleViewTransaction as EventListener,
    );

    // Clean up on unmount
    return () => {
      document.removeEventListener(
        "transaction:view",
        handleViewTransaction as EventListener,
      );
    };
  }, []);

  // Set initial pagination
  const initialPageSize = 100; // Default to 100 rows per page

  // Fetch transactions using React Query
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const response = await axios.get("/api/legacy/transactions?limit=10000");
      console.log(
        `Client: Received ${response.data.data.length} transactions out of ${response.data.pagination.total} total`,
      );
      return response.data;
    },
  });

  // Function to handle refresh
  const handleRefresh = async () => {
    // Set refreshing state to true
    setIsRefreshing(true);

    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["transactions"] });
    } finally {
      // Set refreshing state back to false when done
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Small delay to ensure animation is visible
    }
  };

  // Function to handle row double-click
  const handleRowDoubleClick = (row: Row<Transaction>) => {
    setSelectedTransaction(row.original);
    setIsManageOpen(true);
  };

  // Extract transactions from the response data
  const transactions = data?.data || [];

  // Extract unique clients, sources, and brands for filters
  const uniqueClients = [
    ...new Set(transactions.map((t: Transaction) => t.entName).filter(Boolean)),
  ];
  const uniqueSources = [
    ...new Set(transactions.map((t: Transaction) => t.source).filter(Boolean)),
  ];
  const uniqueBrands = [
    ...new Set(
      transactions
        .map((t: Transaction) => t.giftcard?.brandName)
        .filter(Boolean),
    ),
  ];

  // Determine which transactions are gift cards vs offers
  const isGiftCard = (transaction: Transaction) =>
    Boolean(transaction.giftcard);
  const giftCardCount = transactions.filter(isGiftCard).length;
  const offersCount = transactions.length - giftCardCount;

  // Create properly typed filter options
  const clientOptions = uniqueClients.map((client) => ({
    label: String(client),
    value: String(client),
  }));

  const sourceOptions = uniqueSources.map((source) => ({
    label: String(source),
    value: String(source),
  }));

  const brandOptions = uniqueBrands.map((brand) => ({
    label: String(brand),
    value: String(brand),
  }));

  const typeOptions = [
    { label: `Gift Card (${giftCardCount})`, value: "giftcard" },
    { label: `Offers (${offersCount})`, value: "offer" },
  ];

  return (
    <div className="space-y-4">
      {/* Order Stats Overview - Temporarily hidden
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Total Orders</span>
            <span className="text-2xl font-bold">{transactions.length || 0}</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Active Orders</span>
            <span className="text-2xl font-bold">{transactions.filter((t: Transaction) => t.result.toLowerCase() === 'pending').length || 0}</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Completed Orders</span>
            <span className="text-2xl font-bold">{transactions.filter((t: Transaction) => t.result.toLowerCase() === 'success').length || 0}</span>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex flex-col space-y-2">
            <span className="text-sm font-medium text-muted-foreground">Cancelled Orders</span>
            <span className="text-2xl font-bold">{transactions.filter((t: Transaction) => t.result.toLowerCase() === 'failed').length || 0}</span>
          </div>
        </Card>
      </div>
      */}

      {/* Transactions Table - Removed the external Card wrapper */}
      {isLoading ? (
        <div className="text-center text-sm text-muted-foreground p-6 bg-white rounded-lg shadow">
          Loading transactions...
        </div>
      ) : error ? (
        <div className="text-center text-sm text-red-500 p-6 bg-white rounded-lg shadow">
          Error loading transactions
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center text-sm text-muted-foreground p-6 bg-white rounded-lg shadow">
          No transactions to display
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={transactions}
          searchableColumns={[
            {
              id: "rewardName",
              displayName: "Reward Name",
            },
            {
              id: "custTransactionReference",
              displayName: "Customer Ref. ID",
            },
            {
              id: "memberid",
              displayName: "Member ID",
            },
          ]}
          searchPlaceholder="Search transactions..."
          filters={[
            {
              id: "result",
              title: "Status",
              options: [
                { label: "Success", value: "success" },
                { label: "Failed", value: "failed" },
                { label: "Pending", value: "pending" },
              ],
            },
            {
              id: "type",
              title: "Type",
              options: typeOptions,
            },
            {
              id: "entName",
              title: "Client",
              options: clientOptions,
            },
            {
              id: "source",
              title: "Source",
              options: sourceOptions,
            },
            {
              id: "brand",
              title: "Brand",
              options: brandOptions,
            },
          ]}
          enableRefresh={true}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          initialColumnVisibility={initialColumnVisibility}
          enableCSVExport={true}
          csvFilename="carepoynt-transactions-export"
          onRowDoubleClick={handleRowDoubleClick}
          showActionsButton={false}
          initialPageSize={initialPageSize}
        />
      )}

      {/* Order Management Dialog */}
      <ManageOrder
        isOpen={isManageOpen}
        onOpenChange={setIsManageOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}
