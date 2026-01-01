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
import { MoreHorizontal, Eye, Building2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Organization } from "@/app/api/v1/(admin)/organizations/schema";

// Status badge variant mapping
const statusVariants: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  active: "default",
  inactive: "secondary",
  pending: "outline",
  suspended: "destructive",
};

// Define columns for the organizations data table
export const createOrganizationsColumns = (
  onViewItem: (item: Organization) => void
): ColumnDef<Organization>[] => [
  {
    id: "icon",
    header: "",
    cell: () => (
      <div className="flex items-center justify-center">
        <Building2 className="h-4 w-4 text-muted-foreground" />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("name") || "—"}</span>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => {
      const description = row.getValue("description") as string | null;
      return description ? (
        <span className="text-sm text-muted-foreground max-w-[300px] truncate block">
          {description}
        </span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "parent_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Parent Org" />
    ),
    cell: ({ row, table }) => {
      const parentId = row.getValue("parent_id") as string | null;
      if (!parentId) {
        return (
          <Badge variant="outline" className="text-xs">
            Root
          </Badge>
        );
      }

      // Find parent organization name from data
      const allData = table.getRowModel().rows.map((r) => r.original);
      const parent = allData.find((org) => org.id === parentId);

      return parent ? (
        <span className="text-sm">{parent.name}</span>
      ) : (
        <span className="font-mono text-xs text-muted-foreground">
          {parentId.slice(0, 8)}...
        </span>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      if (!status) return <span className="text-muted-foreground">—</span>;
      return (
        <Badge variant={statusVariants[status] || "secondary"}>{status}</Badge>
      );
    },
    enableSorting: true,
    enableHiding: true,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
  },
  {
    accessorKey: "auth_provider_org_id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Clerk Org" />
    ),
    cell: ({ row }) => {
      const authId = row.getValue("auth_provider_org_id") as string | null;
      return authId ? (
        <span className="font-mono text-xs">{authId.slice(0, 12)}...</span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return (
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(date), { addSuffix: true })}
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
