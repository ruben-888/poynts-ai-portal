"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Reward } from "@/types/reward";

// Status badge variant mapping
const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
  suspended: "destructive",
};

// Type badge variant mapping
const typeVariants: Record<string, "default" | "secondary"> = {
  gift_card: "default",
  offer: "secondary",
};

// Define columns for the rewards data table
export const createRewardsColumns = (
  onViewItem: (item: Reward) => void
): ColumnDef<Reward>[] => [
  {
    accessorKey: "image",
    header: "",
    cell: ({ row }) => {
      const imageUrl = row.getValue("image") as string | undefined;
      return imageUrl ? (
        <img
          src={imageUrl}
          alt={row.original.name || "Reward"}
          className="h-8 w-12 object-contain rounded"
        />
      ) : (
        <div className="h-8 w-12 bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
          —
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name") || "—"}</span>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const type = row.getValue("type") as string | undefined;
      if (!type) return <span className="text-muted-foreground">—</span>;
      return (
        <Badge variant={typeVariants[type] || "secondary"} className="text-xs">
          {type === "gift_card" ? "Gift Card" : "Offer"}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "brand.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
    cell: ({ row }) => {
      const brandName = row.original.brand?.name;
      return brandName ? (
        <span className="text-sm">{brandName}</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("value") as number | undefined;
      const currency = row.original.currency || "USD";
      if (value === undefined || value === null) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <span className="font-mono text-sm">
          {formatCurrency(value, currency)}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "poynts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Poynts" />
    ),
    cell: ({ row }) => {
      const poynts = row.getValue("poynts") as number | undefined;
      if (poynts === undefined || poynts === null) {
        return <span className="text-muted-foreground">—</span>;
      }
      return (
        <Badge variant="outline" className="font-mono text-xs">
          {poynts.toLocaleString()}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "source",
    accessorKey: "source_fk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      const sourceName = row.original.source?.name;
      return sourceName ? (
        <Badge variant="outline" className="text-xs">
          {sourceName}
        </Badge>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string | undefined;
      if (!status) return <span className="text-muted-foreground">—</span>;
      return <Badge variant={statusVariants[status] || "secondary"}>{status}</Badge>;
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const item = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuItem onClick={() => onViewItem(item)}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
