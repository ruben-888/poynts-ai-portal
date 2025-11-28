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

// Define columns for the BlackHawk catalog data table
export const createBlackhawkCatalogColumns = (onViewCard: (product: any) => void) => [
  {
    accessorKey: "productName",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }: any) => {
      return (
        <div>
          <span className="font-medium">{row.getValue("productName")}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "parentBrandName",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
    cell: ({ row }: any) => {
      return <span>{row.getValue("parentBrandName")}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "offFaceDiscountPercent",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Rebate" />
    ),
    cell: ({ row }: any) => {
      const rebate = row.getValue("offFaceDiscountPercent");
      // Convert negative percentages to positive for display
      const displayValue = Math.abs(Number(rebate));
      return (
        <Badge variant="outline" className="font-mono">
          {displayValue.toFixed(2)}%
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "valueRestrictions.minimum",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Min Value" />
    ),
    cell: ({ row }: any) => {
      const minValue = row.original.valueRestrictions?.minimum;
      return <span className="font-mono">{formatCurrency(minValue)}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "valueRestrictions.maximum",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Max Value" />
    ),
    cell: ({ row }: any) => {
      const maxValue = row.original.valueRestrictions?.maximum;
      return <span className="font-mono">{formatCurrency(maxValue)}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "contentProviderCode",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Provider Code" />
    ),
    cell: ({ row }: any) => {
      return (
        <span className="font-mono text-xs">
          {row.getValue("contentProviderCode")}
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
