"use client";

import { ColumnDef } from "@tanstack/react-table";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Brand } from "../types";

export const brandColumns: ColumnDef<Brand>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    cell: ({ row }) => {
      return <div className="w-[80px]">{row.getValue("id")}</div>;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "image",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Logo" />
    ),
    cell: ({ row }) => {
      const imageUrl = row.original.image;
      
      if (!imageUrl) {
        return (
          <div className="w-[50px] h-[50px] flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500">
            No Logo
          </div>
        );
      }
      
      return (
        <div className="w-[50px] h-[50px] flex items-center justify-center">
          <Image
            src={imageUrl}
            alt={row.getValue("name") || "Brand logo"}
            width={50}
            height={50}
            className="max-w-full max-h-full object-contain rounded"
          />
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "key",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand Key" />
    ),
    cell: ({ row }) => {
      const key = row.getValue("key") as string | undefined;
      return <div className="font-mono">{key || "-"}</div>;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.getValue("name")}
        </div>
      );
    },
  },
  {
    accessorKey: "display_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Display Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="max-w-[300px] truncate">
          {row.getValue("display_name")}
        </div>
      );
    },
  },
  {
    accessorKey: "tag",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tag" />
    ),
    cell: ({ row }) => {
      const tag = row.getValue("tag") as string | undefined;
      if (!tag) return <span className="text-muted-foreground">-</span>;
      
      return <Badge variant="secondary">{tag}</Badge>;
    },
    enableHiding: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string | undefined;
      if (!description) return <span className="text-muted-foreground">-</span>;
      
      // Strip HTML tags from description
      const plainDescription = description.replace(/<[^>]*>/g, "");
      
      return (
        <div className="max-w-[300px] truncate" title={plainDescription}>
          {plainDescription}
        </div>
      );
    },
    enableHiding: true,
  },
  {
    id: "tango_items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tango" />
    ),
    cell: ({ row }) => {
      const counts = row.original.itemCountsByProvider;
      const tangoCount = counts?.tango || 0;
      
      return (
        <div className="text-center font-mono">
          {tangoCount > 0 ? tangoCount : '-'}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "blackhawk_items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Blackhawk" />
    ),
    cell: ({ row }) => {
      const counts = row.original.itemCountsByProvider;
      const blackhawkCount = counts?.blackhawk || 0;
      
      return (
        <div className="text-center font-mono">
          {blackhawkCount > 0 ? blackhawkCount : '-'}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "amazon_items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amazon" />
    ),
    cell: ({ row }) => {
      const counts = row.original.itemCountsByProvider;
      const amazonCount = counts?.amazon || 0;
      
      return (
        <div className="text-center font-mono">
          {amazonCount > 0 ? amazonCount : '-'}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "tremendous_items",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tremendous" />
    ),
    cell: ({ row }) => {
      const counts = row.original.itemCountsByProvider;
      const tremendousCount = counts?.tremendous || 0;
      
      return (
        <div className="text-center font-mono">
          {tremendousCount > 0 ? tremendousCount : '-'}
        </div>
      );
    },
    enableSorting: true,
  },
];