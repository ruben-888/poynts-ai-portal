import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { auth } from "@clerk/nextjs/server";

// Define schema for input data
interface EnableRewardsRequest {
  tenant_id: string | number;
  rewards: Array<{
    cpid: string;
    type: "giftcard" | "offer";
    items: Array<{
      redemption_id: string | number;
      redemption_type: string;
    }>;
  }>;
}

export async function POST(req: NextRequest) {
  try {
    console.log("enable-rewards enpoint");
    const { has } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data: EnableRewardsRequest = await req.json();

    if (!data.tenant_id) {
      return NextResponse.json(
        { error: "tenant_id is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(data.rewards) || data.rewards.length === 0) {
      return NextResponse.json(
        { error: "At least one reward is required" },
        { status: 400 },
      );
    }

    const results = [];
    const tenantId = Number(data.tenant_id);

    // Process each reward
    for (const reward of data.rewards) {
      // Process each item in the reward
      for (const item of reward.items) {
        const redemptionId = Number(item.redemption_id);

        // Check if registry already exists to avoid duplicates
        const existingRegistry = await db.tenant_registry_redemptions.findFirst(
          {
            where: {
              tenant_id: tenantId,
              redemption_id: redemptionId,
              redemption_type: item.redemption_type,
            },
          },
        );

        // Only create if it doesn't exist
        if (!existingRegistry) {
          const created = await db.tenant_registry_redemptions.create({
            data: {
              tenant_id: tenantId,
              redemption_id: redemptionId,
              redemption_type: item.redemption_type,
            },
          });

          results.push({
            cpid: reward.cpid,
            redemption_id: item.redemption_id,
            redemption_type: item.redemption_type,
            status: "enabled",
          });
        } else {
          results.push({
            cpid: reward.cpid,
            redemption_id: item.redemption_id,
            redemption_type: item.redemption_type,
            status: "already_enabled",
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      enabled: results.length,
      results,
    });
  } catch (error) {
    console.error("Error enabling rewards:", error);
    return NextResponse.json(
      { error: "Failed to enable rewards" },
      { status: 500 },
    );
  }
}
