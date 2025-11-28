import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/utils/db';

// Define types for the database schema
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

interface GiftCardItem {
  item_id: number;
  brand_id: number;
  minValue: number | null;
  maxValue: number | null;
  rewardName: string | null;
  status: string | null;
  reward_status: string | null;
  reward_availability: string | null;
  valueType: string | null;
  rewardType: string | null;
  redemptionInstructions: string | null;
  rebate_provider_percentage: number | null;
  rebate_base_percentage: number | null;
  rebate_customer_percentage: number | null;
  rebate_cp_percentage: number | null;
  redemption_giftcard_brands: GiftCardBrand;
  providers: Provider;
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
  priority: number;
  redemption_giftcard_items: GiftCardItem;
}

/**
 * GET /api/legacy/giftcards
 * Retrieves a list of gift cards with associated brand and item information
 * @param request - The incoming request object
 * @returns NextResponse containing comprehensive gift card data or error message
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch gift cards with related brand and item information
    // Using any type to bypass TypeScript limitations with complex Prisma queries
    const giftCards = await (db as any).redemption_giftcards.findMany({
      include: {
        redemption_giftcard_items: {
          include: {
            redemption_giftcard_brands: true,
            providers: true
          }
        }
      },
      where: {
        OR: [
          { inventory_type: 'unlimited' },
          {
            AND: [
              { inventory_type: 'limited' },
              { inventory_remaining: { gt: 0 } }
            ]
          }
        ]
      },
      orderBy: {
        priority: 'desc'
      }
    });

    // Transform the data to a more friendly format
    const formattedGiftCards = giftCards.map((card: any) => ({
      id: card.giftcard_id,
      value: card.value,
      redemptionValue: card.redem_value,
      inventoryType: card.inventory_type,
      inventoryRemaining: card.inventory_remaining,
      language: card.language,
      tags: card.tags?.split(',').filter(Boolean) || [],
      customTitle: card.custom_title,
      cpid: card.cpid,
      item: card.redemption_giftcard_items ? {
        id: card.redemption_giftcard_items.item_id,
        minValue: card.redemption_giftcard_items.minValue,
        maxValue: card.redemption_giftcard_items.maxValue,
        rewardName: card.redemption_giftcard_items.rewardName,
        status: card.redemption_giftcard_items.status,
        rewardStatus: card.redemption_giftcard_items.reward_status,
        rewardAvailability: card.redemption_giftcard_items.reward_availability,
        valueType: card.redemption_giftcard_items.valueType,
        rewardType: card.redemption_giftcard_items.rewardType,
        redemptionInstructions: card.redemption_giftcard_items.redemptionInstructions,
        rebateInfo: {
          providerPercentage: card.redemption_giftcard_items.rebate_provider_percentage,
          basePercentage: card.redemption_giftcard_items.rebate_base_percentage,
          customerPercentage: card.redemption_giftcard_items.rebate_customer_percentage,
          cpPercentage: card.redemption_giftcard_items.rebate_cp_percentage
        }
      } : null,
      brand: card.redemption_giftcard_items?.redemption_giftcard_brands ? {
        id: card.redemption_giftcard_items.redemption_giftcard_brands.brand_id,
        key: card.redemption_giftcard_items.redemption_giftcard_brands.brandKey,
        name: card.redemption_giftcard_items.redemption_giftcard_brands.brandName,
        description: card.redemption_giftcard_items.redemption_giftcard_brands.description,
        terms: card.redemption_giftcard_items.redemption_giftcard_brands.terms,
        imageUrls: card.redemption_giftcard_items.redemption_giftcard_brands.imageUrls_json 
          ? JSON.parse(card.redemption_giftcard_items.redemption_giftcard_brands.imageUrls_json)
          : null
      } : null,
      provider: card.redemption_giftcard_items?.providers ? {
        id: card.redemption_giftcard_items.providers.id,
        name: card.redemption_giftcard_items.providers.name,
        code: card.redemption_giftcard_items.providers.code,
        enabled: card.redemption_giftcard_items.providers.enabled === 1,
        status: card.redemption_giftcard_items.providers.enabled === 1 ? 'active' : 'inactive'
      } : null
    }));

    return NextResponse.json({ 
      success: true, 
      data: formattedGiftCards 
    }, { 
      status: 200 
    });

  } catch (error) {
    console.error('Error fetching gift cards:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch gift cards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
}
