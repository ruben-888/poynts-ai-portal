"use client";

import { useState, useCallback } from "react";
import { DataTable } from "@/components/data-table/data-table";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { GiftCardProvider } from "./giftcard-context";
import { ManageGiftCard } from "./manage-gift-card";
import { giftCardColumns } from "./giftcard-columns";
import { useGiftCards } from "../hooks/use-gift-cards";
import { CreateGiftCardDialog } from "../../../rewards/create-gift-card/create-gift-card-dialog";
import React from "react";
import { useRouter } from "next/navigation";

export interface BrandImageUrls {
  "1200w-326ppi": string;
  "130w-326ppi": string;
  "200w-326ppi": string;
  "278w-326ppi": string;
  "300w-326ppi": string;
  "80w-326ppi": string;
}

export interface RebateInfo {
  providerPercentage: number;
  basePercentage: number;
  customerPercentage: number;
  cpPercentage: number;
}

export interface GiftCardBrand {
  id: number;
  key: string;
  name: string;
  brandTag?: string | null;
  imageUrls: BrandImageUrls | null;
  description?: string | null;
  shortDescription?: string | null;
  terms?: string | null;
  disclaimer?: string | null;
}

export interface GiftCardProvider {
  id: number;
  name: string;
  code: string;
  enabled: boolean;
  status: "active" | "inactive";
}

export interface GiftCardItem {
  id: number;
  value: number;
  poyntsValue: number;
  inventoryType: string;
  inventoryRemaining: number;
  language: string;
  tags: string[];
  customTitle: string;
  cpidx: string;
}

export interface GiftCardSummary {
  count: number;
  lowestValue: number;
  highestValue: number;
  valuesList: string;
  items: GiftCardItem[];
}

export interface GiftCard {
  id: number;
  valueType: string;
  minValue: number | null;
  maxValue: number | null;
  rewardName: string;
  status: string;
  rewardStatus: string;
  rewardAvailability: string;
  rewardType: string;
  providerRewardId: string | null;
  redemptionInstructions: string | null;
  rebateInfo: RebateInfo;
  brand: GiftCardBrand | null;
  provider: GiftCardProvider | null;
  giftCards: GiftCardSummary;
}

export interface CreateGiftCardResponse {
  giftcard_id: number;
  item_id: number;
  cpid: string;
  value: number;
  redem_value: number;
  language: string;
  inventory_type: string;
  inventory_remaining: number;
  tags: string;
  priority: number;
  brand: {
    id: number;
    name: string;
    key: string;
  } | null;
  provider: {
    id: number;
    name: string;
    code: string;
  } | null;
  item: {
    item_id: number;
    utid: string;
    rewardName: string;
    reward_status: string;
    reward_availability: string;
  };
}

export default function GiftCardsClient() {
  const [selectedGiftCardId, setSelectedGiftCardId] = useState<number | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const { data: giftCards = [], isLoading, error, refresh, handleGiftCardChange } = useGiftCards();

  // Extract unique brands from gift cards
  const availableBrands = React.useMemo(() => {
    const brandsMap = new Map<number, GiftCardBrand>();
    giftCards.forEach((card) => {
      if (card.brand) {
        brandsMap.set(card.brand.id, card.brand);
      }
    });
    return Array.from(brandsMap.values());
  }, [giftCards]);

  // Create provider options from the data
  const providerOptions = React.useMemo(() => {
    const providersMap = new Map<string, { code: string; name: string }>();
    giftCards.forEach((card) => {
      if (card.provider?.code && card.provider?.name) {
        providersMap.set(card.provider.code, {
          code: card.provider.code,
          name: card.provider.name,
        });
      }
    });
    return Array.from(providersMap.values())
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((provider) => ({
        value: provider.code,
        label: `${provider.name} (${provider.code})`,
      }));
  }, [giftCards]);

  // Create brand options from the data
  const brandOptions = React.useMemo(() => {
    return Array.from(
      new Set(
        giftCards
          .map((card) => card.brand?.name)
          .filter(
            (name): name is string => name !== undefined && name !== null,
          ),
      ),
    )
      .sort()
      .map((name) => ({
        value: name,
        label: name,
      }));
  }, [giftCards]);

  const router = useRouter();

  const selectedGiftCard = selectedGiftCardId
    ? giftCards.find((card) => card.id === selectedGiftCardId) || null
    : null;

  const handleCreateSuccess = useCallback(() => {
    // Refresh the page to reload the gift cards list
    // Since the hook doesn't use React Query, we'll use router.refresh()
    console.log("Gift card created successfully");
    setCreateDialogOpen(false);
    router.refresh();
    // Alternatively, could reload the window for a hard refresh
    // window.location.reload();
  }, [router]);

  const handleEditDialogChange = useCallback((open: boolean) => {
    setIsEditOpen(open);
    // Note: Individual save operations within ManageGiftCard call onRefresh when needed,
    // so we don't need to refresh here. This allows filters to persist when dialog closes.
  }, []);

  const contextValue = {
    isEditOpen,
    setIsEditOpen,
    selectedGiftCard,
    setSelectedGiftCard: (card: GiftCard | null) => {
      setSelectedGiftCardId(card?.id || null);
    },
    availableBrands,
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>
          Error:{" "}
          {error instanceof Error
            ? error.message
            : "An error occurred while fetching gift cards"}
        </p>
      </div>
    );
  }

  return (
    <GiftCardProvider value={contextValue}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Gift Cards Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor all gift card operations across the platform.
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Gift Card
          </Button>
        </div>
        <DataTable
          data={giftCards}
          columns={giftCardColumns}
          searchColumn={{
            id: "rewardName",
            placeholder: "Search gift cards by name...",
          }}
          filters={[
            {
              id: "provider",
              title: "Source",
              options: providerOptions,
            },
            {
              id: "brand",
              title: "Brand",
              options: brandOptions,
            },
            {
              id: "status",
              title: "Status",
              options: [
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ],
            },
          ]}
          initialColumnVisibility={{
            valueType: false,
          }}
          onRowClick={(row: Row<GiftCard>) => {
            setSelectedGiftCardId(row.original.id);
          }}
          onRowDoubleClick={(row: Row<GiftCard>) => {
            setSelectedGiftCardId(row.original.id);
            setIsEditOpen(true);
          }}
          selectedRowId={selectedGiftCardId?.toString()}
          enableRowSelection={false}
        />
        <ManageGiftCard
          availableBrands={availableBrands}
          isEditOpen={isEditOpen}
          setIsEditOpen={handleEditDialogChange}
          selectedGiftCard={selectedGiftCard}
          onRefresh={refresh}
          onGiftCardChange={handleGiftCardChange}
        />
        {/* Create Gift Card Dialog */}
        <CreateGiftCardDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSuccess={handleCreateSuccess}
        />
      </div>
    </GiftCardProvider>
  );
}
