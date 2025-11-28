import { NextResponse } from "next/server";
import { db } from "@/utils/db";
import type { NextRequest } from "next/server";
import { formatTransactions } from "@/utils/transactionFormatters";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");
    const sortBy = searchParams.get("sortBy") || "id";
    const sortOrder = (
      searchParams.get("sortOrder") || "desc"
    ).toLowerCase() as "asc" | "desc";
    const includeTest = searchParams.get("include_test") === "true";
    const isAdminMode = searchParams.get("mode") === "Admin";

    // Validate limit to prevent excessive data fetching
    const validatedLimit = Math.min(Math.max(1, limit), 10000);

    // Get filter parameters
    const rewardId = searchParams.get("reward_id")
      ? parseInt(searchParams.get("reward_id")!)
      : undefined;
    const memberId = searchParams.get("member_id")
      ? parseInt(searchParams.get("member_id")!)
      : undefined;
    const rewardItemId = searchParams.get("reward_item_id")
      ? parseInt(searchParams.get("reward_item_id")!)
      : undefined;
    const custTransactionReference = searchParams.get("cust_transaction_reference");

    // Build where clause based on filters
    const whereClause: any = {
      mode: includeTest ? { in: ["live", "test"] } : "live",
    };
    if (rewardId) whereClause.reward_id = rewardId;
    if (memberId) whereClause.memberid = memberId;
    if (custTransactionReference) {
      whereClause.cust_transaction_reference = {
        contains: custTransactionReference,
      };
    }

    // Add filter for reward_item_id if provided
    if (rewardItemId) {
      // First, get the utid from the redemption_giftcard_items table
      const giftCardItem = await db.redemption_giftcard_items.findUnique({
        where: { item_id: rewardItemId },
        select: { utid: true },
      });

      // If we found a matching gift card item with a utid, filter transactions by that utid
      if (giftCardItem && giftCardItem.utid) {
        whereClause.provider_reward_id = giftCardItem.utid;
      } else {
        // If no matching gift card item was found or it has no utid, return empty results
        // This ensures we don't return unrelated transactions when the item_id doesn't exist
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            total: 0,
            limit: validatedLimit,
            offset,
            hasMore: false,
          },
        });
      }
    }

    // Define base fields that are always included
    const baseSelect = {
      id: true,
      result: true,
      promo_id: true,
      reward_id: true,
      cpid: true,
      // reward_type: true,
      mode: true,
      entity_type: true,
      date: true,
      entid: true,
      memberid: true,
      poynts: true,
      order_amount: true,
      provider_reference_id: true,
      provider_id: true,
      reward_name: true,
      provider_reward_id: true,
      rebate_customer_amount: true,
      cp_transaction_reference: true,
      cust_transaction_reference: true,
      // message: true,
      // Include enterprise relationship to get ent_name
      enterprise: {
        select: {
          ent_name: true,
        },
      },
      // Include gift card details using the new relationship
      redemption_giftcards: {
        select: {
          giftcard_id: true,
          value: true,
          cpid: true,
          custom_title: true,
          redemption_giftcard_items: {
            select: {
              rewardName: true,
              utid: true,
              // brand_id: true,
              redemption_giftcard_brands: {
                select: {
                  brandName: true,
                  // imageUrls_json: true,
                },
              },
            },
          },
        },
      },
    };

    // Add admin-only fields if in admin mode
    const selectFields = isAdminMode
      ? {
          ...baseSelect,
          provider_balance: true,
          rebate_provider_amount: true,
          rebate_cp_amount: true,
          order_provider_amount: true,
          reconciled: true,
        }
      : baseSelect;

    const transactions = await db.cp_transactionlog.findMany({
      take: validatedLimit,
      skip: offset,
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder,
      },
      select: selectFields,
    });

    // Extract enterprise name and gift card details before formatting transactions
    const transactionsWithDetails = transactions.map((transaction) => {
      // Extract enterprise name
      const entName = transaction.enterprise?.ent_name;

      // Extract gift card details if available
      let giftcardData = null;
      if (transaction.redemption_giftcards) {
        const giftcard = transaction.redemption_giftcards as any;
        const giftcardItem = giftcard.redemption_giftcard_items as any;
        const giftcardBrand = giftcardItem?.redemption_giftcard_brands as any;

        giftcardData = {
          giftcard_id: giftcard.giftcard_id,
          value: giftcard.value,
          cpid: giftcard.cpid,
          title: giftcard.custom_title,
          reward_name: giftcardItem?.rewardName,
          brand_name: giftcardBrand?.brandName,
          brand_id: giftcardItem?.brand_id,
          utid: giftcardItem?.utid,
          image_urls: giftcardBrand?.imageUrls_json,
        };
      }

      // Remove the nested objects since the formatter doesn't handle them well
      const { enterprise, redemption_giftcards, ...rest } = transaction;

      // Add extracted data as direct properties
      return {
        ...rest,
        ent_name: entName || null,
        giftcard: giftcardData,
      };
    });

    // Use the shared transaction formatter to process transactions
    const formattedTransactions = formatTransactions(transactionsWithDetails);

    // Count total with filters applied
    const total = await db.cp_transactionlog.count({
      where: whereClause,
    });

    console.log(
      `API: Requested limit=${limit}, Validated limit=${validatedLimit}, Actual transactions=${formattedTransactions.length}, Total available=${total}`,
    );

    return NextResponse.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        total,
        limit: validatedLimit,
        offset,
        hasMore: offset + transactions.length < total,
      },
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch transactions",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
