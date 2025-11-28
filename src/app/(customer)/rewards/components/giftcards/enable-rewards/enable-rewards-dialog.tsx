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
import { GroupedReward } from "../../columns";
import { useState, useMemo, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";

// Define filter options
const typeOptions = [
  { value: "giftcard", label: "Gift Card" },
  { value: "offer", label: "Offer" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

export function EnableRewardsButton({
  disabledRewards,
  canManageRewards,
  rewardsManagmentEnabled,
}: {
  disabledRewards: GroupedReward[];
  canManageRewards: boolean;
  rewardsManagmentEnabled: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="mr-2"
        disabled={!(rewardsManagmentEnabled && canManageRewards)}
      >
        <Plus className="h-4 w-4 mr-2" />
        Enable Cards
        {disabledRewards.length > 0 && (
          <Badge className="ml-2" variant="secondary">
            {disabledRewards.length} available
          </Badge>
        )}
      </Button>
      <EnableRewardsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        rewards={disabledRewards}
      />
    </>
  );
}

export function EnableRewardsDialog({
  isOpen,
  onOpenChange,
  rewards,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  rewards: GroupedReward[];
}) {
  const [selectedRewards, setSelectedRewards] = useState<GroupedReward[]>([]);
  const [isEnabling, setIsEnabling] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});
  const queryClient = useQueryClient();

  // Dynamically build brand options from the data
  const brandOptions = useMemo(
    () =>
      Array.from(new Set(rewards?.map((reward) => reward.brand_name)))
        .filter(Boolean)
        .map((brand) => ({
          value: brand,
          label: brand,
        })),
    [rewards]
  );

  // Handle selection changes from DataTable moved into handleSelectionCountChange

  // Stable reference for onSelectionCountChange to avoid triggering
  // DataTable's effect on every render, which can cause an infinite
  // update loop ("Maximum update depth exceeded").
  const handleSelectionCountChange = useCallback(
    (_count: number, selectedRows: GroupedReward[]) => {
      setSelectedRewards(selectedRows);
    },
    []
  );

  // Handle enabling selected rewards
  const handleEnableRewards = async () => {
    if (selectedRewards.length === 0) return;

    try {
      setIsEnabling(true);

      // Prepare payload for API
      const payload = {
        tenant_id: "8", // This should come from a context or environment variable in a real app
        rewards: selectedRewards.map((reward) => ({
          cpid: reward.cpid,
          type: reward.type,
          items: reward.items.map((item) => ({
            redemption_id: item.redemption_id,
            redemption_type: item.type,
          })),
        })),
      };

      // Call the API
      const response = await axios.post("/api/rewards/enable-rewards", payload);

      if (response.data.success) {
        // Show success message
        toast.success(`Successfully enabled ${response.data.enabled} rewards`);

        // Invalidate and refetch the rewards query to update the UI
        await queryClient.invalidateQueries({ queryKey: ["rewards"] });

        // Close the dialog
        onOpenChange(false);
      } else {
        toast.error("Failed to enable rewards");
      }
    } catch (error) {
      console.error("Error enabling rewards:", error);
      toast.error("An error occurred while enabling rewards");
    } finally {
      setIsEnabling(false);
    }
  };

  // Define initial column visibility - hide brand and type by default
  const initialColumnVisibility = {
    brand_name: false,
    type: false,
    reward_status: true,
  };

  // Create columns similar to availableRewardsColumns
  const enableRewardsColumns = [
    {
      id: "select",
      header: ({ table }: { table: any }) => (
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
      cell: ({ row }: { row: any }) => (
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
      header: () => "",
      cell: ({ row }: { row: any }) => {
        const items = row.original.items;
        // Find the first item with an image
        const itemWithImage = items.find((item: any) => item.reward_image);
        if (!itemWithImage?.reward_image) {
          return <div className="w-[50px] h-[50px]"></div>;
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
      accessorKey: "title",
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Reward" />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "brand_name",
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Brand" />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "type",
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }: { row: any }) => {
        const type = row.getValue("type");
        return <div className="capitalize">{type}</div>;
      },
      enableSorting: true,
    },
    {
      accessorKey: "value",
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Value" />
      ),
      cell: ({ row }: { row: any }) => {
        const value = row.getValue("value");
        const valueType = row.original.value_type || "";
        return (
          <div>
            {valueType.toUpperCase().includes("PERCENT")
              ? `${value}%`
              : `$${value}`}
          </div>
        );
      },
      enableSorting: true,
    },
    {
      accessorKey: "poynts",
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Poynts" />
      ),
      enableSorting: true,
    },
    {
      accessorKey: "reward_status",
      header: ({ column }: any) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("reward_status");
        return <div className="capitalize">{status}</div>;
      },
      enableSorting: true,
    },
  ];

  // Create a custom action button for the DataTable
  const customActions = (
    <Button
      onClick={handleEnableRewards}
      disabled={selectedRewards.length === 0 || isEnabling}
    >
      {isEnabling
        ? "Enabling..."
        : `Enable Selected ${selectedRewards.length > 0 ? `(${selectedRewards.length})` : ""}`}
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
          <DataTable
            data={rewards}
            columns={enableRewardsColumns}
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
            rowSelection={rowSelection}
            onRowSelectionChange={setRowSelection}
            onSelectionCountChange={handleSelectionCountChange}
            customActions={customActions}
            enableRowSelection={true}
            showActionsButton={true}
            searchColumn={{
              id: "title",
              placeholder: "Search rewards...",
            }}
            rowIdField="cpid"
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
