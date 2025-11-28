import { db } from "@/utils/db";
import { logActivity } from "@/app/api/sytem-activity/services/create-single-activity";
import { UserContext, OfferUpdateData } from "../types";

export async function updateSingleOffer(
  offer_id: number,
  data: OfferUpdateData,
  userContext?: UserContext
) {
  // Check if at least one field is provided
  if (Object.keys(data).length === 0) {
    throw new Error("At least one field must be provided for update");
  }

  try {
    // Perform the update and get the needed fields in one call
    const updatedOffer = await db.cp_redemptions.update({
      where: {
        id: offer_id,
      },
      data: data,
      select: {
        cpid: true,
        title: true,
        brandName: true,
      }
    });

    const brandName = updatedOffer?.brandName || "";
    const offerTitle = updatedOffer?.title || "";
    const displayName = `${brandName} ${offerTitle}`.trim();
    const displayId = updatedOffer?.cpid || displayName;

    // Prepare metadata with user info and offer update details
    const metadata: Record<string, any> = {
      reward: {
        offer_id,
        cpid: updatedOffer?.cpid || "",
        brand_name: brandName,
        offer_title: offerTitle,
        updated_fields: Object.keys(data),
        updated_values: data,
      },
    };

    // Add user info to metadata if available
    if (userContext) {
      metadata.user = userContext;
    }

    // Log the activity with descriptive message
    await logActivity(
      "reward.update",
      `Offer "${displayId}" updated`,
      {
        severity: "info",
        meta_data: metadata,
        reward_id: offer_id,
        reward_type: "offer",
      }
    );

    return updatedOffer;
  } catch (error) {
    // Log the error to console instead of activity log
    console.error(`Failed to update offer ${offer_id}:`, error);
    throw error;
  }
}

/**
 * Helper function to specifically update the reward_status of an offer
 * with enhanced logging that includes the previous status
 */
export async function updateSingleOfferStatus(
  offer_id: number,
  newStatus: string,
  oldStatus: string,
  identifier?: string,
  userContext?: UserContext
) {
  try {
    // Use the existing update function to perform the actual update
    const updatedOffer = await updateSingleOffer(
      offer_id,
      {
        reward_status: newStatus,
        updated_at: new Date(),
      },
      userContext
    );

    // Use identifier if provided for logging
    const displayId = identifier || `Offer ${offer_id}`;

    // Prepare metadata with user info and status change details
    const metadata: Record<string, any> = {
      reward: {
        offer_id,
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
      `Offer "${displayId}" status changed from '${oldStatus}' to '${newStatus}'`,
      {
        severity: "info",
        meta_data: metadata,
        reward_id: offer_id,
        reward_type: "offer",
      }
    );

    return updatedOffer;
  } catch (error) {
    console.error(
      `Failed to update status for offer ${offer_id} from '${oldStatus}' to '${newStatus}':`,
      error
    );
    throw error;
  }
}
