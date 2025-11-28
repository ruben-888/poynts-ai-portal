import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { db } from "@/utils/db";

interface GiftCardBrand {
  brand_id: number;
  brandKey: string;
  brandName: string;
  description: string | null;
  terms: string | null;
  imageUrls_json: string | null;
}

interface Provider {
  id: number;
  name: string;
  code: string;
  enabled: number;
}

interface GiftCard {
  giftcard_id: number;
  value: number;
  redem_value: number;
  inventory_type: string;
  inventory_remaining: number;
  language: string | null;
  tags: string | null;
  custom_title: string | null;
  cpid: string | null;
}

interface GiftCardItem {
  item_id: number;
  valueType: string;
  minValue: number | null;
  maxValue: number | null;
  rewardName: string;
  status: string;
  reward_status: string;
  reward_availability: string;
  rewardType: string;
  redemptionInstructions: string | null;
  rebate_provider_percentage: number | null;
  rebate_base_percentage: number | null;
  rebate_customer_percentage: number | null;
  rebate_cp_percentage: number | null;
  redemption_giftcard_brands: GiftCardBrand | null;
  providers: Provider | null;
  redemption_giftcards: GiftCard[];
  utid: string | null;
}

/**
 * Interface for the update request body
 * Contains only the fields that can be updated
 */
interface UpdateGiftCardItemRequest {
  id?: number;
  valueType?: string;
  minValue?: number | null;
  maxValue?: number | null;
  rewardName?: string;
  status?: string;
  rewardStatus?: string;
  rewardAvailability?: string;
  rebateInfo?: {
    providerPercentage?: number;
    basePercentage?: number;
    customerPercentage?: number;
    cpPercentage?: number;
  };
  brand?: {
    id?: number;
  };
}

interface Database {
  redemption_giftcard_items: {
    findFirst: (params: {
      include?: {
        redemption_giftcard_brands?: boolean;
        providers?: boolean;
        redemption_giftcards?: {
          where?: {
            OR?: Array<{
              inventory_type?: string;
              AND?: Array<{
                inventory_type?: string;
                inventory_remaining?: { gt: number };
              }>;
            }>;
          };
        };
      };
      where: {
        item_id: number;
        status?: string;
        reward_status?: string;
      };
    }) => Promise<GiftCardItem | null>;
    update: (params: {
      where: {
        item_id: number;
      };
      data: {
        valueType?: string;
        minValue?: number | null;
        maxValue?: number | null;
        rewardName?: string;
        status?: string;
        reward_status?: string;
        reward_availability?: string;
        rebate_provider_percentage?: number | null;
        rebate_base_percentage?: number | null;
        rebate_customer_percentage?: number | null;
        rebate_cp_percentage?: number | null;
        redemption_giftcard_brands_id?: number | null;
      };
    }) => Promise<GiftCardItem>;
  };
}

const typedDb = db as unknown as Database;

