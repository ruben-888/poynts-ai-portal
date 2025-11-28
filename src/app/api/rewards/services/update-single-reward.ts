import { db } from "@/utils/db";
import { Prisma } from "@prisma/client";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { UserContext } from "../types";

interface UpdateRewardData {
  poynts?: number;
  tags?: string[];
}

export async function updateSingleReward(
  cpid: string,
  data: UpdateRewardData,
  userContext?: UserContext
) {
  try {
    // Convert tags array to comma-separated string if provided
    const tagsString = data.tags ? data.tags.join(",") : undefined;

    // Prepare the update data object
    const updateData: any = {};

    if (data.poynts !== undefined) {
      updateData.redem_value = data.poynts; // Keep as number for Prisma
    }

    if (tagsString !== undefined) {
      updateData.tags = tagsString;
    }

    let updatedCount = 0;

    // Only proceed if there's data to update
    if (Object.keys(updateData).length > 0) {
      // Update only giftcards with this CPID
      const updatedGiftcards = await db.redemption_giftcards.updateMany({
        where: {
          OR: [{ cpid }, { cpid: { startsWith: `${cpid}-` } }],
        },
        data: updateData,
      });

      updatedCount = updatedGiftcards.count;

      console.log(
        `Updated ${updatedCount} giftcards for CPID ${cpid}`
      );

      // Prepare metadata with user info and reward update details
      const metadata: Record<string, any> = {
        reward: {
          cpid,
          updated_fields: Object.keys(data),
          updated_values: {
            poynts: data.poynts,
            tags: data.tags,
          },
          giftcards_updated: updatedCount,
        },
      };

      // Add user info to metadata if available
      if (userContext) {
        metadata.user = userContext;
      }

      // Log the activity with descriptive message
      await logActivity(
        "reward.update",
        `Gift card "${cpid}" updated`,
        {
          severity: "info",
          meta_data: metadata,
          reward_type: "giftcard",
        }
      );
    }

    return {
      cpid,
      poynts: data.poynts,
      tags: tagsString,
      updated: true,
      message: `Reward updated successfully across ${updatedCount} giftcards`,
      itemsUpdated: updatedCount,
      giftcardsUpdated: updatedCount,
    };
  } catch (error) {
    // Log the error to console instead of activity log
    console.error(`Failed to update reward ${cpid}:`, error);
    throw new Error("Failed to update reward");
  }
}
