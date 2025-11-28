"use client";

import { Table } from "@tanstack/react-table";
import { X, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { downloadTableAsCSV } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  id: string;
  title: string;
  options: FilterOption[];
}

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: {
    id: string;
    placeholder?: string;
  };
  searchableColumns?: {
    id: string;
    displayName: string;
  }[];
  searchPlaceholder?: string;
  searchInputWidth?: string;
  globalFilter?: string;
  onGlobalFilterChange?: (value: string) => void;
  filters?: Filter[];
  customActions?: React.ReactNode;
  enableRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  showViewOptions?: boolean;
  showActionsButton?: boolean;
  enableCSVExport?: boolean;
  allColumns?: any[];
  data?: TData[];
  csvFilename?: string;
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchableColumns = [],
  searchPlaceholder = "Search...",
  searchInputWidth,
  globalFilter = "",
  onGlobalFilterChange,
  filters = [],
  customActions,
  enableRefresh = false,
  onRefresh,
  isRefreshing = false,
  showViewOptions = true,
  showActionsButton = true,
  enableCSVExport = false,
  allColumns = [],
  data = [],
  csvFilename = "data-export",
}: DataTableToolbarProps<TData>) {
  const isFiltered =
    table.getState().columnFilters.length > 0 || globalFilter !== "";
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  // Render refresh button
  const renderRefreshButton = () => (
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
          {/* <span>Refresh</span> */}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Refresh the data</p>
      </TooltipContent>
    </Tooltip>
  );

  // Render CSV export button
  const renderCSVExportButton = () => (
    <Button
      variant="outline"
      size="sm"
      onClick={() => downloadTableAsCSV(data, allColumns, csvFilename)}
      className="h-8 flex items-center gap-1"
      disabled={!data?.length}
    >
      <Download className="h-4 w-4" />
      <span>CSV</span>
    </Button>
  );

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Search Input - Either single column or global multi-column search */}
        {searchableColumns.length > 0 && onGlobalFilterChange ? (
          <Input
            placeholder={searchPlaceholder}
            value={globalFilter}
            onChange={(event) => onGlobalFilterChange(event.target.value)}
            className={searchInputWidth ? `h-8 ${searchInputWidth}` : "h-8 w-[150px] lg:w-[250px]"}
          />
        ) : searchColumn ? (
          <Input
            placeholder={
              searchColumn.placeholder ?? `Search by ${searchColumn.id}...`
            }
            value={
              (table.getColumn(searchColumn.id)?.getFilterValue() as string) ??
              ""
            }
            onChange={(event) => {
              const column = table.getColumn(searchColumn.id);
              if (column) {
                column.setFilterValue(event.target.value);
              }
            }}
            className={searchInputWidth ? `h-8 ${searchInputWidth}` : "h-8 w-[150px] lg:w-[250px]"}
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
              if (onGlobalFilterChange) {
                onGlobalFilterChange("");
              }
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {/* Custom Actions, Refresh Button, or Default Actions */}
        {customActions ? (
          customActions
        ) : (
          <>
            {enableRefresh && onRefresh && renderRefreshButton()}
            {showViewOptions && <DataTableViewOptions table={table} />}
            {showActionsButton &&
              table.getSelectedRowModel().rows.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      disabled={selectedRows.length === 0}
                    >
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Suspend</DropdownMenuItem>
                    <DropdownMenuItem>Un-Suspend</DropdownMenuItem>
                    <DropdownMenuItem variant="destructive">
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            {enableCSVExport && renderCSVExportButton()}
          </>
        )}
      </div>
    </div>
  );
}
