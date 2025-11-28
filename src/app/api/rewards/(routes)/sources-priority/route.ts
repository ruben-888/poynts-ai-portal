import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { updateSourcePriorities } from "../../services/update-source-priorities";
import { sourcePriorityRequestSchema } from "./schema";

export async function PUT(request: NextRequest) {
	try {
		const { has } = await auth();

		// Check if user has permission to manage rewards
		if (!has({ permission: "org:rewards:manage" })) {
			return NextResponse.json(
				{ error: "You don't have permission to update reward priorities" },
				{ status: 403 }
			);
		}

		// Parse and validate request body using Zod schema
		const body = await request.json();
		const parseResult = sourcePriorityRequestSchema.safeParse(body);
		if (!parseResult.success) {
			console.log(`[PUT /api/rewards/sources-priority] Validation failed:`, parseResult.error.flatten());
			return NextResponse.json(
				{
					error: "Validation error",
					details: parseResult.error.flatten()
				},
				{ status: 400 }
			);
		}

		// Call the service function to update priorities
		const result = await updateSourcePriorities(parseResult.data.updates);
		return NextResponse.json({
			success: result.success,
			message: result.message
		});
	} catch (error: any) {
		console.error("[PUT /api/rewards/sources-priority] Error:", error);

		// Return appropriate error response based on error type
		if (error.message?.includes("required") || error.message?.includes("Invalid")) {
			return NextResponse.json(
				{ error: error.message },
				{ status: 400 }
			);
		}

		if (error.message?.includes("not found")) {
			return NextResponse.json(
				{ error: error.message },
				{ status: 404 }
			);
		}

		return NextResponse.json(
			{ error: "Failed to update source priorities" },
			{ status: 500 }
		);
	}
}
