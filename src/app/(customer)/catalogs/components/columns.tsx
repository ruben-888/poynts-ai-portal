"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Catalog } from "./schema";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ManageCatalogDialog } from "./manage-catalog-dialog";
import { DeleteCatalogDialog } from "./delete-catalog-dialog";
import { useAuth } from "@clerk/nextjs";
import React from "react";

function CatalogActions({ catalog }: { catalog: Catalog }) {
  const { has } = useAuth();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const canManageCatalogs =
    has?.({ permission: "org:catalogs:manage" }) ?? false;

  const handleEditClick = React.useCallback(() => {
    setEditDialogOpen(true);
    setDropdownOpen(false);
  }, []);

  const handleCopyClick = React.useCallback(() => {
    setCopyDialogOpen(true);
    setDropdownOpen(false);
  }, []);

  const handleDeleteClick = React.useCallback(() => {
    setDeleteDialogOpen(true);
    setDropdownOpen(false);
  }, []);

  if (!canManageCatalogs) {
    return null;
  }

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
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
          <DropdownMenuItem onSelect={handleEditClick}>
            Edit Catalog
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleCopyClick}>
            Copy Catalog
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onSelect={handleDeleteClick}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManageCatalogDialog
        mode="edit"
        catalog={catalog}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <ManageCatalogDialog
        mode="copy"
        catalog={catalog}
        open={copyDialogOpen}
        onOpenChange={setCopyDialogOpen}
      />

      <DeleteCatalogDialog
        catalog={catalog}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  );
}

export const columns: ColumnDef<Catalog>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Catalog Name" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "client.name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Client" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "items_total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reward Items" />
    ),
    enableSorting: true,
  },
  {
    accessorKey: "created_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created Date" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_date"));
      return date.toLocaleDateString();
    },
    enableSorting: true,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      return <CatalogActions catalog={row.original} />;
    },
    enableSorting: false,
    enableHiding: false,
  },
];
