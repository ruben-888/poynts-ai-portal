"use client";

import { ColumnDef, Table as TableType, Row } from "@tanstack/react-table";
import Image from "next/image";
import { format, isValid, parseISO } from "date-fns";
import { ImageIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import {
  DataTableRowActions,
  RowAction,
} from "@/components/data-table/data-table-row-actions";
import { GroupedReward } from "@/app/api/rewards/types";

// Define status options
const rewardStatuses = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

// Define language options
const languages = [
  { value: "EN", label: "English" },
  { value: "ES", label: "Spanish" },
  { value: "FR", label: "French" },
];

// Create fixed actions that don't depend on external state
const getRewardActions = (
  onRowAction?: (row: GroupedReward) => void,
  onRemoveReward?: (row: GroupedReward) => void,
  onCopyOffer?: (row: GroupedReward) => void,
  rewardsRemoveEnabled: boolean = true
): RowAction<GroupedReward>[] => {
  const actions: RowAction<GroupedReward>[] = [
    {
      label: (reward: GroupedReward) =>
        reward.type === "giftcard" ? "Edit Gift Card" : "Edit Offer",
      onClick: (reward) => {
        onRowAction?.(reward);
      },
    },
  ];

  // Add Copy Offer action for offers only
  if (onCopyOffer) {
    actions.push({
      label: "Copy Offer",
      onClick: (reward) => {
        onCopyOffer(reward);
      },
      show: (reward) => reward.type === "offer",
      shortcut: "⌘D",
    });
  }

  // Only add the Remove action if it's enabled
  if (rewardsRemoveEnabled) {
    actions.push({
      label: "Remove",
      onClick: (reward) => {
        onRemoveReward?.(reward);
      },
      isDestructive: true,
      shortcut: "⌘⌫",
    });
  }

  return actions;
};

// Action cell component that doesn't rely on context
const getRewardActionsCell = (
  onRowAction?: (row: GroupedReward) => void,
  onRemoveReward?: (row: GroupedReward) => void,
  onCopyOffer?: (row: GroupedReward) => void,
  rewardsRemoveEnabled: boolean = true
) => {
  return function RewardActionsCell({ row }: { row: Row<GroupedReward> }) {
    const actions = getRewardActions(
      onRowAction,
      onRemoveReward,
      onCopyOffer,
      rewardsRemoveEnabled
    );
    return <DataTableRowActions row={row} actions={actions} />;
  };
};

// This generates the columns without any external dependencies
export function generateColumns(
  onRowAction?: (row: GroupedReward) => void,
  onRemoveReward?: (row: GroupedReward) => void,
  rewardsManagementEnabled: boolean = true,
  rewardsRemoveEnabled: boolean = true,
  onCopyOffer?: (row: GroupedReward) => void
): ColumnDef<GroupedReward>[] {
  // Shared date formatting function
  const formatDate = (date: any) => {
    if (!date || (typeof date === "object" && Object.keys(date).length === 0)) return null;
    try {
      const dateObj = typeof date === "string" ? parseISO(date) : new Date(date);
      return isValid(dateObj) ? format(dateObj, 'MM/dd/yyyy') : null;
    } catch {
      return null;
    }
  };

  // Create the base columns
  const baseColumns: ColumnDef<GroupedReward>[] = [
    {
      id: "select",
      header: ({ table }: { table: TableType<GroupedReward> }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }: { row: Row<GroupedReward> }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        // Find the first item with an image
        const itemWithImage = items.find((item) => item.reward_image);
        if (!itemWithImage?.reward_image) {
          return (
            <div className="w-[50px] h-[50px] flex items-center justify-center">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          );
        }
        
        // Validate URL before using it
        const isValidUrl = (url: string): boolean => {
          try {
            new URL(url);
            return true;
          } catch {
            return false;
          }
        };
        
        if (!isValidUrl(itemWithImage.reward_image)) {
          return (
            <div className="w-[50px] h-[50px] flex items-center justify-center bg-gray-100 rounded">
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
            </div>
          );
        }
        
        return (
          <div className="w-[50px] h-[50px] flex items-center justify-center">
            <Image
              src={itemWithImage.reward_image}
              alt={row.getValue("title") || "Reward image"}
              width={50}
              height={50}
              className="max-w-full max-h-full object-contain rounded"
            />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "cpid",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CPID" />
      ),
      cell: ({ row }) => {
        return (
          <div className="w-[175px] font-medium">{row.getValue("cpid")}</div>
        );
      },
    },
    {
      id: "cpidx_values",
      accessorFn: (row) => {
        // Gather all cpidx values from items; for offers there is typically only one
        const cpidxList = row.items
          .map((item) => item.cpidx)
          .filter((val) => Boolean(val));
        return cpidxList.join(", ") || "-";
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="CPIDX" />
      ),
      cell: ({ row }) => {
        const reward = row.original as GroupedReward;
        // Get items with their cpidx and status
        const itemsWithCpidx = reward.items.filter((item) => Boolean(item.cpidx));
        
        if (itemsWithCpidx.length === 0) {
          return <div className="w-[250px] font-medium">-</div>;
        }
        
        return (
          <div className="w-[250px] font-medium space-y-1">
            {itemsWithCpidx.map((item, index) => (
              <div
                key={index}
                className={item.reward_status === "inactive" ? "text-gray-500" : ""}
                style={{ wordBreak: "break-all" }}
              >
                {item.cpidx}
              </div>
            ))}
          </div>
        );
      },
      enableHiding: true,
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      accessorKey: "brand_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("brand_name")}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("title")}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "value",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }) => {
        const valueType = row.getValue("value_type") as string;
        const isFixedValue = valueType === "FIXED_VALUE";

        return (
          <div className="flex items-center">
            <span>${row.getValue("value")}</span>
            {isFixedValue && (
              <span className="text-muted-foreground text-xs ml-1 opacity-70">
                (Fixed)
              </span>
            )}
          </div>
        );
      },
    },
    {
      id: "dates",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="DATES" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        if (!items || items.length === 0) {
          return <div className="flex items-center">-</div>;
        }

        const first = items[0];

        const formatDate = (date: any) => {
          if (!date) return "";
          if (typeof date === "object" && Object.keys(date).length === 0)
            return "";
          if (typeof date === "string") {
            return date.includes("T") ? date.split("T")[0] : date;
          }
          if (date instanceof Date) return date.toISOString().split("T")[0];
          return String(date);
        };

        const start = formatDate(first.startdate);
        const end = formatDate(first.enddate);

        const display = start || end ? `${start || "?"} → ${end || "?"}` : "-";

        return (
          <div
            className="w-[140px] font-medium"
            style={{ wordBreak: "break-all" }}
          >
            {display}
          </div>
        );
      },
      enableHiding: true,
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      accessorKey: "poynts",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Poynts" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span>{row.getValue("poynts")}</span>
          </div>
        );
      },
      enableHiding: true,
      enableSorting: true,
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      id: "start_date",
      accessorFn: (row) => {
        const items = row.items;
        if (!items || items.length === 0) return null;
        const first = items[0];
        return formatDate(first.startdate);
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Start Date" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        if (!items || items.length === 0) {
          return <div className="flex items-center">-</div>;
        }

        const first = items[0];
        const startDate = formatDate(first.startdate);

        return (
          <div className="w-[110px] font-medium">
            {startDate || "-"}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      id: "end_date",
      accessorFn: (row) => {
        const items = row.items;
        if (!items || items.length === 0) return null;
        const first = items[0];
        return formatDate(first.enddate);
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="End Date" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        if (!items || items.length === 0) {
          return <div className="flex items-center">-</div>;
        }

        const first = items[0];
        const endDate = formatDate(first.enddate);

        return (
          <div className="w-[110px] font-medium">
            {endDate || "-"}
          </div>
        );
      },
      enableSorting: true,
      enableHiding: true,
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      accessorKey: "value_type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Value Type" />
      ),
      cell: ({ row }) => {
        const valueType = row.getValue("value_type") as string;
        return (
          <div className="flex items-center">
            <span>
              {valueType === "VARIABLE_VALUE"
                ? "Variable"
                : valueType === "FIXED_VALUE"
                  ? "Fixed"
                  : valueType}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "language",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Language" />
      ),
      cell: ({ row }) => {
        const language = languages.find(
          (lang) => lang.value === row.getValue("language")
        );

        if (!language) {
          return row.getValue("language");
        }

        return (
          <div className="flex items-center">
            <Badge variant="outline">{language.label}</Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.getValue("type") as "giftcard" | "offer";
        return (
          <div className="flex w-[100px] items-center">
            <Badge variant="outline">
              {type === "giftcard" ? "Gift Card" : "Offer"}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      accessorKey: "source_count",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source Count" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <span>{row.getValue("source_count")}</span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const sourceCount = row.getValue(id) as number;
        return value.includes(sourceCount.toString());
      },
      enableHiding: true,
      enableSorting: true,
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      accessorKey: "tags",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tags" />
      ),
      cell: ({ row }) => {
        const tags = row.getValue("tags") as string | null;
        if (!tags) {
          return <div className="flex items-center">-</div>;
        }

        const tagList = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        if (tagList.length === 0) {
          return <div className="flex items-center">-</div>;
        }

        return (
          <div className="flex flex-wrap gap-1">
            {tagList.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {tagList.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tagList.length - 3} more
              </Badge>
            )}
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const tags = row.getValue(id) as string | null;
        if (!tags) return false;

        const tagList = tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        return value.some((selectedTag: string) =>
          tagList.includes(selectedTag)
        );
      },
      enableHiding: true,
      enableSorting: true,
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      id: "source_detail",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sources" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        // Extract all source letters
        const sourceItems = items.filter((item) => item.source_letter);

        if (sourceItems.length === 0) {
          return <div className="flex items-center">-</div>;
        }

        // Sort the source items alphabetically by source_letter
        const sortedSourceItems = [...sourceItems].sort((a, b) => {
          return (a.source_letter || "").localeCompare(b.source_letter || "");
        });

        return (
          <div className="flex items-center gap-1">
            {sortedSourceItems.map((item, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium cursor-pointer ${
                      item.reward_status === "active"
                        ? "bg-green-100 border border-green-200 text-green-800"
                        : item.reward_status === "suspended"
                          ? "bg-amber-100 border border-amber-200 text-amber-800"
                          : "bg-gray-100 border border-gray-200 text-gray-500"
                    }`}
                  >
                    {item.source_letter}
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="bg-white text-black border border-gray-200 shadow-md p-3 max-w-[300px] [&>svg]:hidden"
                  sideOffset={5}
                >
                  <table className="w-full text-xs border-spacing-0">
                    <tbody>
                      <tr>
                        <td className="font-medium text-gray-500 pr-3 py-0.5">
                          Source:
                        </td>
                        <td>{item.source_letter}</td>
                      </tr>
                      {/* <tr>
                        <td className="font-medium text-gray-500 pr-3 py-0.5">
                          Latency:
                        </td>
                        <td>
                          {item.source_letter === "B"
                            ? "145ms"
                            : item.source_letter === "C"
                              ? "892ms"
                              : item.source_letter === "D"
                                ? "456ms"
                                : "N/A"}
                        </td>
                      </tr> */}
                      <tr>
                        <td className="font-medium text-gray-500 pr-3 py-0.5">
                          CPID:
                        </td>
                        <td style={{ wordBreak: "break-all" }}>{item.cpidx}</td>
                      </tr>
                      <tr>
                        <td className="font-medium text-gray-500 pr-3 py-0.5">
                          Availability:
                        </td>
                        <td
                          className={`${
                            item.reward_availability === "AVAILABLE"
                              ? "text-green-600"
                              : item.reward_availability === "UNAVAILABLE"
                                ? "text-red-600"
                                : "text-amber-600"
                          }`}
                        >
                          {item.reward_availability.charAt(0).toUpperCase() +
                            item.reward_availability.slice(1).toLowerCase()}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-medium text-gray-500 pr-3 py-0.5">
                          Status:
                        </td>
                        <td
                          className={`${
                            item.reward_status === "active"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {item.reward_status.charAt(0).toUpperCase() +
                            item.reward_status.slice(1).toLowerCase()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        );
      },
      enableHiding: true,
      meta: {
        hidden: true, // Hidden by default in the view menu
      },
    },
    {
      id: "source_a",
      accessorFn: (row) => {
        return row.items.some((item) => item.source_letter === "A") ? 1 : 0;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source A" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        const hasSourceA = items.some((item) => item.source_letter === "A");
        
        return (
          <div className="flex items-center justify-center">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              hasSourceA 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {hasSourceA ? "Yes" : "No"}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const hasSourceA_A = rowA.original.items.some((item: any) => item.source_letter === "A");
        const hasSourceA_B = rowB.original.items.some((item: any) => item.source_letter === "A");
        return (hasSourceA_A ? 1 : 0) - (hasSourceA_B ? 1 : 0);
      },
    },
    {
      id: "source_b",
      accessorFn: (row) => {
        return row.items.some((item) => item.source_letter === "B") ? 1 : 0;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source B" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        const hasSourceB = items.some((item) => item.source_letter === "B");
        
        return (
          <div className="flex items-center justify-center">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              hasSourceB 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {hasSourceB ? "Yes" : "No"}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const hasSourceB_A = rowA.original.items.some((item: any) => item.source_letter === "B");
        const hasSourceB_B = rowB.original.items.some((item: any) => item.source_letter === "B");
        return (hasSourceB_A ? 1 : 0) - (hasSourceB_B ? 1 : 0);
      },
    },
    {
      id: "source_c",
      accessorFn: (row) => {
        return row.items.some((item) => item.source_letter === "C") ? 1 : 0;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Source C" />
      ),
      cell: ({ row }) => {
        const items = row.original.items;
        const hasSourceC = items.some((item) => item.source_letter === "C");
        
        return (
          <div className="flex items-center justify-center">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              hasSourceC 
                ? "bg-green-100 text-green-800" 
                : "bg-gray-100 text-gray-600"
            }`}>
              {hasSourceC ? "Yes" : "No"}
            </span>
          </div>
        );
      },
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const hasSourceC_A = rowA.original.items.some((item: any) => item.source_letter === "C");
        const hasSourceC_B = rowB.original.items.some((item: any) => item.source_letter === "C");
        return (hasSourceC_A ? 1 : 0) - (hasSourceC_B ? 1 : 0);
      },
    },
    {
      accessorKey: "reward_status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = rewardStatuses.find(
          (status) => status.value === row.getValue("reward_status")
        );

        if (!status) {
          return row.getValue("reward_status");
        }

        return (
          <div className="flex w-[100px] items-center">
            <Badge
              variant={status.value === "active" ? "outline" : "secondary"}
            >
              {status.label}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
  ];

  // Only add the actions column if management is enabled
  if (rewardsManagementEnabled) {
    baseColumns.push({
      id: "actions",
      header: "",
      cell: getRewardActionsCell(
        onRowAction,
        onRemoveReward,
        onCopyOffer,
        rewardsRemoveEnabled
      ),
      enableHiding: false,
    });
  }

  return baseColumns;
}

// Default columns for backward compatibility
export const columns = generateColumns();
