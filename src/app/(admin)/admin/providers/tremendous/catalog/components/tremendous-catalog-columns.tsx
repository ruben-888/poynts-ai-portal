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
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, Eye } from "lucide-react";
import type { CatalogItem } from "@/types/reward-catalog";

// Define columns for the unified catalog data table
export const createCatalogColumns = (
  onViewItem: (item: CatalogItem) => void
): ColumnDef<CatalogItem>[] => [
  {
    accessorKey: "imageUrl",
    header: "",
    cell: ({ row }) => {
      const imageUrl = row.getValue("imageUrl") as string;
      return imageUrl ? (
        <img
          src={imageUrl}
          alt={row.original.productName}
          className="h-8 w-12 object-contain rounded"
        />
      ) : (
        <div className="h-8 w-12 bg-muted rounded" />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "brandName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("brandName")}</span>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "productName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Product" />
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.getValue("productName")}</span>
    ),
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "currency",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    cell: ({ row }) => (
      <Badge variant="secondary" className="font-mono text-xs">
        {row.getValue("currency")}
      </Badge>
    ),
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "faceValue",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Face Value" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("faceValue") as number;
      const currency = row.original.currency;
      return (
        <span className="font-mono">
          {formatCurrency(value, currency)}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "countries",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Countries" />
    ),
    cell: ({ row }) => {
      const countries = row.getValue("countries") as string[];
      const countryCount = countries?.length || 0;
      const hasUS = countries?.includes("US");

      return (
        <div className="flex items-center gap-1">
          {hasUS && (
            <Badge variant="default" className="text-xs">
              US
            </Badge>
          )}
          {countryCount > 1 && (
            <Badge variant="outline" className="text-xs">
              +{countryCount - (hasUS ? 1 : 0)}
            </Badge>
          )}
          {countryCount === 0 && (
            <span className="text-muted-foreground text-xs">None</span>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "sourceItem",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Sync Status" />
    ),
    cell: ({ row }) => {
      const sourceItem = row.original.sourceItem;
      const isSynced = sourceItem !== null && sourceItem !== undefined;
      return (
        <Badge variant={isSynced ? "default" : "outline"}>
          {isSynced ? "Synced" : "Not Synced"}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row) => {
      const sourceItem = row.original.sourceItem;
      return sourceItem !== null && sourceItem !== undefined;
    },
  },
  {
    accessorKey: "sourceIdentifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.getValue("sourceIdentifier")}
      </span>
    ),
    enableSorting: true,
    enableHiding: true,
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
