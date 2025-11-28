import { NextRequest, NextResponse } from "next/server";
import { getTransactionByOrderId } from "@/services/transactions";
import { getRequestLogsByTransactionRef } from "@/services/requestLogs";

/**
 * GET handler for transactions API endpoint
 * Returns a transaction and its related API requests
 * Looks up transaction by ID or transaction reference
 *
 * @param request - The incoming request object
 * @param params - Object containing route parameters including order_id
 * @returns NextResponse with transaction data and related API requests
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { order_id: string } },
) {
  try {
    // Extract the order_id from the route parameters
    // This can be either the transaction ID or the transaction reference
    const idOrRef = params.order_id;

    // Fetch the transaction from the database (by ID or reference)
    // The transaction is now formatted consistently by the service
    const transaction = await getTransactionByOrderId(idOrRef);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: `Transaction with ID or reference "${idOrRef}" not found`,
        },
        { status: 404 },
      );
    }

    // Make sure we have a transaction reference before querying related requests
    // Note: key is now camelCase (cpTransactionReference)
    if (!transaction.cpTransactionReference) {
      return NextResponse.json({
        success: true,
        data: {
          transaction,
          related_requests: [],
        },
        meta: {
          request_logs_meta: {
            total: 0,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        },
        message:
          "Transaction found but has no transaction reference for querying related API requests",
        timestamp: new Date().toISOString(),
      });
    }

    // Fetch related API requests using the transaction reference
    const relatedRequests = await getRequestLogsByTransactionRef(
      transaction.cpTransactionReference,
    );

    // Return the transaction data along with related API requests
    return NextResponse.json({
      success: true,
      data: {
        transaction,
        related_requests: relatedRequests.data,
      },
      meta: {
        request_logs_meta: relatedRequests.meta,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      `Error fetching transaction with ID/reference ${params.order_id}:`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        error: "Failed to fetch transaction data",
      },
      { status: 500 },
    );
  }
}
