import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/utils/db';

interface GiftCardBrand {
  brand_id: number;
  brandKey: string;
  brandName: string;
  description: string | null;
  shortDescription: string | null;
  terms: string | null;
  disclaimer: string | null;
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

// Removed typed Database interface - using Prisma client directly for full functionality

/**
 * GET /api/legacy/giftcard-items
 * Retrieves a list of gift card items with associated brand, provider, and gift card information
 * @param request - The incoming request object
 * @returns NextResponse containing comprehensive gift card item data or error message
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch gift card items with related brand, provider, and gift card information
    const giftCardItems = await db.redemption_giftcard_items.findMany({
      include: {
        redemption_giftcard_brands: true,
        providers: true,
        redemption_giftcards: {
          where: {
            OR: [
              { inventory_type: 'unlimited' },
              {
                AND: [
                  { inventory_type: 'limited' },
                  { inventory_remaining: { gt: 0 } }
                ]
              },
              {
                AND: [
                  { inventory_type: 'single' },
                  { inventory_remaining: { gt: 0 } }
                ]
              }
            ]
          }
        }
      },
      where: {
        NOT: {
          OR: [
            { status: 'deleted' },
            { reward_status: 'deleted' }
          ]
        }
      },
      orderBy: {
        item_id: 'asc'
      }
    });

    // Transform the data to a more friendly format
    const formattedGiftCardItems = giftCardItems.map((item: any) => {
      // Validate and normalize rewardType to only be "giftcard" or "offer"
      let normalizedRewardType = "giftcard"; // Default value
      if (item.rewardType && ["giftcard", "offer"].includes(item.rewardType.toLowerCase())) {
        normalizedRewardType = item.rewardType.toLowerCase();
      }

      return {
        id: item.item_id,
        valueType: item.valueType,
        minValue: item.minValue,
        maxValue: item.maxValue,
        rewardName: item.rewardName,
        status: item.status,
        rewardStatus: item.reward_status,
        rewardAvailability: item.reward_availability,
        rewardType: normalizedRewardType,
        providerRewardId: item.utid,
        redemptionInstructions: item.redemptionInstructions,
        rebateInfo: {
          providerPercentage: item.rebate_provider_percentage ? parseFloat(item.rebate_provider_percentage.toString()) : 0,
          basePercentage: item.rebate_base_percentage ? parseFloat(item.rebate_base_percentage.toString()) : 0,
          customerPercentage: item.rebate_customer_percentage ? parseFloat(item.rebate_customer_percentage.toString()) : 0,
          cpPercentage: item.rebate_cp_percentage ? parseFloat(item.rebate_cp_percentage.toString()) : 0
        },
        brand: item.redemption_giftcard_brands ? {
          id: item.redemption_giftcard_brands.brand_id,
          key: item.redemption_giftcard_brands.brandKey,
          name: item.redemption_giftcard_brands.brandName,
          brandTag: item.redemption_giftcard_brands.brandTag,
          description: item.redemption_giftcard_brands.description,
          shortDescription: item.redemption_giftcard_brands.shortDescription,
          terms: item.redemption_giftcard_brands.terms,
          disclaimer: item.redemption_giftcard_brands.disclaimer,
          imageUrls: item.redemption_giftcard_brands.imageUrls_json
            ? (() => {
                try {
                  const parsed = JSON.parse(item.redemption_giftcard_brands.imageUrls_json);
                  // Check if parsed data is in the expected format (string URLs)
                  if (parsed && typeof parsed === 'object') {
                    // If it's an array (old Tremendous format), try to extract URL
                    if (Array.isArray(parsed)) {
                      const cardImage = parsed.find((img: any) => img.type === "card");
                      const logoImage = parsed.find((img: any) => img.type === "logo");
                      const primaryImage = cardImage || logoImage;
                      if (primaryImage?.src) {
                        return {
                          "1200w-326ppi": primaryImage.src,
                          "130w-326ppi": primaryImage.src,
                          "200w-326ppi": primaryImage.src,
                          "278w-326ppi": primaryImage.src,
                          "300w-326ppi": primaryImage.src,
                          "80w-326ppi": primaryImage.src,
                        };
                      }
                    }
                    // If it's a single object with src property (another old format)
                    else if (parsed.src && typeof parsed.src === 'string') {
                      return {
                        "1200w-326ppi": parsed.src,
                        "130w-326ppi": parsed.src,
                        "200w-326ppi": parsed.src,
                        "278w-326ppi": parsed.src,
                        "300w-326ppi": parsed.src,
                        "80w-326ppi": parsed.src,
                      };
                    }
                    // If it's already in the correct format, use it
                    else if (parsed["80w-326ppi"] && typeof parsed["80w-326ppi"] === 'string') {
                      return parsed;
                    }
                  }
                  return null;
                } catch (e) {
                  console.error('Error parsing imageUrls_json:', e);
                  return null;
                }
              })()
            : null
        } : null,
        provider: item.providers ? {
          id: item.providers.id,
          name: item.providers.name,
          code: item.providers.code,
          enabled: item.providers.enabled === 1,
          status: item.providers.enabled === 1 ? 'active' : 'inactive'
        } : null,
        giftCards: {
          count: item.redemption_giftcards.length,
          lowestValue: Math.min(...item.redemption_giftcards.map(card => card.value)),
          highestValue: Math.max(...item.redemption_giftcards.map(card => card.value)),
          valuesList: Array.from(new Set(item.redemption_giftcards.map(card => card.value)))
            .sort((a, b) => a - b)
            .join(', '),
          items: item.redemption_giftcards.map((card: GiftCard) => ({
            id: card.giftcard_id,
            value: card.value,
            poyntsValue: card.redem_value,
            inventoryType: card.inventory_type,
            inventoryRemaining: card.inventory_remaining,
            language: card.language,
            tags: card.tags?.split(',').filter(Boolean) || [],
            customTitle: card.custom_title,
            cpidx: card.cpid
          }))
        }
      };
    });

    // Sort the data: gift cards first (sorted by title), then offers (sorted by title)
    const sortedGiftCardItems = [...formattedGiftCardItems].sort((a, b) => {
      // First compare by type (gift cards first, offers second)
      if (a.rewardType === 'giftcard' && b.rewardType === 'offer') {
        return -1;
      }
      if (a.rewardType === 'offer' && b.rewardType === 'giftcard') {
        return 1;
      }

      // If both are the same type, sort by title alphabetically
      return a.rewardName.localeCompare(b.rewardName);
    });

    return NextResponse.json({
      success: true,
      data: sortedGiftCardItems
    }, {
      status: 200
    });

  } catch (error) {
    console.error('Error fetching gift card items:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch gift card items',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, {
      status: 500
    });
  }
}
