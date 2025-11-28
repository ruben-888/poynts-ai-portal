import { db } from "@/utils/db";

/**
 * Service for fetching and managing request logs
 * Centralizes database operations for request_log table
 */

/**
 * Fetch request logs with optional filtering parameters
 *
 * @param params - Filter and pagination parameters
 * @returns Object containing request logs and pagination metadata
 */
export async function getRequestLogs({
  platform,
  method,
  direction,
  rewardId,
  transactionRef,
  endpoint,
  ids,
  limit = 100,
  offset = 0,
  sortBy = "request_date",
  sortOrder = "desc",
}: {
  platform?: string;
  method?: string;
  direction?: string;
  rewardId?: string;
  transactionRef?: string;
  endpoint?: string;
  ids?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) {
  try {
    // Build filter conditions
    const where: any = {};

    if (platform) where.platform = platform;
    if (method) where.method = method;
    if (direction) where.direction = direction;
    if (rewardId) where.reward_id = rewardId;
    if (transactionRef) where.cp_transaction_reference = transactionRef;
    if (endpoint) where.endpoint = { contains: endpoint };

    // Process comma-delimited IDs if provided
    if (ids) {
      const idArray = ids
        .split(",")
        .map((id) => id.trim())
        .filter((id) => id);
      if (idArray.length > 0) {
        // Assuming id is a number field - convert strings to numbers
        where.id = {
          in: idArray.map((id) => parseInt(id, 10)).filter((id) => !isNaN(id)),
        };
      }
    }

    // Fetch request_log data from the database with filters and pagination
    const requestLogs = await db.request_log.findMany({
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip: offset,
      take: Math.min(limit, 500), // Limit to max 500 records per request
    });

    // Get total count for pagination
    const totalCount = await db.request_log.count({ where });

    return {
      data: requestLogs,
      meta: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + requestLogs.length < totalCount,
      },
    };
  } catch (error) {
    console.error("Error fetching request logs:", error);
    throw error;
  }
}

/**
 * Get all request logs related to a specific transaction reference
 *
 * @param transactionRef - The transaction reference to filter by
 * @returns Array of request logs related to the transaction
 */
export async function getRequestLogsByTransactionRef(transactionRef: string) {
  if (!transactionRef) {
    throw new Error("Transaction reference is required");
  }

  return getRequestLogs({
    transactionRef,
    limit: 50, // Reasonable limit for related requests
  });
}
