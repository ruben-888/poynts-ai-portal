"use client";

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

// Define columns for the Tango catalog data table
export const createTangoCatalogColumns = (onViewCard: (product: any) => void) => [
  {
    accessorKey: "brandName",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Brand Name" />
    ),
    cell: ({ row }: any) => {
      return (
        <div>
          <span className="font-medium">{row.getValue("brandName")}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }: any) => {
      const title = row.original.associatedItems?.[0]?.title;
      return (
        <div className="max-w-[300px]">
          <span className="truncate text-sm">
            {title || "No title"}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "minAmount.amount",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Min Value" />
    ),
    cell: ({ row }: any) => {
      const minAmount = row.original.minAmount?.amount;
      return <span className="font-mono">{formatCurrency(minAmount)}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "maxAmount.amount",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Max Value" />
    ),
    cell: ({ row }: any) => {
      const maxAmount = row.original.maxAmount?.amount;
      return <span className="font-mono">{formatCurrency(maxAmount)}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "productId",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Product ID" />
    ),
    cell: ({ row }: any) => {
      return (
        <span className="font-mono text-xs">
          {row.getValue("productId")}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "cardExists",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Card Status" />
    ),
    cell: ({ row }: any) => {
      const cardExists = row.getValue("cardExists");
      return (
        <div className="flex items-center">
          {cardExists ? (
            <Badge
              variant="default"
              className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
            >
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Enabled
            </Badge>
          ) : (
            <Badge variant="secondary" className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gray-400"></span>
              Disabled
            </Badge>
          )}
        </div>
      );
    },
    filterFn: (row: any, id: any, value: any) => {
      const cardExists = row.getValue(id);
      // Convert string filter values to booleans for comparison
      return value.some((v: string) => {
        const filterValue = v === "true";
        return cardExists === filterValue;
      });
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }: any) => {
      const product = row.original;

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
            <DropdownMenuItem onClick={() => onViewCard(product)}>
              <Eye className="mr-2 h-4 w-4" />
              View Card
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];