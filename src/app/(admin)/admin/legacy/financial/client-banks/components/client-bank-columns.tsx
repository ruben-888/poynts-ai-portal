"use client";

import { ColumnDef } from "@tanstack/react-table";
import { formatDate, formatCurrency } from "@/lib/utils";
import { ClientBank } from "../../journal-entries/hooks/use-client-banks";

/**
 * Column definitions for the client banks data table
 */
export const clientBankColumns: ColumnDef<ClientBank>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => <div>{row.getValue("id")}</div>,
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("name")}</div>
    ),
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => {
      const provider = row.original.provider;
      return <div>{provider ? provider.name : "N/A"}</div>;
    },
    filterFn: (row, id, value) => {
      const provider = row.original.provider;
      return provider ? provider.code === value : false;
    },
  },
  {
    accessorKey: "balance",
    header: "Balance",
    cell: ({ row }) => formatCurrency(row.getValue("balance")),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }) => formatDate(row.getValue("created_at")),
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }) => formatDate(row.getValue("updated_at")),
  },
];
