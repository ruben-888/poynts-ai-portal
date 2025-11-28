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

// Define columns for the Tremendous catalog data table
export const createTremendousCatalogColumns = (
  onViewCard: (product: any) => void
) => [
  {
    accessorKey: "name",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Product Name" />
    ),
    cell: ({ row }: any) => {
      return (
        <div>
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "category",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }: any) => {
      const category = row.getValue("category");
      return (
        <Badge variant="outline" className="capitalize">
          {category?.replace(/_/g, " ")}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "currency_codes",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Currency" />
    ),
    cell: ({ row }: any) => {
      const currencies = row.getValue("currency_codes") as string[];
      return (
        <div className="flex gap-1">
          {currencies?.slice(0, 2).map((currency) => (
            <Badge key={currency} variant="secondary" className="font-mono text-xs">
              {currency}
            </Badge>
          ))}
          {currencies?.length > 2 && (
            <Badge variant="secondary" className="text-xs">
              +{currencies.length - 2}
            </Badge>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "skus.0.min",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Min Value" />
    ),
    cell: ({ row }: any) => {
      const minValue = row.original.skus?.[0]?.min;
      return <span className="font-mono">{formatCurrency(minValue)}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "skus.0.max",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Max Value" />
    ),
    cell: ({ row }: any) => {
      const maxValue = row.original.skus?.[0]?.max;
      return <span className="font-mono">{formatCurrency(maxValue)}</span>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "countries",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Countries" />
    ),
    cell: ({ row }: any) => {
      const countries = row.getValue("countries") as { abbr: string }[];
      const countryCount = countries?.length || 0;
      const hasUS = countries?.some((c) => c.abbr === "US");
      
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
    accessorKey: "id",
    header: ({ column }: any) => (
      <DataTableColumnHeader column={column} title="Product ID" />
    ),
    cell: ({ row }: any) => {
      return (
        <span className="font-mono text-xs">
          {row.getValue("id")}
        </span>
      );
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