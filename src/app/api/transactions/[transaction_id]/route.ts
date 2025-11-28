import { NextRequest, NextResponse } from "next/server";
import { getCompleteTransactionById, getMemberRecentTransactions } from "@/services/transactions";
import { getRequestLogsByTransactionRef } from "@/services/requestLogs";

/**
 * GET handler for complete transaction details API endpoint
 * Returns a transaction with ALL fields and ALL related request logs
 * 
 * @param request - The incoming request object
 * @param params - Object containing route parameters including transaction_id
 * @returns NextResponse with complete transaction data and all related request logs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { transaction_id: string } },
) {
  let transaction_id = "";
  try {
    ({ transaction_id } = await params);
    
    // Fetch the complete transaction from the database (all fields, all relations)
    const transaction = await getCompleteTransactionById(transaction_id);

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          message: `Transaction with ID or reference "${transaction_id}" not found`,
        },
        { status: 404 },
      );
    }

    // Initialize response data with the complete transaction
    const responseData = {
      transaction,
      request_logs: [] as any[],
      member: null as any,
    };

    // Get related request logs if transaction has a cp_transaction_reference
    let requestLogsMeta = {
      total: 0,
      limit: 50,
      offset: 0,
      hasMore: false,
    };

    if (transaction.cp_transaction_reference) {
      try {
        const relatedRequests = await getRequestLogsByTransactionRef(
          transaction.cp_transaction_reference,
        );
        
        responseData.request_logs = relatedRequests.data;
        requestLogsMeta = relatedRequests.meta;
      } catch (error) {
        console.error(
          `Error fetching request logs for transaction reference ${transaction.cp_transaction_reference}:`,
          error,
        );
        // Continue without request logs rather than failing the entire request
      }
    }

    // Get member data with recent transactions
    if (transaction.memberid) {
      try {
        const memberData = transaction.member;
        const recentTransactions = await getMemberRecentTransactions(transaction.memberid, 10);
        
        responseData.member = {
          // Include all the core member fields
          memberid: memberData?.memberid || transaction.memberid,
          name: memberData?.name,
          email: memberData?.email,
          phone: memberData?.mPhone,
          address: memberData?.address,
          city: memberData?.city,
          state: memberData?.state,
          zip: memberData?.zip,
          gender: memberData?.gender,
          status: memberData?.memberStatus,
          mode: memberData?.mode,
          dateCreated: memberData?.create_date,
          dateUpdated: memberData?.update_date,
          dateOfBirth: memberData?.dob,
          // Include member roles with enterprise information
          memberRoles: memberData?.memberRoles || [],
          // Add the recent transactions array
          recentTransactions,
        };
      } catch (error) {
        console.error(
          `Error fetching member data for member ID ${transaction.memberid}:`,
          error,
        );
        // Continue without member data rather than failing the entire request
        responseData.member = {
          memberid: transaction.memberid,
          recentTransactions: [],
        };
      }
    }

    // Return the complete transaction data with all related request logs
    return NextResponse.json({
      success: true,
      data: responseData,
      meta: {
        request_logs_meta: requestLogsMeta,
        request_logs_count: responseData.request_logs.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      `Error fetching complete transaction data for ID/reference ${transaction_id}:`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "An unknown error occurred",
        error: "Failed to fetch complete transaction data",
      },
      { status: 500 },
    );
  }
}
