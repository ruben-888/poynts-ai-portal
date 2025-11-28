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
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";
import { z } from "zod";

// Define filter options
const typeOptions = [
  { value: "giftcard", label: "Gift Card" },
  { value: "offer", label: "Offer" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
];

// Define schema for rewards data validation that matches GroupedReward interface
const rewardSchema = z.object({
  cpid: z.string(),
  type: z.union([z.literal("giftcard"), z.literal("offer")]),
  title: z.string(),
  brand_name: z.string(),
  language: z.string(),
  value: z.number(),
  poynts: z.number(),
  source_count: z.number(),
  tenant_id: z.string(),
  reward_status: z.string(),
  reward_availability: z.string(),
  tags: z.string().nullable().optional(),
  startdate: z.string().optional(),
  enddate: z.string().optional(),
  is_enabled: z.boolean().default(true),
  value_type: z.string().optional(),
  description: z.string().optional(),
  disclaimer: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(
    z.object({
      redemption_registries_id: z.number().nullable(),
      tenant_id: z.string().optional(),
      redemption_id: z.union([z.string(), z.number()]),
      cpid: z.string(),
      redemption_type: z.string(),
      value: z.union([z.number(), z.string()]),
      poynts: z.union([z.number(), z.string()]),
      redem_value: z.number().optional(),
      name: z.string().nullable(),
      inventory_remaining: z.number().nullable(),
      title: z.string(),
      startdate: z.string().optional(),
      enddate: z.string().optional(),
      reward_status: z.string(),
      language: z.string(),
      reward_availability: z.string(),
      utid: z.string().optional(),
      value_type: z.string().optional(),
      tags: z.string().nullable().optional(),
      priority: z.number(),
      provider_id: z.number().optional(),
      cpidx: z.string(),
      type: z.string(),
      reward_image: z.string().optional(),
      source_letter: z.string().optional(),
      latency: z.union([z.string(), z.number()]).optional(),
      description: z.string().optional(),
      disclaimer: z.string().optional(),
      terms: z.string().optional(),
    })
  ),
});

const rewardsResponseSchema = z.object({
  success: z.boolean().optional(),
  data: z.array(rewardSchema),
});

type GroupedReward = z.infer<typeof rewardSchema>;

// Function to fetch enabled rewards data
async function getEnabledRewards(): Promise<GroupedReward[]> {
  try {
    const response = await axios.get(
      "/api/rewards/rewards-by-tenant?tenant_id=8"
    );

    // Parse and validate the data
    const validatedData = rewardsResponseSchema.parse(response.data);
    // Filter for enabled rewards only
    return validatedData.data.filter((reward) => reward.is_enabled);
  } catch (error) {
    // Log the detailed error for debugging
    if (error instanceof z.ZodError) {
      console.error(
        "Zod validation error:",
        JSON.stringify(error.format(), null, 2)
      );
    } else {
      console.error("Error fetching enabled rewards:", error);
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch enabled rewards"
    );
  }
}

// Function to add items to catalog
async function addItemsToCatalog(catalogId: string, items: any[]) {
  const response = await axios.post(`/api/catalogs/${catalogId}/items`, {
    items,
  });

  if (!response.data.success) {
    throw new Error("Failed to add items to catalog");
  }

  return response.data;
}

export function AddItemsButton({
  catalogId,
  onItemsAdded,
  currentItems = [],
  disabled = false,
}: {
  catalogId: string;
  onItemsAdded?: () => void;
  currentItems?: Array<{ cpid: string }>;
  disabled?: boolean;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch enabled rewards to show count
  const { data: allRewards } = useQuery({
    queryKey: ["enabled-rewards"],
    queryFn: getEnabledRewards,
    enabled: true, // Auto-fetch to show available count
  });

  // Calculate available rewards count
  const availableCount = useMemo(() => {
    if (!allRewards) return 0;
    const currentCpids = new Set(currentItems.map((item) => item.cpid));
    return allRewards.filter((reward) => !currentCpids.has(reward.cpid)).length;
  }, [allRewards, currentItems]);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsDialogOpen(true)}
        className="mr-2"
        disabled={disabled}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add items
        {availableCount > 0 && (
          <Badge className="ml-2" variant="secondary">
            {availableCount} available
          </Badge>
        )}
      </Button>
      <AddItemsDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        catalogId={catalogId}
        onItemsAdded={onItemsAdded}
        currentItems={currentItems}
      />
    </>
  );
}

