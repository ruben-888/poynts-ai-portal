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
import { MoreHorizontal, Eye, Link2, Link2Off } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { RewardSourceItem } from "@/types/reward-source-item";

// Status badge variant mapping
const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
  suspended: "destructive",
};

// Define columns for the source items data table
export const createSourceItemsColumns = (
  onViewItem: (item: RewardSourceItem) => void
): ColumnDef<RewardSourceItem>[] => [
  {
    id: "source",
    accessorKey: "source_fk",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Source" />
    ),
    cell: ({ row }) => {
      const sourceName = row.original.source?.name || row.original.source_fk;
      return (
        <Badge variant="outline" className="font-mono text-xs">
          {sourceName}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: false,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "source_identifier",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Identifier" />
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("source_identifier")}</span>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "reward.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Linked Reward" />
    ),
    cell: ({ row }) => {
      const reward = row.original.reward;
      const isLinked = !!row.original.reward_fk;

      if (!isLinked) {
        return (
          <span className="flex items-center gap-1 text-muted-foreground text-sm">
            <Link2Off className="h-3 w-3" />
            Unlinked
          </span>
        );
      }

      return (
        <span className="flex items-center gap-1 text-sm">
          <Link2 className="h-3 w-3 text-green-600" />
          {reward?.name || row.original.reward_fk}
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority") as number;
      return (
        <Badge variant="secondary" className="font-mono text-xs">
          {priority}
        </Badge>
      );
    },
    enableSorting: true,
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
        <Badge variant={statusVariants[status] || "secondary"}>
          {status}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "last_synced_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Last Synced" />
    ),
    cell: ({ row }) => {
      const lastSynced = row.getValue("last_synced_at") as string | undefined;
      if (!lastSynced) {
        return <span className="text-muted-foreground text-sm">Never</span>;
      }
      return (
        <span className="text-muted-foreground text-sm">
          {formatDistanceToNow(new Date(lastSynced), { addSuffix: true })}
        </span>
      );
    },
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
