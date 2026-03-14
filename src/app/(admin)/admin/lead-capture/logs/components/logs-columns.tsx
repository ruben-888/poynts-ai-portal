"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { LeadCaptureLog } from "../../lib/schemas";

const statusVariants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "outline",
  ai_complete: "secondary",
  reward_sent: "default",
  failed: "destructive",
  test: "secondary",
};

export const createLogsColumns = (
  onView: (log: LeadCaptureLog) => void,
): ColumnDef<LeadCaptureLog>[] => [
  {
    accessorKey: "first_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => {
      const first = row.original.first_name || "";
      const last = row.original.last_name || "";
      const name = `${first} ${last}`.trim();
      return <span className="font-medium">{name || "--"}</span>;
    },
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("email") || "--"}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge variant={statusVariants[status] || "secondary"}>
          {status.replace("_", " ")}
        </Badge>
      );
    },
    enableSorting: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "archetype_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Archetype" />,
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("archetype_name") || "--"}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "ai_top_pick_name",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Top Pick" />,
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("ai_top_pick_name") || "--"}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "ai_top_pick_score",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Score" />,
    cell: ({ row }) => {
      const score = row.getValue("ai_top_pick_score") as number | undefined;
      return score != null ? (
        <span className="font-mono text-sm">{score}</span>
      ) : (
        <span className="text-muted-foreground">--</span>
      );
    },
    enableSorting: true,
  },
  {
    accessorKey: "linkedin_enriched",
    header: ({ column }) => <DataTableColumnHeader column={column} title="LinkedIn" />,
    cell: ({ row }) => {
      const enriched = row.getValue("linkedin_enriched") as boolean | undefined;
      return enriched ? (
        <Badge variant="default" className="text-xs">Yes</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">No</span>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => <DataTableColumnHeader column={column} title="Created" />,
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      if (!date) return <span className="text-muted-foreground">--</span>;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
        </span>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onView(row.original);
        }}
      >
        <Eye className="mr-1 h-4 w-4" />
        View
      </Button>
    ),
  },
];