export function AddItemsDialog({
  isOpen,
  onOpenChange,
  catalogId,
  onItemsAdded,
  currentItems = [],
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  catalogId: string;
  onItemsAdded?: () => void;
  currentItems?: Array<{ cpid: string }>;
}) {
  const [selectedRewards, setSelectedRewards] = useState<GroupedReward[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const queryClient = useQueryClient();

  // Fetch enabled rewards
  const {
    data: allRewards,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["enabled-rewards"],
    queryFn: getEnabledRewards,
    enabled: isOpen, // Only fetch when dialog is open
  });

  // Filter out rewards that are already in the catalog
  const rewards = useMemo(() => {
    if (!allRewards) return [];

    const currentCpids = new Set(currentItems.map((item) => item.cpid));
    return allRewards.filter((reward) => !currentCpids.has(reward.cpid));
  }, [allRewards, currentItems]);

  // Dynamically build brand options from the filtered data
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

  // Handle adding selected rewards to catalog
  const handleAddItems = async () => {
    if (selectedRewards.length === 0) return;

    try {
      setIsAdding(true);

      // Prepare payload for API - use the first item from each selected reward
      const itemsToAdd = selectedRewards.map((reward) => {
        const firstItem = reward.items[0];
        return {
          cpid: reward.cpid,
          item_id: firstItem.redemption_id.toString(),
          reward_type: reward.type,
          title: reward.title,
          ent_name: reward.brand_name,
          language: reward.language,
          value: reward.value,
          poynts_reward: reward.poynts,
          poynts_catalog: reward.poynts, // Default to same as reward poynts
          status: reward.reward_status,
          availability: reward.reward_availability,
          inventory: firstItem.inventory_remaining ?? 0,
          inventory_type: "limited", // Default value
          rank: 0, // Will be set by backend
          entid: 0, // Will be set by backend
          registry_rank: 0, // Default value
          cpidx: firstItem.cpidx,
          reward_id: firstItem.redemption_registries_id || 0,
          priority: firstItem.priority,
          tags: reward.tags,
          reward_image: firstItem.reward_image,
        };
      });

      // Call the API
      const response = await addItemsToCatalog(catalogId, itemsToAdd);

      if (response.success) {
        // Show success message
        toast.success(
          `Successfully added ${selectedRewards.length} items to catalog`
        );

        // Invalidate and refetch the catalog items query to update the UI
        await queryClient.invalidateQueries({
          queryKey: ["catalog-items", catalogId],
        });

        // Call the callback if provided
        if (onItemsAdded) {
          onItemsAdded();
        }

        // Close the dialog
        onOpenChange(false);

        // Reset selected rewards
        setSelectedRewards([]);
      } else {
        toast.error("Failed to add items to catalog");
      }
    } catch (error) {
      console.error("Error adding items to catalog:", error);
      toast.error("An error occurred while adding items to catalog");
    } finally {
      setIsAdding(false);
    }
  };

  // Define initial column visibility - hide brand and type by default
  const initialColumnVisibility = {
    brand_name: false,
    type: false,
    reward_status: true,
  };

  // Create a custom action button for the DataTable
  const customActions = (
    <Button
      onClick={handleAddItems}
      disabled={selectedRewards.length === 0 || isAdding}
    >
      {isAdding
        ? "Adding..."
        : `Add Selected ${selectedRewards.length > 0 ? `(${selectedRewards.length})` : ""}`}
    </Button>
  );

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] overflow-auto !sm:max-w-[1200px] !max-w-[1200px]"
          style={{ maxWidth: "1200px", width: "1200px" }}
        >
          <DialogHeader>
            <DialogTitle>Add Items to Catalog</DialogTitle>
            <DialogDescription>Loading available rewards...</DialogDescription>
          </DialogHeader>
          <div className="py-8 flex items-center justify-center">
            <div className="text-muted-foreground">Loading rewards...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (isError) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="max-h-[90vh] overflow-auto !sm:max-w-[1200px] !max-w-[1200px]"
          style={{ maxWidth: "1200px", width: "1200px" }}
        >
          <DialogHeader>
            <DialogTitle>Add Items to Catalog</DialogTitle>
            <DialogDescription>Error loading rewards.</DialogDescription>
          </DialogHeader>
          <div className="py-8 flex items-center justify-center text-red-500">
            Error: {error?.message || "Failed to load rewards"}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-auto !sm:max-w-[1200px] !max-w-[1200px]"
        style={{ maxWidth: "1200px", width: "1200px" }}
      >
        <DialogHeader>
          <DialogTitle>Add Items to Catalog</DialogTitle>
          <DialogDescription>
            Select rewards to add to this catalog.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {rewards.length === 0 ? (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <div className="text-muted-foreground mb-2">
                No available rewards to add
              </div>
              <div className="text-sm text-muted-foreground">
                All enabled rewards are already in this catalog.
              </div>
            </div>
          ) : (
            <SelectableDataTable
              data={rewards || []}
              brandOptions={brandOptions}
              typeOptions={typeOptions}
              statusOptions={statusOptions}
              initialColumnVisibility={initialColumnVisibility}
              onSelectedRowsChange={setSelectedRewards}
              customActions={customActions}
            />
          )}
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
function SelectableDataTable<TData extends GroupedReward>({
  data,
  brandOptions,
  typeOptions,
  statusOptions,
  initialColumnVisibility,
  onSelectedRowsChange,
  customActions,
}: {
  data: TData[];
  brandOptions: { value: string; label: string }[];
  typeOptions: { value: string; label: string }[];
  statusOptions: { value: string; label: string }[];
  initialColumnVisibility?: Record<string, boolean>;
  onSelectedRowsChange?: (selectedRows: TData[]) => void;
  customActions?: React.ReactNode;
}) {
  // We'll use this state to track manually selected rows
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>(
    {}
  );

  // Create columns inside the component where we have access to state
  const columns = [
    {
      id: "select",
      header: () => {
        const allRowsSelected = data.every(
          (reward) => selectedRowIds[reward.cpid]
        );
        const someRowsSelected = data.some(
          (reward) => selectedRowIds[reward.cpid]
        );

        return (
          <Checkbox
            checked={allRowsSelected}
            onCheckedChange={(value) => {
              const newSelectedRowIds: Record<string, boolean> = {};
              if (value) {
                // Select all rows
                data.forEach((reward) => {
                  newSelectedRowIds[reward.cpid] = true;
                });
              }
              setSelectedRowIds(newSelectedRowIds);

              // Update selected rewards
              if (onSelectedRowsChange) {
                const selectedRows = value ? data : [];
                onSelectedRowsChange(selectedRows);
              }
            }}
            aria-label="Select all"
            className="translate-y-[2px]"
          />
        );
      },
      cell: ({ row }: { row: any }) => {
        const cpid = row.original.cpid;
        return (
          <Checkbox
            checked={!!selectedRowIds[cpid]}
            onCheckedChange={(value) => {
              const newSelectedRowIds = { ...selectedRowIds };
              if (value) {
                newSelectedRowIds[cpid] = true;
              } else {
                delete newSelectedRowIds[cpid];
              }
              setSelectedRowIds(newSelectedRowIds);

              // Update selected rewards
              if (onSelectedRowsChange) {
                const selectedRows = data.filter(
                  (reward) => newSelectedRowIds[reward.cpid]
                );
                onSelectedRowsChange(selectedRows);
              }
            }}
            aria-label="Select row"
            className="translate-y-[2px]"
          />
        );
      },
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
      header: "Reward",
    },
    {
      accessorKey: "brand_name",
      header: "Brand",
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }: { row: any }) => {
        const type = row.getValue("type");
        return <div className="capitalize">{type}</div>;
      },
    },
    {
      accessorKey: "value",
      header: "Value",
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
    },
    {
      accessorKey: "poynts",
      header: "Poynts",
    },
    {
      accessorKey: "reward_status",
      header: "Status",
      cell: ({ row }: { row: any }) => {
        const status = row.getValue("reward_status");
        return <div className="capitalize">{status}</div>;
      },
    },
  ];

  // Create filters array
  const filters = [
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
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      filters={filters}
      initialColumnVisibility={initialColumnVisibility}
      enableRowSelection={true}
      showActionsButton={true}
      customActions={customActions}
      searchColumn={{
        id: "title",
        placeholder: "Search rewards...",
      }}
    />
  );
}
