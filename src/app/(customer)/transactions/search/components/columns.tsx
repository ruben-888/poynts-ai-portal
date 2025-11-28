"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format, formatDistanceToNow, isAfter, subDays } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DataTableRowActions,
  RowAction,
} from "@/components/data-table/data-table-row-actions";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define the transaction type based on the API response
export interface Transaction {
  id: number;
  result: string;
  giftcardId: number;
  cpid: string;
  mode: string;
  entityType: string;
  entid: number;
  memberid: number;
  poynts: number;
  orderAmount: number;
  providerReferenceId: string;
  providerId: number;
  rewardName: string;
  providerRewardId: string;
  rebateCustomerAmount: number;
  cpTransactionReference: string;
  custTransactionReference: string;
  message: string;
  date: string | null;
  cpidx: string;
  source: string | null;
  entName: string;
  giftcard?: {
    giftcardId: number;
    value: number;
    cpid: string;
    title: string;
    rewardName: string;
    brandName: string;
    utid: string;
  };
}

// Define columns for the data table
export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    enableHiding: true,
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const dateValue = row.original.date;

      if (dateValue) {
        try {
          const date = new Date(dateValue);
          const twoDaysAgo = subDays(new Date(), 2);

          // Format full date and time for tooltip
          const fullDateTime = format(date, "MMM d, yyyy h:mm:ss a");

          // If date is within the last two days, show relative time
          let displayTime;
          if (isAfter(date, twoDaysAgo)) {
            displayTime = formatDistanceToNow(date, { addSuffix: true });
          } else {
            // For older dates, use the original format
            displayTime = format(date, "MMM d h:mm a");
          }

          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default">{displayTime}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{fullDateTime}</p>
              </TooltipContent>
            </Tooltip>
          );
        } catch (e) {
          return "N/A";
        }
      }
      return "N/A";
    },
  },
  {
    accessorKey: "entName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    enableHiding: true,
  },
  {
    accessorKey: "rewardName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reward" />
    ),
  },
  {
    accessorKey: "orderAmount",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Amount" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-right">${row.original.orderAmount.toFixed(2)}</div>
      );
    },
    size: 100,
  },
  {
    accessorKey: "poynts",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Poynts" />
    ),
    cell: ({ row }) => {
      return <div className="text-right">{row.original.poynts}</div>;
    },
    size: 100,
  },
  {
    accessorKey: "result",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.original.result.toLowerCase();

      // Map status to appropriate badge variant
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default";
      let customClass = "";

      if (status === "success") {
        variant = "default";
        customClass = "bg-green-600 hover:bg-green-700 text-white";
      } else if (status === "failed") {
        variant = "destructive";
      } else if (status === "pending") {
        variant = "outline";
        customClass = "border-yellow-500 text-yellow-700";
      }

      return (
        <Badge variant={variant} className={cn("capitalize", customClass)}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "custTransactionReference",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Customer Ref. ID" />
    ),
  },
  // Add the missing columns needed for filtering
  {
    accessorKey: "source",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    enableHiding: true,
  },
  {
    id: "brand",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Brand" />
    ),
    accessorFn: (row) => row.giftcard?.brandName || "N/A",
    cell: ({ getValue }) => getValue(),
    enableHiding: true,
  },
  // Add a type column to distinguish between gift cards and offers
  {
    id: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    accessorFn: (row) => (row.giftcard ? "giftcard" : "offer"),
    enableHiding: true,
  },
  // Add member ID column
  {
    accessorKey: "memberid",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Member" />
    ),
    enableHiding: true,
  },
  // Add actions column with ellipsis menu
  {
    id: "actions",
    header: "Actions",
    enableSorting: false,
    cell: ({ row }) => {
      const transaction = row.original;

      const actions: RowAction<Transaction>[] = [
        {
          label: "View Details",
          onClick: (data) => {
            // This will be handled in the parent component via row meta
            document.dispatchEvent(
              new CustomEvent("transaction:view", { detail: data }),
            );
          },
        },
      ];

      return <DataTableRowActions row={row} actions={actions} />;
    },
  },
];
