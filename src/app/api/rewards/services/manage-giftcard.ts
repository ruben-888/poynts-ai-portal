import { db } from "@/utils/db";
import { UserContext } from "../../_shared/types";
import { logActivity } from "../../sytem-activity/services/create-single-activity";

// Create Gift Card Types and Interfaces
interface CreateGiftCardData {
  brand_id: number;
  item_id?: number;
  cpid: string;
  language: string;
  value: number;
  poynts: number;
  reward_status: string;
  inventory_type: string;
  inventory_remaining: number;
  tags?: string;
  priority: number;
  auto_enable_tenant_id?: number;
}

export interface CreateGiftCardResult {
  success: boolean;
  data?: any;
  error?: string;
  validationErrors?: {
    field: string;
    message: string;
  }[];
}

// Delete Gift Card Types and Interfaces
export interface DeleteGiftCardResult {
  success: boolean;
  error?: string;
}

// Create Gift Card Function
export async function createGiftCard(
  data: CreateGiftCardData,
  userContext: UserContext
): Promise<CreateGiftCardResult> {
  try {
    // Start a transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      let itemId = data.item_id;

      // If item_id is not provided, find it based on brand_id and value
      if (!itemId) {
        const existingItem = await tx.redemption_giftcard_items.findFirst({
          where: {
            brand_id: data.brand_id,
            // Note: We might need to match on value from redemption_giftcards
            // since value is stored there, not in items table
          },
        });

        if (!existingItem) {
          // If no specific item found, just use the first item for this brand
          // This is a simplified approach - you might want to handle this differently
          const brandItem = await tx.redemption_giftcard_items.findFirst({
            where: {
              brand_id: data.brand_id,
            },
          });

          if (!brandItem) {
            throw new Error(`No gift card item found for brand_id: ${data.brand_id}`);
          }

          itemId = brandItem.item_id;
        } else {
          itemId = existingItem.item_id;
        }
      }

      // Verify the item exists
      const item = await tx.redemption_giftcard_items.findUnique({
        where: { item_id: itemId },
        include: {
          redemption_giftcard_brands: true,
        },
      });

      if (!item) {
        throw new Error(`Gift card item not found: ${itemId}`);
      }

      // Check for duplicate gift cards with same item_id and value/poynts/cpid
      const existingGiftCards = await tx.redemption_giftcards.findMany({
        where: {
          item_id: itemId,
          OR: [
            { value: data.value },
            { redem_value: data.poynts },
            { cpid: data.cpid },
          ],
        },
      });

      if (existingGiftCards.length > 0) {
        // Build validation errors for duplicate fields
        const validationErrors = [];
        
        if (existingGiftCards.some(gc => gc.value === data.value)) {
          validationErrors.push({
            field: 'value',
            message: `A gift card with value $${data.value} already exists for this item`
          });
        }
        if (existingGiftCards.some(gc => gc.redem_value === data.poynts)) {
          validationErrors.push({
            field: 'poynts',
            message: `A gift card with ${data.poynts} poynts already exists for this item`
          });
        }
        if (existingGiftCards.some(gc => gc.cpid === data.cpid)) {
          validationErrors.push({
            field: 'cpid',
            message: `A gift card with CPID ${data.cpid} already exists`
          });
        }
        
        // Return validation error response instead of throwing
        return {
          success: false,
          error: 'Duplicate gift card values detected',
          validationErrors
        };
      }

      // Create the gift card instance
      const giftCard = await tx.redemption_giftcards.create({
        data: {
          item_id: itemId,
          cpid: data.cpid,
          value: data.value,
          redem_value: data.poynts,
          language: data.language.toUpperCase(),
          inventory_type: data.inventory_type,
          inventory_remaining: data.inventory_remaining,
          tags: data.tags || null,
          priority: data.priority,
          custom_title: item.rewardName || "",
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      // If auto_enable_tenant_id is provided, automatically enable this gift card for that tenant
      if (data.auto_enable_tenant_id) {
        try {
          console.log("Auto-enabling gift card for tenant", {
            giftcard_id: giftCard.giftcard_id,
            tenant_id: data.auto_enable_tenant_id,
            redemption_type: "giftcard"
          });

          // Ensure proper type casting for the redemption_id
          const redemptionId = Number(giftCard.giftcard_id);

          // Check if registry already exists to avoid duplicates
          const existingRegistry = await tx.tenant_registry_redemptions.findFirst({
            where: {
              tenant_id: data.auto_enable_tenant_id,
              redemption_id: redemptionId,
              redemption_type: "giftcard",
            },
          });

          console.log("Existing registry check result:", existingRegistry);

          // Only create if it doesn't exist
          if (!existingRegistry) {
            const registryResult = await tx.tenant_registry_redemptions.create({
              data: {
                tenant_id: data.auto_enable_tenant_id,
                redemption_id: redemptionId,
                redemption_type: "giftcard",
              },
            });
            console.log("Successfully created registry entry:", registryResult);
          } else {
            console.log("Registry entry already exists, skipping creation");
          }
        } catch (autoEnableError) {
          console.error("Failed to auto-enable gift card for tenant:", autoEnableError);
          // Don't throw here - let gift card creation succeed even if auto-enable fails
          // We'll handle this gracefully and the user can manually enable later
        }
      }

      // Return the created gift card with full details
      const createdGiftCard = await tx.redemption_giftcards.findUnique({
        where: { giftcard_id: giftCard.giftcard_id },
        include: {
          redemption_giftcard_items: {
            include: {
              redemption_giftcard_brands: true,
              providers: true,
            },
          },
        },
      });

      return { createdGiftCard, item, itemId };
    });

    // Handle validation error response from transaction
    if (!result.success && result.validationErrors) {
      return result;
    }

    // Transform the result to match the expected format
    if (!result?.createdGiftCard) {
      throw new Error("Failed to create gift card");
    }

    // Log the activity outside the transaction to prevent conflicts
    // Add user info to metadata if available
    const metadata: Record<string, any> = {
      reward: {
        giftcard_id: result.createdGiftCard?.giftcard_id,
        item_id: result.itemId,
        auto_enabled_for_tenant: data.auto_enable_tenant_id,
        brand_name: result.item.redemption_giftcard_brands.brandName,
        reward_name: result.createdGiftCard?.custom_title,
        updated_fields: Object.keys(data),
        updated_values: data,
      },
    };

    // Prepare metadata with user info and reward update details
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

    await logActivity(
      "giftcard.create",
      `Created gift card: ${result.item.redemption_giftcard_brands.brandName} - $${data.value}`,
      {
        severity: "info",
        meta_data: metadata,
        reward_id: result.createdGiftCard?.giftcard_id,
        reward_type: "giftcard",
      }
    );

    const giftCard = result.createdGiftCard;

    return {
      success: true,
      data: {
        giftcard_id: giftCard.giftcard_id,
        item_id: giftCard.item_id,
        cpid: giftCard.cpid,
        value: giftCard.value,
        redem_value: giftCard.redem_value,
        language: giftCard.language,
        inventory_type: giftCard.inventory_type,
        inventory_remaining: giftCard.inventory_remaining,
        tags: giftCard.tags,
        priority: giftCard.priority,
        brand: giftCard.redemption_giftcard_items.redemption_giftcard_brands
          ? {
            id: giftCard.redemption_giftcard_items.redemption_giftcard_brands.brand_id,
            name: giftCard.redemption_giftcard_items.redemption_giftcard_brands.brandName || "",
            key: giftCard.redemption_giftcard_items.redemption_giftcard_brands.brandKey,
          }
          : null,
        provider: giftCard.redemption_giftcard_items.providers
          ? {
            id: giftCard.redemption_giftcard_items.providers.id,
            name: giftCard.redemption_giftcard_items.providers.name || "",
            code: giftCard.redemption_giftcard_items.providers.code || "",
          }
          : null,
        item: {
          item_id: giftCard.redemption_giftcard_items.item_id,
          utid: giftCard.redemption_giftcard_items.utid || "",
          rewardName: giftCard.redemption_giftcard_items.rewardName || "",
          reward_status: giftCard.redemption_giftcard_items.reward_status || "active",
          reward_availability: giftCard.redemption_giftcard_items.reward_availability || "AVAILABLE",
        },
      }
    };
  } catch (error) {
    console.error("Error in createGiftCard service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create gift card"
    };
  }
}

// Delete Gift Card Function
export async function deleteGiftCard(
  giftcardId: number,
  userContext: UserContext
): Promise<DeleteGiftCardResult> {
  try {
    // Start a transaction to ensure data consistency
    const result = await db.$transaction(async (tx) => {
      // First, get the gift card details for logging before deletion
      const giftCard = await tx.redemption_giftcards.findUnique({
        where: { giftcard_id: giftcardId },
        include: {
          redemption_giftcard_items: {
            include: {
              redemption_giftcard_brands: true,
            },
          },
        },
      });

      if (!giftCard) {
        throw new Error(`Gift card not found: ${giftcardId}`);
      }

      // Delete any tenant registry entries for this gift card
      await tx.tenant_registry_redemptions.deleteMany({
        where: {
          redemption_id: giftcardId,
          redemption_type: "giftcard",
        },
      });

      // Delete the gift card
      await tx.redemption_giftcards.delete({
        where: { giftcard_id: giftcardId },
      });

      return { giftCard };
    });

    // Log the activity outside the transaction to prevent conflicts
    const metadata: Record<string, any> = {
      reward: {
        giftcard_id: giftcardId,
        item_id: result.giftCard.item_id,
        brand_name: result.giftCard.redemption_giftcard_items.redemption_giftcard_brands.brandName,
        reward_name: result.giftCard.custom_title,
        value: result.giftCard.value,
        poynts: result.giftCard.redem_value,
        cpid: result.giftCard.cpid,
      },
    };

    // Add user info to metadata
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

    await logActivity(
      "giftcard.delete",
      `Deleted gift card: ${result.giftCard.redemption_giftcard_items.redemption_giftcard_brands.brandName} - $${result.giftCard.value}`,
      {
        severity: "warning",
        meta_data: metadata,
        reward_id: giftcardId,
        reward_type: "giftcard",
      }
    );

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in deleteGiftCard service:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete gift card"
    };
  }
}