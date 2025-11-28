import { NextResponse } from "next/server";
import { getRequestLogs } from "@/services/requestLogs";

/**
 * API endpoint that returns request_log data from the database
 * Supports filtering by platform, method, direction, and more
 * Supports filtering by multiple IDs using comma-delimited list
 * Supports pagination with limit and offset parameters
 *
 * @returns {NextResponse} Response with request_log data
 */
export async function GET(request: Request) {
  try {
    // Parse query parameters
    const url = new URL(request.url);
    const platform = url.searchParams.get("platform") || undefined;
    const method = url.searchParams.get("method") || undefined;
    const direction = url.searchParams.get("direction") || undefined;
    const rewardId = url.searchParams.get("reward_id") || undefined;
    const transactionRef =
      url.searchParams.get("cp_transaction_reference") || undefined;
    const endpoint = url.searchParams.get("endpoint") || undefined;
    const ids = url.searchParams.get("ids") || undefined;

    // Pagination parameters
    const limit = parseInt(url.searchParams.get("limit") || "100", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    // Sorting parameters
    const sortBy = url.searchParams.get("sort_by") || "request_date";
    const sortOrder = url.searchParams.get("sort_order") || "desc";

    // Use the centralized service to get request logs
    const result = await getRequestLogs({
      platform,
      method,
      direction,
      rewardId,
      transactionRef,
      endpoint,
      ids,
      limit,
      offset,
      sortBy,
      sortOrder: sortOrder as "asc" | "desc",
    });

    return NextResponse.json({
      success: true,
      data: result.data,
      meta: result.meta,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching request logs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch request logs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
