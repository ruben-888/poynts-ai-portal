import { db } from "@/utils/db";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { UserContext, RedemptionItemUpdateData } from "../types";

export async function updateSingleRedemptionItem(
  item_id: number,
  data: RedemptionItemUpdateData,
  userContext?: UserContext,
  identifier?: string
) {
  // Check if at least one field is provided
  if (Object.keys(data).length === 0) {
    throw new Error("At least one field must be provided for update");
  }

  try {
    // Perform the update
    const updatedItem = await db.redemption_giftcard_items.update({
      where: {
        item_id: item_id,
      },
      data: data,
    });

    // Fetch the brand and reward information for better logging
    const itemWithBrand = await db.redemption_giftcard_items.findUnique({
      where: { item_id },
      include: {
        redemption_giftcard_brands: true,
      },
    });

    const brandName =
      itemWithBrand?.redemption_giftcard_brands?.brandName || "Unknown Brand";
    const rewardName = itemWithBrand?.rewardName || "Unknown Reward";
    const displayName = `${brandName} ${rewardName}`.trim();

    // Use identifier if provided, otherwise use display name
    const displayId = identifier || displayName;

    // Prepare metadata with user info and reward update details
    const metadata: Record<string, any> = {
      reward: {
        item_id,
        identifier: displayId,
        brand_name: brandName,
        reward_name: rewardName,
        updated_fields: Object.keys(data),
        updated_values: data,
      },
    };

    // Add user info to metadata if available
    if (userContext) {
      metadata.user = {
        userId: userContext.userId,
        userIdExternal: userContext.userIdExternal,
        actor: userContext.actor,
        firstName: userContext.firstName,
        lastName: userContext.lastName,
        fullName: userContext.fullName,
        primaryEmail: userContext.primaryEmail,
        orgRole: userContext.orgRole,
        orgName: userContext.orgName,
        orgSlug: userContext.orgSlug,
      };
    }

    // Log the activity with descriptive message
    await logActivity(
      "reward.update",
      `Gift card "${displayId}" updated`,
      {
        severity: "info",
        meta_data: metadata,
        reward_id: item_id,
        reward_type: "giftcard",
      }
    );

    return updatedItem;
  } catch (error) {
    // Log the error to console instead of activity log
    console.error(`Failed to update giftcard item ${item_id}:`, error);

    throw error;
  }
}

/**
 * Helper function to specifically update the reward_status of a gift card item
 * with enhanced logging that includes the previous status
 */
export async function updateSingleRedemptionItemStatus(
  item_id: number,
  newStatus: string,
  oldStatus: string,
  identifier?: string,
  userContext?: UserContext
) {
  try {
    // Use the existing update function to perform the actual update
    const updatedItem = await updateSingleRedemptionItem(
      item_id,
      {
        reward_status: newStatus,
      },
      userContext,
      identifier
    );

    // Use identifier if provided for logging
    const displayId = identifier || `Item ${item_id}`;

    // Prepare metadata with user info and status change details
    const metadata: Record<string, any> = {
      reward: {
        item_id,
        identifier: displayId,
        old_status: oldStatus,
        new_status: newStatus,
      },
    };

    // Add user info to metadata if available
    if (userContext) {
      metadata.user = userContext;
    }

    // Log the activity with old and new status information
    await logActivity(
      "reward.status_change",
      `Gift card "${displayId}" status changed from '${oldStatus}' to '${newStatus}'`,
      {
        severity: "info",
        meta_data: metadata,
        reward_id: item_id,
        reward_type: "giftcard",
      }
    );

    return updatedItem;
  } catch (error) {
    console.error(
      `Failed to update status for giftcard item ${item_id} from '${oldStatus}' to '${newStatus}':`,
      error
    );
    throw error;
  }
}
