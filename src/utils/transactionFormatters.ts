import { convertKeysToCamelCase } from "./formatters";

/**
 * Common utility for transforming transaction data consistently across API endpoints
 *
 * This function:
 * 1. Handles CPID/CPIDX formatting (CPID is truncated, CPIDX has the full value)
 * 2. Formats dates to ISO strings
 * 3. Adds a source property extracted from CPID
 * 4. Sets rewardId to promo_id or reward_id
 * 5. Converts all keys to camelCase using the common formatter
 *
 * @param transaction - Raw transaction data from the database
 * @returns Formatted transaction data with consistent formatting
 */
export function formatTransaction(transaction: any) {
  if (!transaction) {
    return null;
  }

  // Handle null CPID values
  const cpid = transaction.cpid || "";
  const cpidParts = cpid.split("-");

  // Format the date as ISO string if it exists
  let formattedDate = null;
  if (transaction.date) {
    try {
      // Check if date is already a Date object or needs to be converted
      const dateObj =
        transaction.date instanceof Date
          ? transaction.date
          : new Date(transaction.date);

      // Format as ISO string if valid date
      if (!isNaN(dateObj.getTime())) {
        formattedDate = dateObj.toISOString();
      }
    } catch (e) {
      console.error("Error formatting date:", e);
    }
  }

  // Create a new object with the transformed properties
  const transformedTransaction = {
    ...transaction,
    cpidx: cpid,
    cpid: cpidParts.slice(0, 4).join("-"),
    source: cpidParts.length >= 6 ? cpidParts[cpidParts.length - 2] : null,
    rewardId: transaction.promo_id || transaction.reward_id,
    date: formattedDate,
  };

  // Convert all keys to camelCase
  return convertKeysToCamelCase(transformedTransaction);
}

/**
 * Format multiple transactions at once
 * @param transactions - Array of raw transactions from the database
 * @returns Array of formatted transactions
 */
export function formatTransactions(transactions: any[]) {
  if (!transactions || !Array.isArray(transactions)) {
    return [];
  }

  return transactions.map(formatTransaction);
}