/**
 * GET /api/legacy/giftcard-items/[item_id]
 * Retrieves a specific gift card item by ID with associated brand, provider, and gift card information
 * @param request - The incoming request object
 * @param params - The route parameters containing the item_id
 * @returns NextResponse containing the gift card item data or error message
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { item_id: string } }
) {
  try {
    const itemId = parseInt(params.item_id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid item ID" },
        { status: 400 },
      );
    }

    // Fetch the specific gift card item with related brand, provider, and gift card information
    const giftCardItem = await typedDb.redemption_giftcard_items.findFirst({
      include: {
        redemption_giftcard_brands: true,
        providers: true,
        redemption_giftcards: {
          where: {
            OR: [
              { inventory_type: "unlimited" },
              {
                AND: [
                  { inventory_type: "limited" },
                  { inventory_remaining: { gt: 0 } },
                ],
              },
            ],
          },
        },
      },
      where: {
        item_id: itemId,
        status: "active",
        reward_status: "active",
      },
    });

    if (!giftCardItem) {
      return NextResponse.json(
        { success: false, error: "Gift card item not found" },
        { status: 404 },
      );
    }

    // Transform the data to a more friendly format, using the same structure as the list endpoint
    // Validate and normalize rewardType to only be "giftcard" or "offer"
    let normalizedRewardType = "giftcard"; // Default value
    if (
      giftCardItem.rewardType &&
      ["giftcard", "offer"].includes(giftCardItem.rewardType.toLowerCase())
    ) {
      normalizedRewardType = giftCardItem.rewardType.toLowerCase();
    }

    const formattedGiftCardItem = {
      id: giftCardItem.item_id,
      valueType: giftCardItem.valueType,
      minValue: giftCardItem.minValue,
      maxValue: giftCardItem.maxValue,
      rewardName: giftCardItem.rewardName,
      status: giftCardItem.status,
      rewardStatus: giftCardItem.reward_status,
      rewardAvailability: giftCardItem.reward_availability,
      rewardType: normalizedRewardType,
      providerRewardId: giftCardItem.utid,
      redemptionInstructions: giftCardItem.redemptionInstructions,
      rebateInfo: {
        providerPercentage: giftCardItem.rebate_provider_percentage
          ? parseFloat(giftCardItem.rebate_provider_percentage.toString())
          : 0,
        basePercentage: giftCardItem.rebate_base_percentage
          ? parseFloat(giftCardItem.rebate_base_percentage.toString())
          : 0,
        customerPercentage: giftCardItem.rebate_customer_percentage
          ? parseFloat(giftCardItem.rebate_customer_percentage.toString())
          : 0,
        cpPercentage: giftCardItem.rebate_cp_percentage
          ? parseFloat(giftCardItem.rebate_cp_percentage.toString())
          : 0,
      },
      brand: giftCardItem.redemption_giftcard_brands
        ? {
            id: giftCardItem.redemption_giftcard_brands.brand_id,
            key: giftCardItem.redemption_giftcard_brands.brandKey,
            name: giftCardItem.redemption_giftcard_brands.brandName,
            brandTag: giftCardItem.redemption_giftcard_brands.brandTag,
            imageUrls: giftCardItem.redemption_giftcard_brands.imageUrls_json
              ? JSON.parse(
                  giftCardItem.redemption_giftcard_brands.imageUrls_json,
                )
              : null,
          }
        : null,
      provider: giftCardItem.providers
        ? {
            id: giftCardItem.providers.id,
            name: giftCardItem.providers.name,
            code: giftCardItem.providers.code,
            enabled: giftCardItem.providers.enabled === 1,
            status:
              giftCardItem.providers.enabled === 1 ? "active" : "inactive",
          }
        : null,
      giftCards: {
        count: giftCardItem.redemption_giftcards.length,
        lowestValue: Math.min(
          ...giftCardItem.redemption_giftcards.map((card) => card.value),
        ),
        highestValue: Math.max(
          ...giftCardItem.redemption_giftcards.map((card) => card.value),
        ),
        valuesList: Array.from(
          new Set(giftCardItem.redemption_giftcards.map((card) => card.value)),
        )
          .sort((a, b) => a - b)
          .join(", "),
        items: giftCardItem.redemption_giftcards.map((card: GiftCard) => ({
          id: card.giftcard_id,
          value: card.value,
          poyntsValue: card.redem_value,
          inventoryType: card.inventory_type,
          inventoryRemaining: card.inventory_remaining,
          language: card.language,
          tags: card.tags?.split(",").filter(Boolean) || [],
          customTitle: card.custom_title,
          cpidx: card.cpid,
        })),
      },
    };

    // Return the formatted gift card item directly at the root level
    return NextResponse.json(formattedGiftCardItem, { status: 200 });
  } catch (error) {
    console.error("Error fetching gift card item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch gift card item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/legacy/giftcard-items/[item_id]
 * Updates a specific gift card item by ID with the provided data
 * @param request - The incoming request object containing the update data
 * @param params - The route parameters containing the item_id
 * @returns NextResponse containing the updated gift card item or error message
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { item_id: string } }
) {
  try {
    const itemId = parseInt(params.item_id, 10);

    if (isNaN(itemId)) {
      return NextResponse.json(
        { success: false, error: "Invalid item ID" },
        { status: 400 },
      );
    }

    // Parse the request body
    const updateData: UpdateGiftCardItemRequest = await request.json();

    // Validate that the ID in the path matches the ID in the body (if provided)
    if (updateData.id !== undefined && updateData.id !== itemId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID in request body does not match ID in URL path",
        },
        { status: 400 },
      );
    }

    // Check if the item exists
    const existingItem = await typedDb.redemption_giftcard_items.findFirst({
      where: {
        item_id: itemId,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Gift card item not found" },
        { status: 404 },
      );
    }

    // Prepare the update data object
    const updateDbData: any = {};

    // Map the fields from the request to the database fields
    if (updateData.valueType !== undefined) {
      updateDbData.valueType = updateData.valueType;
    }
    if (updateData.minValue !== undefined) {
      updateDbData.minValue = updateData.minValue;
    }
    if (updateData.maxValue !== undefined) {
      updateDbData.maxValue = updateData.maxValue;
    }
    if (updateData.rewardName !== undefined) {
      updateDbData.rewardName = updateData.rewardName;
    }
    if (updateData.status !== undefined) {
      updateDbData.status = updateData.status;
    }
    if (updateData.rewardStatus !== undefined) {
      updateDbData.reward_status = updateData.rewardStatus;
    }
    if (updateData.rewardAvailability !== undefined) {
      updateDbData.reward_availability = updateData.rewardAvailability;
    }

    // Handle rebate info updates
    if (updateData.rebateInfo) {
      if (updateData.rebateInfo.providerPercentage !== undefined) {
        updateDbData.rebate_provider_percentage =
          updateData.rebateInfo.providerPercentage;
      }
      if (updateData.rebateInfo.basePercentage !== undefined) {
        updateDbData.rebate_base_percentage =
          updateData.rebateInfo.basePercentage;
      }
      if (updateData.rebateInfo.customerPercentage !== undefined) {
        updateDbData.rebate_customer_percentage =
          updateData.rebateInfo.customerPercentage;
      }
      if (updateData.rebateInfo.cpPercentage !== undefined) {
        updateDbData.rebate_cp_percentage = updateData.rebateInfo.cpPercentage;
      }
    }

    // Handle brand updates
    if (updateData.brand && updateData.brand.id !== undefined) {
      updateDbData.redemption_giftcard_brands_id = updateData.brand.id;
    }

    // Update the gift card item
    const updatedItem = await typedDb.redemption_giftcard_items.update({
      where: {
        item_id: itemId,
      },
      data: updateDbData,
    });

    // Fetch the updated item with all related data to return
    const updatedGiftCardItem =
      await typedDb.redemption_giftcard_items.findFirst({
        include: {
          redemption_giftcard_brands: true,
          providers: true,
          redemption_giftcards: {
            where: {
              OR: [
                { inventory_type: "unlimited" },
                {
                  AND: [
                    { inventory_type: "limited" },
                    { inventory_remaining: { gt: 0 } },
                  ],
                },
              ],
            },
          },
        },
        where: {
          item_id: itemId,
        },
      });

    if (!updatedGiftCardItem) {
      return NextResponse.json(
        { success: false, error: "Failed to retrieve updated gift card item" },
        { status: 500 },
      );
    }

    // Format the response using the same structure as the GET endpoint
    let normalizedRewardType = "giftcard"; // Default value
    if (
      updatedGiftCardItem.rewardType &&
      ["giftcard", "offer"].includes(
        updatedGiftCardItem.rewardType.toLowerCase(),
      )
    ) {
      normalizedRewardType = updatedGiftCardItem.rewardType.toLowerCase();
    }

    const formattedGiftCardItem = {
      id: updatedGiftCardItem.item_id,
      valueType: updatedGiftCardItem.valueType,
      minValue: updatedGiftCardItem.minValue,
      maxValue: updatedGiftCardItem.maxValue,
      rewardName: updatedGiftCardItem.rewardName,
      status: updatedGiftCardItem.status,
      rewardStatus: updatedGiftCardItem.reward_status,
      rewardAvailability: updatedGiftCardItem.reward_availability,
      rewardType: normalizedRewardType,
      providerRewardId: updatedGiftCardItem.utid,
      redemptionInstructions: updatedGiftCardItem.redemptionInstructions,
      rebateInfo: {
        providerPercentage: updatedGiftCardItem.rebate_provider_percentage
          ? parseFloat(
              updatedGiftCardItem.rebate_provider_percentage.toString(),
            )
          : 0,
        basePercentage: updatedGiftCardItem.rebate_base_percentage
          ? parseFloat(updatedGiftCardItem.rebate_base_percentage.toString())
          : 0,
        customerPercentage: updatedGiftCardItem.rebate_customer_percentage
          ? parseFloat(
              updatedGiftCardItem.rebate_customer_percentage.toString(),
            )
          : 0,
        cpPercentage: updatedGiftCardItem.rebate_cp_percentage
          ? parseFloat(updatedGiftCardItem.rebate_cp_percentage.toString())
          : 0,
      },
      brand: updatedGiftCardItem.redemption_giftcard_brands
        ? {
            id: updatedGiftCardItem.redemption_giftcard_brands.brand_id,
            key: updatedGiftCardItem.redemption_giftcard_brands.brandKey,
            name: updatedGiftCardItem.redemption_giftcard_brands.brandName,
            brandTag: updatedGiftCardItem.redemption_giftcard_brands.brandTag,
            imageUrls: updatedGiftCardItem.redemption_giftcard_brands
              .imageUrls_json
              ? JSON.parse(
                  updatedGiftCardItem.redemption_giftcard_brands.imageUrls_json,
                )
              : null,
          }
        : null,
      provider: updatedGiftCardItem.providers
        ? {
            id: updatedGiftCardItem.providers.id,
            name: updatedGiftCardItem.providers.name,
            code: updatedGiftCardItem.providers.code,
            enabled: updatedGiftCardItem.providers.enabled === 1,
            status:
              updatedGiftCardItem.providers.enabled === 1
                ? "active"
                : "inactive",
          }
        : null,
      giftCards: {
        count: updatedGiftCardItem.redemption_giftcards.length,
        lowestValue: updatedGiftCardItem.redemption_giftcards.length
          ? Math.min(
              ...updatedGiftCardItem.redemption_giftcards.map(
                (card) => card.value,
              ),
            )
          : 0,
        highestValue: updatedGiftCardItem.redemption_giftcards.length
          ? Math.max(
              ...updatedGiftCardItem.redemption_giftcards.map(
                (card) => card.value,
              ),
            )
          : 0,
        valuesList: updatedGiftCardItem.redemption_giftcards.length
          ? Array.from(
              new Set(
                updatedGiftCardItem.redemption_giftcards.map(
                  (card) => card.value,
                ),
              ),
            )
              .sort((a, b) => a - b)
              .join(", ")
          : "",
        items: updatedGiftCardItem.redemption_giftcards.map(
          (card: GiftCard) => ({
            id: card.giftcard_id,
            value: card.value,
            poyntsValue: card.redem_value,
            inventoryType: card.inventory_type,
            inventoryRemaining: card.inventory_remaining,
            language: card.language,
            tags: card.tags?.split(",").filter(Boolean) || [],
            customTitle: card.custom_title,
            cpidx: card.cpid,
          }),
        ),
      },
    };

    // Return the formatted updated gift card item directly at the root level
    return NextResponse.json(formattedGiftCardItem, { status: 200 });
  } catch (error) {
    console.error("Error updating gift card item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update gift card item",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
