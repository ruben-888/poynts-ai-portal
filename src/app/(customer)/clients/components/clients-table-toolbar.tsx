"use client";

import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";

// Define client type options
export const clientTypes = [
  { value: "CP", label: "CP" },
  { value: "Employer", label: "Employer" },
  { value: "Partner", label: "Partner" },
];

// Define status options
export const statusOptions = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

interface ClientsTableToolbarProps<TData> {
  table: Table<TData>;
}

export function ClientsTableToolbar<TData>({
  table,
}: ClientsTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Search by name..."
          value={
            (table.getColumn("ent_name")?.getFilterValue() as string) ?? ""
          }
          onChange={(event) =>
            table.getColumn("ent_name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("ent_type") && (
          <DataTableFacetedFilter
            column={table.getColumn("ent_type")}
            title="Type"
            options={clientTypes}
          />
        )}
        {table.getColumn("ent_status") && (
          <DataTableFacetedFilter
            column={table.getColumn("ent_status")}
            title="Status"
            options={statusOptions}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
