"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod"; // Add zod for type validation
import axios from "axios"; // Add axios for HTTP requests
import { generateColumns } from "./columns";
import { DataTable } from "@/components/data-table/data-table";
import { ManageReward, RewardDetail } from "./manage-reward";
import { GroupedReward } from "./columns";
import { useState, useMemo, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Gift, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RemoveRewardDialog } from "./remove-reward-dialog";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@clerk/nextjs";
import { useGateValue } from "@statsig/react-bindings";
import { EnableRewardsButton } from "./giftcards/enable-rewards/enable-rewards-dialog";
import { ManageOffer, OfferDetail } from "./manage-offer";

// Define filter options
const typeOptions = [
  { value: "giftcard", label: "Gift Card" },
  { value: "offer", label: "Offer" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "suspended", label: "Suspended" },
  { value: "inactive", label: "Inactive" },
];

const languageOptions = [
  { value: "EN", label: "English" },
  { value: "ES", label: "Spanish" },
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
  tenant_id: z.record(z.string(), z.never()).or(z.string()),
  reward_status: z.string(),
  reward_availability: z.string(),
  // Allow null values for optional fields
  tags: z.string().nullable().optional(),
  startdate: z
    .string()
    .nullable()
    .optional()
    .or(z.record(z.string(), z.never())),
  enddate: z.string().nullable().optional().or(z.record(z.string(), z.never())),
  is_enabled: z.boolean().default(true),
  value_type: z.string().optional(),
  description: z.string().optional(),
  disclaimer: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(
    z.object({
      redemption_registries_id: z.number().nullable(),
      tenant_id: z.record(z.string(), z.never()).or(z.string()).optional(),
      redemption_id: z.union([z.string(), z.number()]),
      cpid: z.string(),
      redemption_type: z.string(),
      value: z.union([z.number(), z.string()]),
      poynts: z.union([z.number(), z.string()]),
      redem_value: z.number().optional(),
      name: z.string().nullable(),
      inventory_remaining: z.number().nullable(),
      title: z.string(),
      startdate: z
        .string()
        .nullable()
        .optional()
        .or(z.record(z.string(), z.never())),
      enddate: z
        .string()
        .nullable()
        .optional()
        .or(z.record(z.string(), z.never())),
      reward_status: z.string(),
      language: z.string(),
      reward_availability: z.string(),
      utid: z.string().optional(),
      value_type: z.string().optional(),
      tags: z.string().nullable().optional(),
      priority: z.number(),
      provider_id: z.number().nullable().optional(),
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

// Function to fetch rewards data
async function getRewards(): Promise<GroupedReward[]> {
  try {
    const response = await axios.get(
      "/api/rewards/rewards-by-tenant?tenant_id=8"
    );

    // Parse and validate the data
    const validatedData = rewardsResponseSchema.parse(response.data);
    // Type assertion to handle the incompatible types
    return validatedData.data as unknown as GroupedReward[];
  } catch (error) {
    // Log the detailed error for debugging
    if (error instanceof z.ZodError) {
      console.error(
        "Zod validation error:",
        JSON.stringify(error.format(), null, 2)
      );
    } else {
      console.error("Error fetching rewards:", error);
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to fetch rewards"
    );
  }
}

// DataTable with reward functionality
function RewardsDataTable({
  rewards,
  onRewardSelect,
  onRemoveReward,
  onCopyOffer,
  rewardsManagmentEnabled,
  rewardsRemoveEnabled,
}: {
  rewards: GroupedReward[];
  onRewardSelect: (reward: GroupedReward) => void;
  onRemoveReward: (reward: GroupedReward) => void;
  onCopyOffer: (reward: GroupedReward) => void;
  rewardsManagmentEnabled: boolean;
  rewardsRemoveEnabled: boolean;
}) {
  // Generate columns with the row action handler
  const columns = generateColumns(
    onRewardSelect,
    onRemoveReward,
    rewardsManagmentEnabled,
    rewardsRemoveEnabled,
    onCopyOffer
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const queryClient = useQueryClient();

  // Define initial column visibility - hide brand and source count by default
  const initialColumnVisibility = {
    brand_name: false,
    source_count: false,
    source_detail: true,
    source_a: false,
    source_b: false,
    source_c: false,
    type: false,
    value_type: false,
    language: false,
    tags: false,
    poynts: false,
    cpidx_values: false,
    dates: false,
    start_date: false,  // Hide start date column by default
    end_date: false,    // Hide end date column by default
  };

  // Handler for double-clicking a row
  const handleRowDoubleClick = (row: any) => {
    onRewardSelect(row.original);
  };

  // Function to handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ["rewards"] });
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  };

  // Dynamically build brand options from the data
  const brandOptions = Array.from(
    new Set(rewards?.map((reward) => reward.brand_name))
  )
    .filter(Boolean)
    .map((brand) => ({
      value: brand,
      label: brand,
    }));

  // Build source count options from the data
  const sourceOptions = Array.from(
    new Set(rewards?.map((reward) => reward.source_count))
  )
    .sort((a, b) => a - b)
    .map((count) => ({
      value: count.toString(),
      label: `${count} ${count === 1 ? "Source" : "Sources"}`,
    }));

  // Build tags options from top-level rewards
  const tagsOptions = useMemo(() => {
    if (!rewards) return [];

    const allTags = new Set<string>();

    rewards.forEach((reward) => {
      // Parse tags from main reward (already contains aggregate tags)
      if (reward.tags) {
        const rewardTags = reward.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);
        rewardTags.forEach((tag) => allTags.add(tag));
      }
    });

    return Array.from(allTags)
      .sort()
      .map((tag) => ({
        value: tag,
        label: tag,
      }));
  }, [rewards]);

  return (
    <DataTable
      data={rewards}
      columns={columns}
      searchColumn={{
        id: "title",
        placeholder: "Search rewards...",
      }}
      onRowDoubleClick={handleRowDoubleClick}
      filters={[
        {
          id: "brand_name",
          title: "Brand",
          options: brandOptions,
        },
        {
          id: "language",
          title: "Language",
          options: languageOptions,
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
        {
          id: "tags",
          title: "Tags",
          options: tagsOptions,
        },
      ]}
      initialColumnVisibility={initialColumnVisibility}
      enableRowSelection={false}
      showActionsButton={false}
      enableRefresh={true}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
      enableCSVExport={true}
      csvFilename="carepoynt-rewards-export"
    />
  );
}

export function RewardsClient({
  canManageRewards: initialCanManageRewards,
}: {
  canManageRewards?: boolean;
}) {
  const { has, isLoaded, isSignedIn } = useAuth();
  const [canManageRewards, setCanManageRewards] = useState(
    initialCanManageRewards || false
  );
  // Feature flag for reward notifications - hard coded to off
  const rewardNotificationsEnabled = false;
  const rewardsManagmentEnabled = true; //useGateValue("rewards_managment_enabled");
  const rewardsRemoveEnabled = false; //useGateValue("rewards_remove_enabled");

  // Feature flag for new offer button
  const rewardsNewOfferEnabled = useGateValue("rewards_new_offer");

  // State for managing the reward dialog
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<RewardDetail | null>(
    null
  );
  // State for managing the offer dialog
  const [isOfferDialogOpen, setIsOfferDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferDetail | null>(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  // State to track if refresh is in progress
  const [isRefreshing, setIsRefreshing] = useState(false);
  // State for notification banners
  const [showNewGiftCardsNotice, setShowNewGiftCardsNotice] = useState(true);
  const [showSuspendedGiftCardsNotice, setShowSuspendedGiftCardsNotice] =
    useState(true);
  // State for the remove reward dialog
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [rewardToRemove, setRewardToRemove] = useState<GroupedReward | null>(
    null
  );

  // Get the query client for invalidation
  const queryClient = useQueryClient();

  // Set canManageClients when auth is loaded
  useEffect(() => {
    if (isLoaded && isSignedIn && initialCanManageRewards === undefined) {
      const hasPermission = has({
        permission: "org:rewards:manage",
      });
      setCanManageRewards(hasPermission);
    }
  }, [isLoaded, isSignedIn, has, initialCanManageRewards]);

  // Handle selecting a reward
  const handleRewardSelect = (reward: GroupedReward) => {
    if (reward.type === "offer") {
      // Convert GroupedReward to OfferDetail format
      const offerDetail = {
        ...reward,
        items: reward.items.map((item) => ({
          ...item,
          id: item.redemption_registries_id || 0, // Use redemption_registries_id as id
        })),
      } as unknown as OfferDetail;

      setSelectedOffer(offerDetail);
      setIsCreateMode(false);
      setIsOfferDialogOpen(true);
    } else {
      // Convert GroupedReward to RewardDetail format for gift cards
      const rewardDetail = {
        ...reward,
        items: reward.items.map((item) => ({
          ...item,
          id: item.redemption_registries_id || 0, // Use redemption_registries_id as id
        })),
      } as unknown as RewardDetail;

      setSelectedReward(rewardDetail);
      setIsDialogOpen(true);
    }
  };

  // Handle creating a new offer
  const handleNewOffer = () => {
    setSelectedOffer(null);
    setIsCreateMode(true);
    setIsOfferDialogOpen(true);
  };

  // Handle copying an offer
  const handleCopyOffer = (reward: GroupedReward) => {
    // Convert GroupedReward to OfferDetail format for copying
    const offerDetail = {
      ...reward,
      items: reward.items.map((item) => ({
        ...item,
        id: item.redemption_registries_id || 0,
      })),
    } as unknown as OfferDetail;

    setSelectedOffer(offerDetail);
    setIsCreateMode(true); // Set to create mode so it opens the wizard
    setIsOfferDialogOpen(true);
  };

  // Handle removing a reward
  const handleRemoveReward = (reward: GroupedReward) => {
    setRewardToRemove(reward);
    setIsRemoveDialogOpen(true);
  };

  // Confirm reward removal
  const confirmRemoveReward = async (reward: GroupedReward) => {
    try {
      // Here you would call your API to remove the reward
      // await axios.delete(`/api/rewards/${reward.cpid}`);

      // For now, we'll just log the action
      console.log("Removing reward:", reward.cpid);

      // Refresh the rewards list
      await queryClient.invalidateQueries({ queryKey: ["rewards"] });
    } catch (error) {
      console.error("Error removing reward:", error);
    }
  };

  const {
    data: rewards,
    isLoading,
    isError,
    error,
  } = useQuery<GroupedReward[]>({
    queryKey: ["rewards"],
    queryFn: getRewards,
  });

  // Function to handle refresh
  const handleRefresh = async () => {
    // Set refreshing state to true
    setIsRefreshing(true);

    try {
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["rewards"] });
    } finally {
      // Set refreshing state back to false when done
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500); // Small delay to ensure animation is visible
    }
  };

  // Filter for enabled rewards
  const enabledRewards = useMemo(() => {
    if (!rewards) return [];
    return rewards.filter((reward) => reward.is_enabled);
  }, [rewards]);

  // Filter for disabled rewards
  const disabledRewards = useMemo(() => {
    if (!rewards) return [];
    return rewards.filter((reward) => !reward.is_enabled);
  }, [rewards]);

  // Calculate counts for the description
  const rewardCounts = useMemo(() => {
    // Count top-level grouped rewards, not individual items within each group
    const total = enabledRewards.length;
    const giftCards = enabledRewards.filter(
      (reward) => reward.type === "giftcard"
    ).length;
    const offers = enabledRewards.filter(
      (reward) => reward.type === "offer"
    ).length;
    const brands = new Set(enabledRewards.map((reward) => reward.brand_name))
      .size;

    return { total, giftCards, offers, brands };
  }, [enabledRewards]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        Loading rewards...
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

  return (
    <>
      <div className="h-full flex-1 flex-col space-y-4 p-4 md:p-8 flex">
        {rewardNotificationsEnabled && showNewGiftCardsNotice && (
          <Alert className="bg-blue-50 border-blue-200 text-blue-700 flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <Gift className="h-4 w-4" />
              <AlertDescription>
                7 new gift cards now available. Click the add reward button to
                see what&apos;s available.
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-blue-100"
              onClick={() => setShowNewGiftCardsNotice(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </Alert>
        )}

        {rewardNotificationsEnabled && showSuspendedGiftCardsNotice && (
          <Alert className="bg-amber-50 border-amber-200 text-amber-700 flex items-center justify-between">
            <div className="flex gap-2 items-center">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                3 gift cards have been suspended.
              </AlertDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full hover:bg-amber-100"
              onClick={() => setShowSuspendedGiftCardsNotice(false)}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Dismiss</span>
            </Button>
          </Alert>
        )}

        <div className="flex items-center justify-between space-y-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Rewards</h2>
            <p className="text-muted-foreground mb-4">
              {rewardCounts.total} Total Rewards • {rewardCounts.brands} Brands
              • {rewardCounts.giftCards} Gift Cards • {rewardCounts.offers}{" "}
              Offers
            </p>
          </div>
          <div className="flex gap-2">
            {rewardsNewOfferEnabled && (
              <Button
                variant="outline"
                onClick={handleNewOffer}
                disabled={!canManageRewards}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                New Offer
              </Button>
            )}
            <EnableRewardsButton
              disabledRewards={disabledRewards}
              canManageRewards={canManageRewards}
              rewardsManagmentEnabled={rewardsManagmentEnabled}
            />
          </div>
        </div>
        <RewardsDataTable
          rewards={enabledRewards}
          onRewardSelect={handleRewardSelect}
          onRemoveReward={handleRemoveReward}
          onCopyOffer={handleCopyOffer}
          rewardsManagmentEnabled={rewardsManagmentEnabled && canManageRewards}
          rewardsRemoveEnabled={rewardsRemoveEnabled}
        />
      </div>
      <ManageReward
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedReward={selectedReward}
      />
      <ManageOffer
        isOpen={isOfferDialogOpen}
        onOpenChange={setIsOfferDialogOpen}
        selectedOffer={selectedOffer}
        isCreateMode={isCreateMode}
      />
      <RemoveRewardDialog
        isOpen={isRemoveDialogOpen}
        onOpenChange={setIsRemoveDialogOpen}
        reward={rewardToRemove}
        onConfirm={confirmRemoveReward}
      />
    </>
  );
}
