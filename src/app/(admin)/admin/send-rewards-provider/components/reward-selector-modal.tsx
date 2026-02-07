"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";
import { RewardCard } from "./reward-card";
import { normalizeReward } from "@/lib/reward-adapters";
import type { NormalizedReward } from "@/types/reward-selection";

interface RewardSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  providerId: string;
  onSelect: (reward: NormalizedReward) => void;
}

// Blackhawk product type for API response
interface BlackhawkProduct {
  contentProviderCode: string;
  parentBrandName: string;
  productName: string;
  productDescription: string;
  productImage: string;
  logoImage: string;
  valueRestrictions: {
    minimum: number;
    maximum: number;
  };
  offFaceDiscountPercent: number;
  eGiftFormat: string;
  locale: string;
  redemptionInfo: string;
  termsAndConditions: {
    text: string;
    type: string;
  };
  cardExists?: boolean;
  associatedItems?: unknown[];
}

interface BlackhawkApiResponse {
  data: {
    clientProgramId: number;
    currency: string;
    products: BlackhawkProduct[];
  };
}

export function RewardSelectorModal({
  open,
  onOpenChange,
  providerId,
  onSelect,
}: RewardSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  // Fetch rewards based on provider
  const fetchRewards = async (): Promise<NormalizedReward[]> => {
    console.log("Fetching rewards for provider:", providerId);

    if (providerId === "source-blackhawk") {
      const response = await axios.get<BlackhawkApiResponse>(
        "/api/legacy/providers/blackhawk"
      );
      console.log("Blackhawk API response:", response.data);
      const normalized = response.data.data.products.map((p: BlackhawkProduct) =>
        normalizeReward(p, providerId)
      );
      console.log("Normalized Blackhawk rewards:", normalized);
      return normalized;
    }

    // Unified endpoint for Tremendous/Tango/Amazon
    const response = await axios.get<{ data: any[] }>(
      `/api/v1/reward-sources/${providerId}/catalog`,
      { params: { limit: 500 } }
    );
    console.log(`${providerId} API response:`, response.data);

    // Filter out non-gift-card items (bank transfers, PayPal, Visa cards)
    const EXCLUDED_SOURCE_IDENTIFIERS = new Set([
      "ET0ZVETV5ILN", // Bank Transfer
      "KV934TZ93NQM", // PayPal USA
      "Q24BD9EZ332JT", // Virtual Visa
      "A2J05SWPI2QG", // Physical Visa
    ]);

    const filtered = response.data.data.filter(
      (item: any) => !EXCLUDED_SOURCE_IDENTIFIERS.has(item.sourceIdentifier)
    );

    const normalized = filtered.map((item: any) =>
      normalizeReward(item, providerId)
    );
    console.log(`Normalized ${providerId} rewards:`, normalized);
    return normalized;
  };

  const {
    data: rewards = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["provider-catalog", providerId],
    queryFn: fetchRewards,
    enabled: open && !!providerId, // Only fetch when modal is open and provider is selected
  });

  // Filter rewards based on search query
  const filteredRewards = useMemo(() => {
    if (!searchQuery.trim()) {
      return rewards;
    }

    const query = searchQuery.toLowerCase();
    return rewards.filter(
      (reward) =>
        reward.brandName.toLowerCase().includes(query) ||
        reward.productName.toLowerCase().includes(query) ||
        reward.description.toLowerCase().includes(query)
    );
  }, [rewards, searchQuery]);

  const handleSelectReward = (reward: NormalizedReward) => {
    setSelectedRewardId(reward.sourceIdentifier);
    onSelect(reward);
  };

  // Reset state when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedRewardId(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-none w-[80vw] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select a Reward</DialogTitle>
          <DialogDescription>
            Choose a gift card or reward to send
          </DialogDescription>
        </DialogHeader>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by brand or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {isError && (
            <div className="text-center py-12">
              <p className="text-destructive font-medium">
                Failed to load rewards
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Please try again or select a different provider
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredRewards.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No rewards found matching your search"
                  : "No rewards available for this provider"}
              </p>
            </div>
          )}

          {!isLoading && !isError && filteredRewards.length > 0 && (
            <>
              {/* Results Count */}
              <div className="mb-4 text-sm text-muted-foreground">
                Showing {filteredRewards.length} reward
                {filteredRewards.length !== 1 ? "s" : ""}
              </div>

              {/* Rewards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-4">
                {filteredRewards.map((reward) => (
                  <RewardCard
                    key={reward.sourceIdentifier}
                    reward={reward}
                    onSelect={() => handleSelectReward(reward)}
                    isSelected={selectedRewardId === reward.sourceIdentifier}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
