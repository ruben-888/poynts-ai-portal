"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface Filter {
  id: string;
  title: string;
  options: FilterOption[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
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
  filters?: Filter[];
  onRowClick?: (row: Row<TData>) => void;
  onRowDoubleClick?: (row: Row<TData>) => void;
  selectedRowId?: string | null;
  rowIdField?: keyof TData;
  enableRowSelection?: boolean;
  customActions?: React.ReactNode;
  enableRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  initialColumnVisibility?: VisibilityState;
  disablePagination?: boolean;
  showViewOptions?: boolean;
  showActionsButton?: boolean;
  enableCSVExport?: boolean;
  csvFilename?: string;
  enableColumnFilters?: boolean;
  enableFilters?: boolean;
  initialPageSize?: number;
  rowSelection?: Record<string, boolean>;
  onRowSelectionChange?: (selection: Record<string, boolean>) => void;
  onSelectionCountChange?: (count: number, selectedRows: TData[]) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumn,
  searchableColumns = [],
  searchPlaceholder = "Search...",
  searchInputWidth,
  filters = [],
  onRowClick,
  onRowDoubleClick,
  selectedRowId,
  rowIdField = "id" as keyof TData,
  enableRowSelection = true,
  customActions,
  enableRefresh = false,
  onRefresh,
  isRefreshing = false,
  initialColumnVisibility = {},
  disablePagination = false,
  showViewOptions = true,
  showActionsButton = true,
  enableCSVExport = false,
  csvFilename = "data-export",
  enableColumnFilters = true,
  enableFilters = true,
  initialPageSize = 10,
  rowSelection: externalRowSelection,
  onRowSelectionChange,
  onSelectionCountChange,
}: DataTableProps<TData, TValue>) {
  const [internalRowSelection, setInternalRowSelection] = React.useState({});

  // Use external row selection if provided, otherwise use internal state
  const rowSelection = externalRowSelection ?? internalRowSelection;

  // Handle row selection changes
  const handleRowSelectionChange = React.useCallback(
    (updaterOrValue: any) => {
      const newSelection =
        typeof updaterOrValue === "function"
          ? updaterOrValue(rowSelection)
          : updaterOrValue;

      if (onRowSelectionChange) {
        onRowSelectionChange(newSelection);
      } else {
        setInternalRowSelection(newSelection);
      }
    },
    [rowSelection, onRowSelectionChange]
  );

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState<string>("");

  // Track click timing for double click detection
  const [lastClickTime, setLastClickTime] = React.useState(0);
  const [lastClickedRowId, setLastClickedRowId] = React.useState<string | null>(
    null
  );

  // Filter out the select column when enableRowSelection is false
  const filteredColumns = React.useMemo(() => {
    if (!enableRowSelection) {
      return columns.filter((col) => col.id !== "select");
    }
    return columns;
  }, [columns, enableRowSelection]);

  // Function to handle global search across multiple columns
  const handleGlobalSearch = React.useCallback((value: string) => {
    setGlobalFilter(value);
  }, []);

  const handleRowClick = React.useCallback(
    (row: Row<TData>) => {
      const currentTime = new Date().getTime();
      const rowId = String(row.original[rowIdField]);

      if (lastClickedRowId === rowId && currentTime - lastClickTime < 500) {
        // Double click detected
        onRowDoubleClick?.(row);
        setLastClickTime(0);
        setLastClickedRowId(null);
      } else {
        // Single click
        onRowClick?.(row);
        setLastClickTime(currentTime);
        setLastClickedRowId(rowId);
      }
    },
    [lastClickTime, lastClickedRowId, onRowClick, onRowDoubleClick, rowIdField]
  );

  // Custom filter function for global search across multiple columns
  const fuzzyFilter = React.useCallback(
    (row: Row<TData>, columnId: string, filterValue: string) => {
      const value = String(row.getValue(columnId) || "").toLowerCase();
      return value.includes(filterValue.toLowerCase());
    },
    []
  );

  // Initialize pagination state
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const table = useReactTable({
    data,
    columns: filteredColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection,
    onRowSelectionChange: handleRowSelectionChange,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    globalFilterFn: fuzzyFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getRowId: (originalRow: TData, index: number) => {
      const value = (originalRow as any)[rowIdField];
      return value !== undefined && value !== null
        ? String(value)
        : String(index);
    },
    enableColumnFilters,
    enableFilters,
  });

  React.useEffect(() => {
    if (onSelectionCountChange) {
      const selectedRows = data.filter((row) => {
        const rowId = String(row[rowIdField]);
        return (rowSelection as Record<string, boolean>)[rowId];
      });
      onSelectionCountChange(Object.keys(rowSelection).length, selectedRows);
    }
  }, [rowSelection, data, rowIdField, onSelectionCountChange]);

  // Derive the noun used for the result count from the search placeholder (e.g., "Search rewards...")
  const derivedNoun = React.useMemo(() => {
    // Prefer placeholder from searchColumn, fallback to generic searchPlaceholder
    const placeholderText = searchColumn?.placeholder ?? searchPlaceholder;
    // Remove the leading "Search" word (case-insensitive) and trailing ellipsis / periods
    const withoutSearch = placeholderText.replace(/^[Ss]earch\s+/, "");
    const cleaned = withoutSearch.replace(/\.\.\.|\.+$/, "").trim();
    return cleaned.length > 0 ? cleaned.toLowerCase() : "result";
  }, [searchColumn?.placeholder, searchPlaceholder]);

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchColumn={searchColumn}
        searchableColumns={searchableColumns}
        searchPlaceholder={searchPlaceholder}
        searchInputWidth={searchInputWidth}
        globalFilter={globalFilter}
        onGlobalFilterChange={handleGlobalSearch}
        filters={filters}
        customActions={customActions}
        enableRefresh={enableRefresh}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        showViewOptions={showViewOptions}
        showActionsButton={enableRowSelection && showActionsButton}
        enableCSVExport={enableCSVExport}
        allColumns={columns}
        data={data}
        csvFilename={csvFilename}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
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
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(
                    (onRowClick || onRowDoubleClick) &&
                      "cursor-pointer hover:bg-muted/50",
                    selectedRowId &&
                      selectedRowId === String(row.original[rowIdField])
                      ? "bg-muted"
                      : ""
                  )}
                  onClick={() => handleRowClick(row)}
                >
                  {row.getVisibleCells().map((cell) => (
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
      {!disablePagination && (
        <DataTablePagination
          table={table}
          enableRowSelection={enableRowSelection}
          noun={derivedNoun}
        />
      )}
    </div>
  );
}
