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

// Define columns for the combined catalog data table
export const createCombinedCatalogColumns = (onViewCard: (product: any) => void) => [
  {
    accessorKey: "provider",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Provider" />
    ),
    cell: ({ row }: any) => {
      const provider = row.getValue("provider");
      return (
        <Badge 
          variant={provider === "tango" ? "default" : "secondary"}
          className={provider === "tango" 
            ? "bg-orange-100 text-orange-800 hover:bg-orange-100" 
            : "bg-blue-100 text-blue-800 hover:bg-blue-100"
          }
        >
          {provider === "tango" ? "Tango" : "Blackhawk"}
        </Badge>
      );
    },
    filterFn: (row: any, id: any, value: any) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "brandName",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Brand" />
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
    accessorKey: "productName",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }: any) => {
      return (
        <div className="max-w-[300px]">
          <span className="truncate text-sm">
            {row.getValue("productName")}
          </span>
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
        <div className="max-w-[200px]">
          <span className="truncate text-sm text-muted-foreground">
            {title || "-"}
          </span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "minValue",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Min Value" />
    ),
    cell: ({ row }: any) => {
      const minValue = row.getValue("minValue");
      return <span className="font-mono text-sm">{formatCurrency(minValue)}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "maxValue",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Max Value" />
    ),
    cell: ({ row }: any) => {
      const maxValue = row.getValue("maxValue");
      return <span className="font-mono text-sm">{formatCurrency(maxValue)}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "rebatePercentage",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Rebate" />
    ),
    cell: ({ row }: any) => {
      const rebate = row.getValue("rebatePercentage");
      if (rebate === undefined || rebate === null) {
        return <span className="text-muted-foreground">-</span>;
      }
      return (
        <Badge variant="outline" className="font-mono">
          {Number(rebate).toFixed(2)}%
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "id",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Product ID" />
    ),
    cell: ({ row }: any) => {
      return (
        <span className="font-mono text-xs text-muted-foreground">
          {row.getValue("id")}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "cardExists",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }: any) => {
      const cardExists = row.getValue("cardExists");
      const associatedItems = row.original.associatedItems || [];
      const activeCount = associatedItems.filter(
        (item: any) => item.reward_status === "active"
      ).length;
      
      return (
        <div className="flex items-center">
          {cardExists ? (
            <Badge
              variant="default"
              className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"
            >
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Enabled
              {activeCount > 0 && (
                <span className="ml-1 text-xs">({activeCount})</span>
              )}
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
              View Details
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];