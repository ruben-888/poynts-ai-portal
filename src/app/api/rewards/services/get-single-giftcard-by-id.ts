import { db } from "@/utils/db";

export async function getSingleGiftCardById(giftcard_id: number) {
  try {
    // Fetch the giftcard data
    const giftcard = await db.redemption_giftcards.findUnique({
      where: {
        giftcard_id,
      },
      include: {
        redemption_giftcard_items: {
          include: {
            redemption_giftcard_brands: true,
          },
        },
      },
    });

    if (!giftcard) {
      throw new Error(`Giftcard with id ${giftcard_id} not found`);
    }

    return giftcard;
  } catch (error) {
    console.error(`Failed to get giftcard ${giftcard_id}:`, error);
    throw error;
  }
}
