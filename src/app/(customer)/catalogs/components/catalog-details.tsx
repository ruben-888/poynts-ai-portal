"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DataTable } from "@/components/data-table/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, type ReactNode } from "react";

const catalogItemSchema = z.object({
  cp_id: z.string(),
  type: z.string(),
  title: z.string(),
  rank: z.number(),
  poynts: z.number().optional(),
});

const catalogItemsSchema = z.array(catalogItemSchema);

// Define catalog schema
const catalogSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

type CatalogItem = z.infer<typeof catalogItemSchema>;
type Catalog = z.infer<typeof catalogSchema>;

// Action cell component to fix the useState hook linter error
function ActionCell({ item }: { item: CatalogItem }) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRemoveItem = () => {
    // Here you would implement the actual removal logic
    console.log("Removing item with CPID:", item.cp_id);
    setDialogOpen(false);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDialogOpen(true)}>
            Remove item
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Removal</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove &ldquo;{item.title}&rdquo; from the
            catalog? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemoveItem}>
            Remove
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const columns: ColumnDef<CatalogItem>[] = [
  {
    accessorKey: "cp_id",
    header: "CPID",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "rank",
    header: "Priority",
  },
  {
    accessorKey: "poynts",
    header: "Poynts",
    cell: ({ row }) => {
      const poynts = row.getValue("poynts") || 0;
      return <div>{poynts as ReactNode}</div>;
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <ActionCell item={row.original} />,
  },
];

async function getCatalogItems(catalogId: string) {
  const response = await fetch(`/api/catalogs/${catalogId}/items`);
  if (!response.ok) {
    throw new Error("Failed to fetch catalog items");
  }
  const data = await response.json();
  return catalogItemsSchema.parse(data);
}

async function getCatalogDetails(catalogId: string) {
  const response = await fetch(`/api/catalogs/${catalogId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch catalog details");
  }
  const data = await response.json();
  return catalogSchema.parse(data);
}

interface CatalogDetailsProps {
  catalogId: string;
}

export function CatalogDetails({ catalogId }: CatalogDetailsProps) {
  const catalogQuery = useQuery<Catalog>({
    queryKey: ["catalog", catalogId],
    queryFn: () => getCatalogDetails(catalogId),
    enabled: !!catalogId,
  });

  const itemsQuery = useQuery<CatalogItem[]>({
    queryKey: ["catalog-items", catalogId],
    queryFn: () => getCatalogItems(catalogId),
    enabled: !!catalogId,
  });

  if (catalogQuery.isLoading || itemsQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading catalog...
      </div>
    );
  }

  if (catalogQuery.isError || itemsQuery.isError) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error: {(catalogQuery.error || itemsQuery.error)?.message}
      </div>
    );
  }

  return (
    <div className="h-full flex-1 space-y-4 p-8 pt-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold">{catalogQuery.data?.name}</h2>
        <p className="text-sm text-muted-foreground">Reward Items</p>
      </div>
      <DataTable
        data={itemsQuery.data ?? []}
        columns={columns}
        searchColumn={{
          id: "title",
          placeholder: "Search by title...",
        }}
      />
    </div>
  );
}
