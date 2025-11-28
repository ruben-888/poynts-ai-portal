"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { availableRewardsColumns } from "./columns";
import { GroupedReward } from "../columns";
import { useState, useMemo } from "react";

// Define filter options
const typeOptions = [
  { value: "giftcard", label: "Gift Card" },
  { value: "offer", label: "Offer" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export function AvailableRewardsDialog({
  isOpen,
  onOpenChange,
  rewards,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rewards: GroupedReward[];
}) {
  const [selectedRewards, setSelectedRewards] = useState<GroupedReward[]>([]);

  // Dynamically build brand options from the data
  const brandOptions = useMemo(
    () =>
      Array.from(new Set(rewards?.map((reward) => reward.brand_name)))
        .filter(Boolean)
        .map((brand) => ({
          value: brand,
          label: brand,
        })),
    [rewards],
  );

  // Define initial column visibility - hide brand and type by default
  const initialColumnVisibility = {
    brand_name: false,
    type: false,
    reward_status: true,
  };

  // Create a custom action button for the DataTable
  const customActions = (
    <Button
      onClick={() => {
        // Logic to enable selected rewards would go here
        console.log("Enabling rewards:", selectedRewards);
        onOpenChange(false);
      }}
      disabled={selectedRewards.length === 0}
    >
      Enable Selected{" "}
      {selectedRewards.length > 0 && `(${selectedRewards.length})`}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-auto !sm:max-w-[1200px] !max-w-[1200px]"
        style={{ maxWidth: "1200px", width: "1200px" }}
      >
        <DialogHeader>
          <DialogTitle>Available Rewards</DialogTitle>
          <DialogDescription>
            Select rewards to enable and make visible to customers.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <SelectableDataTable
            data={rewards}
            columns={availableRewardsColumns}
            filters={[
              {
                id: "brand_name",
                title: "Brand",
                options: brandOptions,
              },
              {
                id: "type",
                title: "Type",
                options: typeOptions,
              },
              {
                id: "reward_status",
                title: "Status",
                options: statusOptions,
              },
            ]}
            initialColumnVisibility={initialColumnVisibility}
            onSelectedRowsChange={setSelectedRewards}
            customActions={customActions}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Wrapper around DataTable that tracks selected rows
function SelectableDataTable<TData extends object>({
  data,
  columns,
  filters,
  initialColumnVisibility,
  onSelectedRowsChange,
  customActions,
}: {
  data: TData[];
  columns: any;
  searchColumn?: { id: string; placeholder?: string };
  filters?: {
    id: string;
    title: string;
    options: { value: string; label: string }[];
  }[];
  initialColumnVisibility?: Record<string, boolean>;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  customActions?: React.ReactNode;
}) {
  // We'll use row click events to manually track selection
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>(
    {},
  );

  // When a row is clicked, toggle its selection
  const handleRowClick = (row: any) => {
    const rowId = row.original.cpid;
    const newSelectedRowIds = { ...selectedRowIds };

    if (newSelectedRowIds[rowId]) {
      delete newSelectedRowIds[rowId];
    } else {
      newSelectedRowIds[rowId] = true;
    }

    setSelectedRowIds(newSelectedRowIds);

    // Pass the selected rows up to the parent
    if (onSelectedRowsChange) {
      const selectedRows = data.filter(
        (item) => newSelectedRowIds[(item as any).cpid],
      );
      onSelectedRowsChange(selectedRows);
    }
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      filters={filters}
      initialColumnVisibility={initialColumnVisibility}
      enableRowSelection={true}
      onRowClick={handleRowClick}
      showActionsButton={true}
      customActions={customActions}
    />
  );
}
