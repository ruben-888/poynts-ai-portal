"use client";

import * as React from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RowAction<TData> {
  label: string | ((row: TData) => string);
  onClick: (row: TData) => void;
  isDestructive?: boolean;
  shortcut?: string;
  show?: (row: TData) => boolean;
}

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  actions: RowAction<TData>[];
}

export function DataTableRowActions<TData>({
  row,
  actions,
}: DataTableRowActionsProps<TData>) {
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
        {actions.map((action, index) => {
          if (action.show && !action.show(row.original)) {
            return null;
          }

          return action.isDestructive ? (
            <React.Fragment key={index}>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => action.onClick(row.original)}
              >
                {typeof action.label === "function"
                  ? action.label(row.original)
                  : action.label}
                {action.shortcut && (
                  <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            </React.Fragment>
          ) : (
            <DropdownMenuItem
              key={index}
              onSelect={() => action.onClick(row.original)}
            >
              {typeof action.label === "function"
                ? action.label(row.original)
                : action.label}
              {action.shortcut && (
                <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
