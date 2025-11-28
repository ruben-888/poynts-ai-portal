import { z } from "zod";

/**
 * Schema for individual priority update
 */
export const priorityUpdateSchema = z.object({
	giftcard_id: z
		.number({
			required_error: "giftcard_id is required",
			invalid_type_error: "giftcard_id must be a number",
		})
		.int("giftcard_id must be an integer")
		.positive("giftcard_id must be a positive number"),
	priority: z
		.number({
			required_error: "priority is required",
			invalid_type_error: "priority must be a number",
		})
		.int("priority must be an integer")
		.min(1, "priority must be at least 1"),
});

/**
 * Schema for the request body containing array of priority updates
 */
export const sourcePriorityRequestSchema = z.object({
	updates: z
		.array(priorityUpdateSchema)
		.nonempty("Updates array cannot be empty")
		.refine(
			(updates) => {
				// Check for duplicate giftcard_ids
				const ids = updates.map((u) => u.giftcard_id);
				return new Set(ids).size === ids.length;
			},
			{
				message: "Duplicate giftcard_ids are not allowed in updates",
			}
		)
		.refine(
			(updates) => {
				// Check for duplicate priorities
				const priorities = updates.map((u) => u.priority);
				return new Set(priorities).size === priorities.length;
			},
			{
				message: "Each source must have a unique priority value",
			}
		),
});
// Export inferred types
export type PriorityUpdate = z.infer<typeof priorityUpdateSchema>;
export type SourcePriorityRequest = z.infer<typeof sourcePriorityRequestSchema>;
