"use client";

import { useState, useEffect } from "react";
import { columns } from "./columns";
import { Catalog, catalogsSchema } from "./schema";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/data-table/data-table";
import { CatalogItems } from "./catalog-items";
import { ManageCatalogDialog } from "./manage-catalog-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

async function getCatalogs() {
  const response = await fetch(`/api/catalogs`);
  if (!response.ok) {
    throw new Error("Failed to fetch catalogs");
  }
  const data = await response.json();
  return catalogsSchema.parse(data);
}

export function CatalogsClient() {
  const { has, isLoaded, isSignedIn } = useAuth();
  const [selectedCatalog, setSelectedCatalog] = useState<number | null>(null);
  const [canManageCatalogs, setCanManageCatalogs] = useState(false);

  // Create initial column visibility state
  const initialColumnVisibility = {
    "client.name": false,
    created_date: false,
    actions: canManageCatalogs,
  };

  const { data, isLoading, isError, error } = useQuery<Catalog[]>({
    queryKey: ["catalogs"],
    queryFn: getCatalogs,
  });

  // Set canManageCatalogs when auth is loaded
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const hasPermission = has({
        permission: "org:catalogs:manage",
      });
      setCanManageCatalogs(hasPermission);
    }
  }, [isLoaded, isSignedIn, has]);

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading catalogs...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading catalogs...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error: {error.message}
      </div>
    );
  }

  const selectedCatalogData = data?.find(
    (catalog) => catalog.id === selectedCatalog
  );

  // Calculate totals for display
  const totalCatalogs = data?.length || 0;
  const totalClients = data
    ? new Set(data.map((catalog) => catalog.client.name)).size
    : 0;

  return (
    <div className="flex h-full flex-col">
      <div className="p-8 pb-4">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Catalogs</h2>
            <p className="text-muted-foreground">
              {totalCatalogs} Total Catalog{totalCatalogs !== 1 ? "s" : ""} •{" "}
              {totalClients} Client{totalClients !== 1 ? "s" : ""}
            </p>
          </div>
          <ManageCatalogDialog>
            <Button disabled={!canManageCatalogs}>
              <Plus className="mr-2 h-4 w-4" />
              Create Catalog
            </Button>
          </ManageCatalogDialog>
        </div>
      </div>
      <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg">
        <ResizablePanel defaultSize={40} minSize={30}>
          <div className="h-full p-8 pt-0">
            <DataTable
              data={data ?? []}
              columns={columns}
              searchableColumns={[
                {
                  id: "client.name",
                  displayName: "Client",
                },
                {
                  id: "name",
                  displayName: "Catalog Name",
                },
              ]}
              searchInputWidth="w-48"
              enableRowSelection={false}
              disablePagination={true}
              showActionsButton={false}
              initialColumnVisibility={initialColumnVisibility}
              initialPageSize={1000}
              onRowClick={(row) => setSelectedCatalog(row.original.id)}
              selectedRowId={selectedCatalog?.toString() || undefined}
              enableCSVExport={true}
              csvFilename="carepoynt-catalogs-export"
            />
          </div>
        </ResizablePanel>
        {selectedCatalog && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <CatalogItems
                catalogId={selectedCatalog.toString()}
                catalogName={selectedCatalogData?.name}
                onClose={() => setSelectedCatalog(null)}
                canManageCatalogs={canManageCatalogs}
              />
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}
