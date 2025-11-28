import { NextResponse } from "next/server";
import { getSystemActivity } from "../services/get-all-activities";
import { auth } from "@clerk/nextjs/server";

/**
 * GET handler for system activity endpoint
 * Returns system activity data from the database
 *
 * @returns {NextResponse} JSON response with system activity data
 */
export async function GET(request: Request) {
  try {
    // Check permissions
    const { has } = await auth();
    const canViewSystemActivity = has({
      permission: "org:system_activity:view",
    });
    if (!canViewSystemActivity) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get URL parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get("limit") || "100");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // Fetch system activity data
    const activities = await getSystemActivity(limit, offset);

    // Return the data as JSON
    return NextResponse.json(activities, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error in system activity API route:", error);
    return NextResponse.json(
      { error: "Failed to fetch system activity data" },
      { status: 500 }
    );
  }
}
