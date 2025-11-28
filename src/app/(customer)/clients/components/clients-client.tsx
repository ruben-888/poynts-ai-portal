"use client";

import { useClientColumns } from "./columns";
import { Client, clientsSchema } from "./schema";
import { ManageClientDialog } from "./manage-client-dialog";
import { ViewCatalogModal } from "./catalog/view-catalog-modal";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientTypes } from "./clients-table-toolbar";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CustomToolbar } from "./custom-toolbar";
import axios from "axios";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  Table as ReactTable,
  RowModel,
  HeaderGroup,
  Header,
  Row,
  Cell,
} from "@tanstack/react-table";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { useAuth } from "@clerk/nextjs";
import { useGateValue } from "@statsig/react-bindings";

async function getClients() {
  const response = await axios.get(`/api/clients`);
  return clientsSchema.parse(response.data);
}

export function ClientsClient() {
  const { has, isLoaded, isSignedIn } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();
  const columns = useClientColumns();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    location: false,
    parent_name: false,
    rewards: false,
  });
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [canManageClients, setCanManageClients] = useState(false);
  const clientsNewClientEnabled = useGateValue("clients_new_client_enabled");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [catalogModalOpen, setCatalogModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: getClients,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    staleTime: Infinity,
  });

  // Set canManageClients when auth is loaded
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      const hasPermission = has({
        permission: "org:clients:manage",
      });
      setCanManageClients(hasPermission);
    }
  }, [isLoaded, isSignedIn, has]);

  // Update column visibility after auth check
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      setColumnVisibility((prev) => ({
        ...prev,
      }));
    }
  }, [canManageClients, isLoaded, isSignedIn]);

  // Initialize the table at the top level of the component
  const table = useReactTable({
    data: data || [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      pagination,
    },
    enableRowSelection: false,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  // Function to handle refresh
  const handleRefresh = async () => {
    // Set refreshing state to true
    setIsRefreshing(true);

    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["clients"] });
    } finally {
      // Set refreshing state back to false when done
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Small delay to ensure animation is visible
    }
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading clients...
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading clients...
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

  // Calculate totals for display
  const totalClients = data?.length || 0;
  const totalMembers =
    data?.reduce((sum, client) => sum + (client.member_count || 0), 0) || 0;

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-4 md:p-8 flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Clients</h2>
          <p className="text-muted-foreground mb-4">
            {totalClients.toLocaleString()} Total Client
            {totalClients !== 1 ? "s" : ""} • {totalMembers.toLocaleString()}{" "}
            Total Member{totalMembers !== 1 ? "s" : ""}
          </p>
        </div>
        {canManageClients && clientsNewClientEnabled && (
          <ManageClientDialog>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </ManageClientDialog>
        )}
      </div>

      {/* Table with custom toolbar to control button order */}
      <div className="space-y-4">
        <CustomToolbar
          table={table}
          searchColumn={{
            id: "ent_name",
            placeholder: "Search by name...",
          }}
          filters={[
            {
              id: "ent_type",
              title: "Type",
              options: clientTypes,
            },
            {
              id: "ent_status",
              title: "Status",
              options: [
                // Use lowercase values to match database case
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
          data={data ?? []}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          csvColumns={[
            { accessorKey: "ent_id", header: "ID" },
            { accessorKey: "ent_name", header: "Name" },
            { accessorKey: "ent_type", header: "Type" },
            { accessorKey: "ent_status", header: "Status" },
            { accessorKey: "ent_desc", header: "Description" },
            { accessorKey: "ent_id_parent", header: "Parent ID" },
            { accessorKey: "parent_name", header: "Parent Name" },
            { accessorKey: "ent_startDate", header: "Start Date" },
            { accessorKey: "ent_phone", header: "Phone" },
            { accessorKey: "ent_address", header: "Address" },
            { accessorKey: "ent_city", header: "City" },
            { accessorKey: "ent_state", header: "State" },
            { accessorKey: "ent_zip", header: "ZIP" },
            { accessorKey: "member_count", header: "Members" },
            { accessorKey: "rewards_count", header: "Rewards" },
          ]}
          csvFilename="carepoynt-clients-export"
        />
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table
                .getHeaderGroups()
                .map((headerGroup: HeaderGroup<Client>) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map(
                      (header: Header<Client, unknown>) => {
                        return (
                          <TableHead key={header.id} colSpan={header.colSpan}>
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext()
                                )}
                          </TableHead>
                        );
                      }
                    )}
                  </TableRow>
                ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row: Row<Client>) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    onDoubleClick={() => {
                      setSelectedClient(row.original);
                      setCatalogModalOpen(true);
                    }}
                    className="cursor-pointer"
                  >
                    {row
                      .getVisibleCells()
                      .map((cell: Cell<Client, unknown>) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <DataTablePagination table={table} enableRowSelection={false} />
      </div>

      {selectedClient && (
        <ViewCatalogModal
          clientId={selectedClient.ent_id.toString()}
          clientName={selectedClient.ent_name}
          isOpen={catalogModalOpen}
          onClose={() => {
            setCatalogModalOpen(false);
            setSelectedClient(null);
          }}
        />
      )}
    </div>
  );
}
