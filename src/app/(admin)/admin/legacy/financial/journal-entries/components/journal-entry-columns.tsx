import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import type { JournalEntry } from "../types";

export const journalEntryColumns: ColumnDef<JournalEntry, unknown>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <span className="font-mono text-xs">{row.original.id}</span>;
    },
  },
  {
    id: "entry_date",
    accessorKey: "entry_date",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.original.entry_date);
      return (
        <span>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </span>
      );
    },
  },
  {
    id: "entry_type",
    accessorKey: "entry_type",
    header: "Type",
    cell: ({ row }) => {
      return <span>{row.original.entry_type}</span>;
    },
  },
  {
    id: "amount",
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.original.amount;
      return amount != null
        ? `$${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
        : "N/A";
    },
  },
  {
    id: "from_bank",
    accessorKey: "from_ledger.bank.name",
    header: "From Bank",
    cell: ({ row }) => row.original.from_ledger?.bank?.name || "N/A",
  },
  {
    id: "from_date",
    accessorKey: "from_ledger.transaction_date",
    header: "From Date",
    cell: ({ row }) => {
      const date = row.original.from_ledger?.transaction_date
        ? new Date(row.original.from_ledger.transaction_date)
        : null;
      return date ? date.toLocaleDateString() : "N/A";
    },
  },
  {
    id: "from_amount",
    accessorKey: "from_ledger.amount",
    header: "From Amount",
    cell: ({ row }) => {
      const amount = row.original.from_ledger?.amount;
      return amount != null
        ? `$${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
        : "N/A";
    },
  },
  {
    id: "to_bank",
    accessorKey: "to_ledger.bank.name",
    header: "To Bank",
    cell: ({ row }) => row.original.to_ledger?.bank?.name || "N/A",
  },
  {
    id: "to_date",
    accessorKey: "to_ledger.transaction_date",
    header: "To Date",
    cell: ({ row }) => {
      const date = row.original.to_ledger?.transaction_date
        ? new Date(row.original.to_ledger.transaction_date)
        : null;
      return date ? date.toLocaleDateString() : "N/A";
    },
  },
  {
    id: "to_amount",
    accessorKey: "to_ledger.amount",
    header: "To Amount",
    cell: ({ row }) => {
      const amount = row.original.to_ledger?.amount;
      return amount != null
        ? `$${Number(amount).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
        : "N/A";
    },
  },
  {
    id: "entry_notes",
    accessorKey: "entry_notes",
    header: "Notes",
    cell: ({ row }) => (
      <div
        className="max-w-[300px] truncate"
        title={row.original.entry_notes || ""}
      >
        {row.original.entry_notes || "N/A"}
      </div>
    ),
  },
];
