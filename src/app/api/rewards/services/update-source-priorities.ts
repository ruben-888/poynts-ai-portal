import { db } from "@/utils/db";
import { PriorityUpdate } from "../(routes)/sources-priority/schema";

export interface UpdateSourcePrioritiesResult {
	success: boolean;
	updatedCount: number;
	message: string;
}

/**
 * Updates the priority values for multiple gift card sources
 * @param updates Array of priority updates with giftcard_id and new priority (pre-validated by schema)
 * @returns Result object with success status and update count
 */
export async function updateSourcePriorities(
	updates: PriorityUpdate[]
): Promise<UpdateSourcePrioritiesResult> {
	// Input is already validated by Zod schema in the route
	// No need for manual validation here
	try {
		// Update all priorities in a transaction
		const updatePromises = updates.map((update) =>
			db.redemption_giftcards.update({
				where: {
					giftcard_id: Number(update.giftcard_id)
				},
				data: {
					priority: update.priority,
					updated_at: new Date()
				},
			})
		);

		const results = await db.$transaction(updatePromises);

		return {
			success: true,
			updatedCount: results.length,
			message: `Successfully updated ${results.length} source priorities`,
		};
	} catch (error: any) {
		console.error("Error updating source priorities in database:", error);

		// Check if it's a Prisma error
		if (error.code === 'P2025') {
			throw new Error("One or more gift cards not found");
		}

		throw new Error(
			error.message || "Failed to update source priorities in database"
		);
	}
}
