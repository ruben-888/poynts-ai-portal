"use client";

import { ColumnDef, Table as TableType, Row } from "@tanstack/react-table";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { GroupedReward } from "../columns";
import { Badge } from "@/components/ui/badge";

// This generates a simplified set of columns for the available rewards dialog
export function generateAvailableRewardsColumns(): ColumnDef<GroupedReward>[] {
  return [
    {
      id: "select",
      header: ({ table }: { table: TableType<GroupedReward> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }: { row: Row<GroupedReward> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        // Find the first item with an image
        const itemWithImage = items.find((item) => item.reward_image);
        if (!itemWithImage?.reward_image) {
          return <div className="w-[50px] h-[50px]"></div>;
        }
        return (
          <div className="w-[50px] h-[50px] flex items-center justify-center">
            <Image
              src={itemWithImage.reward_image}
              alt={row.getValue("title") || "Reward image"}
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("title")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "brand_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[300px] truncate">
              {row.getValue("brand_name")}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as "giftcard" | "offer";
        return (
          <div className="flex w-[100px] items-center">
            <Badge variant="outline">
              {type === "giftcard" ? "Gift Card" : "Offer"}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "reward_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.getValue("reward_status") as string;
        return (
          <div className="flex items-center">
            <Badge variant={status === "active" ? "default" : "secondary"}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span>${row.getValue("value")}</span>
          </div>
        );
      },
    },
  ];
}

// Default columns for use in the available rewards dialog
export const availableRewardsColumns = generateAvailableRewardsColumns();
