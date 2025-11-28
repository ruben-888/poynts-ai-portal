import { ColumnDef } from "@tanstack/react-table";

// Define the Ledger type based on the API response
export interface Ledger {
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
}

export const ledgerColumns: ColumnDef<Ledger, unknown>[] = [
  {
    id: "id",
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => {
      return <span className="font-mono text-xs">{row.original.id}</span>;
    },
  },
  {
    id: "transaction_date",
    accessorKey: "transaction_date",
    header: "Date",
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
    id: "amount",
    accessorKey: "amount",
    header: "Amount",
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
    id: "bank_name",
    accessorKey: "bank.name",
    header: "Bank",
    cell: ({ row }) => row.original.bank?.name || "N/A",
  },
  {
    id: "bank_code",
    accessorKey: "bank.code",
    header: "Bank Code",
    cell: ({ row }) => row.original.bank?.code || "N/A",
  },
  {
    id: "notes",
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.original.notes || ""}>
        {row.original.notes || "N/A"}
      </div>
    ),
  },
  {
    id: "billing_reference",
    accessorKey: "billing_reference",
    header: "Billing Reference",
    cell: ({ row }) => (
      <div
        className="max-w-[300px] truncate"
        title={row.original.billing_reference || ""}
      >
        {row.original.billing_reference || "N/A"}
      </div>
    ),
  },
];
