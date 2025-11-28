"use client";

import { Table } from "@tanstack/react-table";
import { X, RefreshCw, Download, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { cn } from "@/lib/utils";
import { downloadTableAsCSV } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  id: string;
  title: string;
  options: FilterOption[];
}

interface CustomToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: {
    id: string;
    placeholder?: string;
  };
  filters?: Filter[];
  data: TData[];
  onRefresh: () => void;
  isRefreshing: boolean;
  csvColumns: any[];
  csvFilename: string;
}

export function CustomToolbar<TData>({
  table,
  searchColumn,
  filters = [],
  data,
  onRefresh,
  isRefreshing,
  csvColumns,
  csvFilename,
}: CustomToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Search Input */}
        {searchColumn && table.getColumn(searchColumn.id) ? (
          <Input
            placeholder={
              searchColumn.placeholder ?? `Search by ${searchColumn.id}...`
            }
            value={
              (table.getColumn(searchColumn.id)?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) =>
              table
                .getColumn(searchColumn.id)
                ?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
        ) : null}

        {/* Filters */}
        {filters.map((filter) => {
          const column = table.getColumn(filter.id);
          if (!column) return null;

          return (
            <DataTableFacetedFilter
              key={filter.id}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          );
        })}

        {/* Reset Filters Button */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {/* 1. Refresh button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                className="h-8 flex items-center gap-1"
                disabled={isRefreshing}
              >
                <RefreshCw
                  className={cn("h-4 w-4", isRefreshing && "animate-spin")}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh data</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* 2. View options button */}
        <TooltipProvider>
          <Tooltip>
            <DropdownMenu>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 flex items-center gap-1"
                  >
                    <Settings2 className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent>
                <p>Select which columns to view</p>
              </TooltipContent>
              <DropdownMenuContent align="end" className="w-[150px]">
                <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {table
                  .getAllColumns()
                  .filter(
                    (column) =>
                      column.getCanHide() &&
                      column.id !== "select" &&
                      column.id !== "actions" &&
                      column.id !== "location" &&
                      column.id !== "rewards"
                  )
                  .map((column) => {
                    // Get a friendly display name for the column
                    let displayName = column.id;

                    // If column has a header, use that as the display name
                    if (typeof column.columnDef.header === "string") {
                      displayName = column.columnDef.header;
                    } else {
                      // Map raw column IDs to friendly names
                      const friendlyNames: Record<string, string> = {
                        ent_name: "Name",
                        ent_type: "Type",
                        ent_status: "Status",
                        members: "Members",
                        rewards: "Rewards",
                        location: "Location",
                        parent_name: "Parent Name",
                      };

                      displayName = friendlyNames[column.id] || column.id;
                    }

                    return (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }
                      >
                        {displayName}
                      </DropdownMenuCheckboxItem>
                    );
                  })}
              </DropdownMenuContent>
            </DropdownMenu>
          </Tooltip>
        </TooltipProvider>

        {/* 3. CSV button */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  downloadTableAsCSV(data, csvColumns, csvFilename)
                }
                className="h-8 flex items-center gap-1"
                disabled={!data?.length}
              >
                <Download className="h-4 w-4" />
                <span>CSV</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download CSV</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
