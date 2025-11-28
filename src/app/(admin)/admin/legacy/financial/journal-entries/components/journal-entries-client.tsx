"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Row } from "@tanstack/react-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { journalEntryColumns } from "./journal-entry-columns";
import { JournalEntry, FilterOption } from "../types";
import { AddJournalEntry } from "./add-journal-entry";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, RefreshCw, AlertCircle } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Definition for prepared journal entry data matching EditJournalEntry component expectations
interface Bank {
  id: number;
  name: string;
}

interface LedgerEntry {
  id: number;
  amount: number;
  transaction_date: string;
  billing_reference: string | null;
  notes: string | null;
  provider_reference: string | null;
  reconciled: number;
  bank: Bank;
}

interface JournalEntryData {
  id: number;
  entry_date: string;
  entry_type: string;
  amount: number;
  entry_notes: string;
  from_ledger: LedgerEntry;
  to_ledger: LedgerEntry;
}

// Define the client bank interface
export interface ClientBank {
  id: number;
  name: string;
  provider: {
    id: number;
    name: string;
    code: string;
  } | null;
  created_at: string;
  updated_at: string;
}

export default function JournalEntriesClient() {
  const [selectedEntry, setSelectedEntry] = useState<JournalEntryData | null>(
    null,
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get query client for cache invalidation
  const queryClient = useQueryClient();

  // Fetch journal entries directly with React Query
  const fetchJournalEntries = async (): Promise<JournalEntry[]> => {
    try {
      const response = await axios.get("/api/legacy/financial/journal-entries");

      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        throw new Error(
          response.data.error || "Failed to fetch journal entries",
        );
      }
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      throw new Error("Failed to fetch journal entries");
    }
  };

  // Fetch client banks directly with React Query
  const fetchClientBanks = async (): Promise<ClientBank[]> => {
    try {
      const response = await axios.get("/api/legacy/financial/client_banks");
      return response.data;
    } catch (error) {
      console.error("Error fetching client banks:", error);
      throw new Error("Failed to fetch client banks");
    }
  };

  // Use React Query to manage journal entries data
  const {
    data: journalEntries = [],
    isLoading: journalEntriesLoading,
    isError: journalEntriesIsError,
    error: journalEntriesError,
    refetch: refetchJournalEntries,
  } = useQuery({
    queryKey: ["journalEntries"],
    queryFn: fetchJournalEntries,
  });

  // Use React Query to manage client banks data
  const {
    data: clientBanks = [],
    isLoading: banksLoading,
    isError: banksIsError,
    error: banksError,
  } = useQuery({
    queryKey: ["clientBanks"],
    queryFn: fetchClientBanks,
  });

  // Function to handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      // Invalidate and refetch both queries
      await queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
      await queryClient.invalidateQueries({ queryKey: ["clientBanks"] });
    } finally {
      // Set refreshing state back to false after a short delay
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Extract unique transaction types from journal entries
  const transactionTypes = Array.from(
    new Set(
      journalEntries
        .map((entry: JournalEntry) => entry.entry_type)
        .filter(Boolean),
    ),
  ).sort();

  // Format banks for use in the component
  const banks = clientBanks
    .map((bank) => ({
      id: bank.id,
      name: bank.name || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  // Filter options
  const transactionTypeOptions: FilterOption[] = transactionTypes.map(
    (type) => ({
      value: type,
      label: type,
    }),
  );

  const bankOptions: FilterOption[] = banks.map((bank) => ({
    value: bank.id.toString(),
    label: bank.name || "",
  }));

  const handleSubmitEntry = async (data: any) => {
    try {
      const response = isEditMode 
        ? await axios.put(`/api/journal-entries/${data.id}`, data)
        : await axios.post("/api/journal-entries", data);
        
      if (response.data.success) {
        toast.success(`Journal entry ${isEditMode ? 'updated' : 'added'} successfully`);
        queryClient.invalidateQueries({ queryKey: ["journalEntries"] });
        setSelectedEntry(null);
        setIsEditMode(false);
      } else {
        toast.error(`Failed to ${isEditMode ? 'update' : 'add'} journal entry`);
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} journal entry:`, error);
      toast.error(`An error occurred while ${isEditMode ? 'updating' : 'adding'} the journal entry`);
    }
  };

  const renderEllipsesMenu = (row: Row<JournalEntry>) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEditEntry(row.original)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            // Handle delete
            console.log("Delete entry:", row.original);
          }}
          className="text-red-600 focus:text-red-600"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const handleEditEntry = (entry: JournalEntry) => {
    // Use the entry data directly as it already matches the expected format
    if (entry.from_ledger && entry.to_ledger) {
      const journalEntryData: JournalEntryData = {
        id: entry.id,
        entry_date: entry.entry_date,
        entry_type: entry.entry_type || "",
        amount: entry.amount || 0,
        entry_notes: entry.entry_notes || "",
        from_ledger: {
          id: entry.from_ledger.id,
          amount: entry.from_ledger.amount,
          transaction_date: entry.from_ledger.transaction_date,
          billing_reference: entry.from_ledger.billing_reference,
          notes: entry.from_ledger.notes,
          provider_reference: entry.from_ledger.provider_reference,
          reconciled: entry.from_ledger.reconciled || 0, // Convert null to 0
          bank: entry.from_ledger.bank
            ? {
                id: entry.from_ledger.bank.id,
                name: entry.from_ledger.bank.name || "",
              }
            : { id: 0, name: "" }, // Provide default bank if null
        },
        to_ledger: {
          id: entry.to_ledger.id,
          amount: entry.to_ledger.amount,
          transaction_date: entry.to_ledger.transaction_date,
          billing_reference: entry.to_ledger.billing_reference,
          notes: entry.to_ledger.notes,
          provider_reference: entry.to_ledger.provider_reference,
          reconciled: entry.to_ledger.reconciled || 0, // Convert null to 0
          bank: entry.to_ledger.bank
            ? {
                id: entry.to_ledger.bank.id,
                name: entry.to_ledger.bank.name || "",
              }
            : { id: 0, name: "" }, // Provide default bank if null
        },
      };

      setSelectedEntry(journalEntryData);
      setIsEditMode(true);
      setIsDialogOpen(true);
    } else {
      toast.error("Missing ledger data for this entry");
    }
  };

  // Display error message if there's an error with either query
  if (journalEntriesIsError || banksIsError) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {journalEntriesIsError
              ? journalEntriesError instanceof Error
                ? journalEntriesError.message
                : "Failed to fetch journal entries"
              : banksError instanceof Error
                ? banksError.message
                : "Failed to fetch banks"}
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button onClick={() => {
          setSelectedEntry(null);
          setIsEditMode(false);
          setIsDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add Entry
        </Button>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {journalEntriesLoading || banksLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <DataTable
          columns={[
            ...journalEntryColumns,
            {
              id: "actions",
              cell: ({ row }) => renderEllipsesMenu(row),
            },
          ]}
          data={journalEntries}
          filters={[
            {
              id: "entry_type",
              title: "Transaction Type",
              options: transactionTypeOptions,
            },
            {
              id: "from_bank",
              title: "From Bank",
              options: bankOptions,
            },
            {
              id: "to_bank",
              title: "To Bank",
              options: bankOptions,
            },
          ]}
          searchableColumns={[
            {
              id: "entry_notes",
              displayName: "Notes",
            },
            {
              id: "from_ledger.billing_reference",
              displayName: "From Reference",
            },
            {
              id: "to_ledger.billing_reference",
              displayName: "To Reference",
            },
          ]}
        />
      )}

      {isDialogOpen && (
        <AddJournalEntry
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedEntry(null);
            setIsEditMode(false);
          }}
          onSubmit={handleSubmitEntry}
          banks={banks}
          transactionTypes={transactionTypes}
          editMode={isEditMode}
          entry={selectedEntry}
        />
      )}
    </div>
  );
}
