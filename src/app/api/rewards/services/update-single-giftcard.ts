import { db } from "@/utils/db";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { UserContext, GiftCardUpdateData } from "../types";

export async function UpdateSingleGiftCard(
  giftcard_id: number,
  data: GiftCardUpdateData,
  userContext?: UserContext
) {
  // console.log("giftcard_id", giftcard_id);
  // console.log("dataForGiftcard", data);

  // Check if at least one field is provided
  if (Object.keys(data).length === 0) {
    throw new Error("At least one field must be provided for update");
  }

  // Separate fields that belong to different tables
  const {
    reward_status,
    rebate_provider_percentage,
    rebate_base_percentage,
    rebate_customer_percentage,
    rebate_cp_percentage,
    ...giftcardData
  } = data;

  // Map the data to match the Prisma model fields for redemption_giftcards table
  const updateData: Record<string, any> = {
    item_id: giftcardData.item_id,
    value: giftcardData.value,
    redem_value: giftcardData.redem_value,
    inventory_type: giftcardData.inventory_type,
    inventory_remaining: giftcardData.inventory_remaining,
    language: giftcardData.language,
    tags: giftcardData.tags,
    cpid: giftcardData.cpid,
    priority: giftcardData.priority,
    custom_title: giftcardData.custom_title,
    updated_at: new Date(),
  };

  // console.log("updateDataForGiftcard", updateData);

  // Remove undefined values
  Object.keys(updateData).forEach(
    (key) => updateData[key] === undefined && delete updateData[key]
  );

  try {
    // Variables to track status changes for logging
    let oldStatus: string | null = null;
    let statusChanged = false;

    // Check if we need to update the related item (for reward_status or rebate fields)
    const needsItemUpdate = reward_status !== undefined ||
      rebate_provider_percentage !== undefined ||
      rebate_base_percentage !== undefined ||
      rebate_customer_percentage !== undefined ||
      rebate_cp_percentage !== undefined;

    if (needsItemUpdate) {
      // First get the current giftcard with related item to find the item_id and current status
      const currentGiftCard = await db.redemption_giftcards.findUnique({
        where: { giftcard_id },
        select: {
          item_id: true,
          redemption_giftcard_items: {
            select: { reward_status: true }
          }
        },
      });

      if (!currentGiftCard) {
        throw new Error(`Gift card with ID ${giftcard_id} not found`);
      }

      // If updating status, check if it's actually changing
      if (reward_status !== undefined) {
        oldStatus = currentGiftCard.redemption_giftcard_items?.reward_status || null;
        statusChanged = oldStatus !== reward_status;
      }

      // Prepare item update data
      const itemUpdateData: Record<string, any> = {};

      if (reward_status !== undefined) {
        itemUpdateData.reward_status = reward_status;
      }

      if (rebate_provider_percentage !== undefined) {
        itemUpdateData.rebate_provider_percentage = rebate_provider_percentage;
      }

      if (rebate_base_percentage !== undefined) {
        itemUpdateData.rebate_base_percentage = rebate_base_percentage;
      }

      if (rebate_customer_percentage !== undefined) {
        itemUpdateData.rebate_customer_percentage = rebate_customer_percentage;
      }

      if (rebate_cp_percentage !== undefined) {
        itemUpdateData.rebate_cp_percentage = rebate_cp_percentage;
      }

      // Update the related item
      await db.redemption_giftcard_items.update({
        where: { item_id: currentGiftCard.item_id },
        data: itemUpdateData,
      });
    }

    // Perform the update with updated_at set to current time
    const updatedGiftCard = await db.redemption_giftcards.update({
      where: {
        giftcard_id: giftcard_id,
      },
      data: updateData,
    });

    // Fetch the gift card with related brand and item information for better logging
    const giftCardWithDetails = await db.redemption_giftcards.findUnique({
      where: { giftcard_id },
      include: {
        redemption_giftcard_items: {
          include: {
            redemption_giftcard_brands: true,
          },
        },
      },
    });

    const brandName =
      giftCardWithDetails?.redemption_giftcard_items?.redemption_giftcard_brands
        ?.brandName || "Unknown Brand";
    const rewardName =
      giftCardWithDetails?.redemption_giftcard_items?.rewardName ||
      "Unknown Reward";
    const cpid = giftCardWithDetails?.cpid;
    const value = giftCardWithDetails?.value;

    // Prepare metadata with user info and reward update details
    const metadata: Record<string, any> = {
      reward: {
        giftcard_id,
        item_id: updatedGiftCard.item_id,
        brand_name: brandName,
        reward_name: rewardName,
        cpid: cpid,
        value: value,
        updated_fields: Object.keys(data),
        updated_values: data,
      },
    };

    // Add user info to metadata if available
    if (userContext) {
      metadata.user = userContext;
    }
    console.log("metadataForGiftcardUpdate", metadata);
    // Log the activity with descriptive message
    await logActivity(
      "reward.update",
      `Gift card "${cpid}" updated`,
      {
        severity: "info",
        meta_data: metadata,
        reward_id: giftcard_id,
        reward_type: "giftcard",
      }
    );

    // If status changed, log a separate status change activity
    if (statusChanged && oldStatus !== null && reward_status !== undefined) {
      // Use the same metadata structure but add status change specific fields
      const statusChangeMetadata = {
        ...metadata,
        reward: {
          ...metadata.reward,
          old_status: oldStatus,
          new_status: reward_status,
        },
      };

      // Log the status change activity
      await logActivity(
        "reward.status_change",
        `Gift card "${cpid}" status changed from '${oldStatus}' to '${reward_status}'`,
        {
          severity: "info",
          meta_data: statusChangeMetadata,
          reward_id: giftcard_id,
          reward_type: "giftcard",
        }
      );
    }

    return updatedGiftCard;
  } catch (error) {
    // Log the error to console
    console.error(`Failed to update giftcard ${giftcard_id}:`, error);

    throw error;
  }
}
