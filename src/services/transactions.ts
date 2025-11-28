import { db } from "@/utils/db";
import { formatTransaction } from "@/utils/transactionFormatters";

/**
 * Service for fetching and managing transactions
 * Centralizes database operations for cp_transactionlog table
 */

/**
 * Get a single transaction by its ID or transaction reference
 * Checks against both the primary ID and cp_transaction_reference
 * Returns the transaction with consistent formatting applied
 *
 * @param idOrRef - The ID or transaction reference to search for
 * @returns The formatted transaction or null if not found
 */
export async function getTransactionByOrderId(idOrRef: string) {
  if (!idOrRef) {
    throw new Error("Transaction ID or reference is required");
  }

  try {
    // Try to convert the input to a number for ID lookup
    const possibleId = parseInt(idOrRef, 10);
    const isValidId = !isNaN(possibleId);

    // Query by ID or transaction reference with an OR condition
    const transaction = await db.cp_transactionlog.findFirst({
      where: {
        OR: [
          // Only include the ID condition if we have a valid numeric ID
          ...(isValidId ? [{ id: possibleId }] : []),
          { cp_transaction_reference: idOrRef },
        ],
      },
    });

    // Apply consistent formatting to the transaction
    return transaction ? formatTransaction(transaction) : null;
  } catch (error) {
    console.error(
      `Error fetching transaction with ID/reference ${idOrRef}:`,
      error,
    );
    throw error;
  }
}

/**
 * Get a complete transaction with ALL fields and ALL relations by its ID or transaction reference
 * Returns the raw transaction data without formatting - includes all database fields
 * 
 * @param idOrRef - The ID or transaction reference to search for
 * @returns The complete transaction with all relations or null if not found
 */
export async function getCompleteTransactionById(idOrRef: string) {
  if (!idOrRef) {
    throw new Error("Transaction ID or reference is required");
  }

  // Try to convert the input to a number for ID lookup
  const possibleId = parseInt(idOrRef, 10);
  const isValidId = !isNaN(possibleId);

  try {

    // Query by ID or transaction reference with an OR condition
    // Include ALL relations to get complete data
    // Exclude problematic datetime fields that may have invalid values
    const transaction = await db.cp_transactionlog.findFirst({
      where: {
        OR: [
          // Only include the ID condition if we have a valid numeric ID
          ...(isValidId ? [{ id: possibleId }] : []),
          { cp_transaction_reference: idOrRef },
        ],
      },
      include: {
        member: {
          select: {
            memberid: true,
            name: true,
            email: true,
            mPhone: true,
            address: true,
            city: true,
            state: true,
            zip: true,
            gender: true,
            memberStatus: true,
            mode: true,
            create_date: true,
            update_date: true,
            dob: true,
            // Include member roles with enterprise information
            memberRoles: {
              select: {
                member_roleid: true,
                roleid: true,
                roleStatus: true,
                modDate: true,
                entid: true,
                skill: true,
                enterprise: {
                  select: {
                    ent_id: true,
                    ent_name: true,
                    ent_desc: true,
                    ent_type: true,
                    ent_status: true,
                    ent_phone: true,
                    ent_address: true,
                    ent_city: true,
                    ent_state: true,
                    ent_zip: true,
                  },
                },
              },
            },
            // Exclude lastViewed to avoid invalid datetime error
            // lastViewed: true,
          },
        },
        enterprise: true,
        redemption_giftcards: {
          include: {
            redemption_giftcard_items: {
              include: {
                redemption_giftcard_brands: true,
              },
            },
          },
        },
      },
    });

    return transaction;
  } catch (error) {
    console.error(
      `Error fetching complete transaction with ID/reference ${idOrRef}:`,
      error,
    );
    
    // If there's a database error related to invalid datetime values,
    // try again with a simpler query that doesn't include relations
    if (error instanceof Error && error.message.includes('datetime')) {
      console.warn(`Retrying transaction fetch without relations due to datetime error for ID/reference ${idOrRef}`);
      try {
        const simpleTransaction = await db.cp_transactionlog.findFirst({
          where: {
            OR: [
              // Only include the ID condition if we have a valid numeric ID
              ...(isValidId ? [{ id: possibleId }] : []),
              { cp_transaction_reference: idOrRef },
            ],
          },
          // No includes - just the transaction data
        });
        return simpleTransaction;
      } catch (fallbackError) {
        console.error(
          `Fallback query also failed for transaction ID/reference ${idOrRef}:`,
          fallbackError,
        );
        throw fallbackError;
      }
    }
    
    throw error;
  }
}

/**
 * Get recent transactions for a specific member
 * 
 * @param memberid - The member ID to fetch transactions for
 * @param limit - Number of recent transactions to fetch (default: 10)
 * @returns Array of recent transactions for the member
 */
export async function getMemberRecentTransactions(memberid: number, limit: number = 10) {
  if (!memberid) {
    throw new Error("Member ID is required");
  }

  try {
    const recentTransactions = await db.cp_transactionlog.findMany({
      where: {
        memberid: memberid,
        mode: "live", // Only show live transactions
      },
      orderBy: {
        date: 'desc', // Most recent first
      },
      take: limit,
      select: {
        id: true,
        date: true,
        result: true,
        order_amount: true,
        poynts: true,
        cp_transaction_reference: true,
        reward_name: true,
        cpid: true,
      },
    });

    // Format the transactions for the member component
    return recentTransactions.map(tx => ({
      id: tx.id,
      date: tx.date ? new Date(tx.date).toLocaleDateString() : 'N/A',
      result: tx.result || 'unknown',
      amount: tx.order_amount ? `$${parseFloat(tx.order_amount.toString()).toFixed(2)}` : '$0.00',
      poynts: tx.poynts || 0,
      reference_id: tx.cp_transaction_reference || 'N/A',
      reward_name: tx.reward_name || 'Gift Card Reward',
      cpid: tx.cpid || 'N/A',
    }));
  } catch (error) {
    console.error(`Error fetching recent transactions for member ${memberid}:`, error);
    throw error;
  }
}
