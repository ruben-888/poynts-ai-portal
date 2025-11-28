import {
  getTransactions,
  getTransactionsWithMetadata,
  getMemberTransactions,
  getEnterpriseTransactions,
  getMembers,
  getMembersWithMetadata,
  getEnterpriseMembers,
  dashboardService,
  TransactionDateRange,
} from "./dashboard";

/**
 * Example usage of the dashboard service functions
 */
async function exampleUsage() {
  try {
    // Example 1: Get transactions for the last 24 hours (default)
    console.log("Fetching transactions for the last 24 hours...");
    const recentTransactions = await getTransactions();
    console.log(
      `Found ${recentTransactions.length} transactions in the last 24 hours`,
    );

    // Example 2: Get transactions for a specific date range
    const lastWeekDateRange: TransactionDateRange = {
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      endDate: new Date(), // now
    };
    console.log("Fetching transactions for the last week...");
    const lastWeekTransactions = await getTransactions(lastWeekDateRange);
    console.log(
      `Found ${lastWeekTransactions.length} transactions in the last week`,
    );

    // Example 3: Get transactions with metadata
    console.log("Fetching transactions with metadata...");
    const { transactions, metadata } =
      await getTransactionsWithMetadata(lastWeekDateRange);
    console.log(
      `Found ${transactions.length} transactions with query metadata:`,
      metadata,
    );

    // Example 4: Get transactions for a specific member
    const memberId = "example-member-id";
    console.log(`Fetching transactions for member ${memberId}...`);
    const memberTransactions = await getMemberTransactions(
      memberId,
      lastWeekDateRange,
    );
    console.log(
      `Found ${memberTransactions.length} transactions for member ${memberId}`,
    );

    // Example 5: Get transactions for a specific enterprise
    const enterpriseId = "example-enterprise-id";
    console.log(`Fetching transactions for enterprise ${enterpriseId}...`);
    const enterpriseTransactions = await getEnterpriseTransactions(
      enterpriseId,
      lastWeekDateRange,
    );
    console.log(
      `Found ${enterpriseTransactions.length} transactions for enterprise ${enterpriseId}`,
    );

    // Example 6: Using the dashboard service object
    console.log("Using the dashboard service object...");
    const lastMonthDateRange: TransactionDateRange = {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(), // now
    };
    const lastMonthTransactions =
      await dashboardService.getTransactions(lastMonthDateRange);
    console.log(
      `Found ${lastMonthTransactions.length} transactions in the last month`,
    );

    // Example 7: Get members created in the last week
    console.log("Fetching members created in the last week...");
    const recentMembers = await getMembers(lastWeekDateRange);
    console.log(
      `Found ${recentMembers.length} members created in the last week`,
    );

    // Example 8: Get members with metadata
    console.log("Fetching members with metadata...");
    const { members, metadata: memberMetadata } =
      await getMembersWithMetadata(lastWeekDateRange);
    console.log(
      `Found ${members.length} members with query metadata:`,
      memberMetadata,
    );

    // Example 9: Get members for a specific enterprise
    console.log(`Fetching members for enterprise ${enterpriseId}...`);
    const enterpriseMembers = await getEnterpriseMembers(
      enterpriseId,
      lastWeekDateRange,
    );
    console.log(
      `Found ${enterpriseMembers.length} members for enterprise ${enterpriseId}`,
    );

    // Example 10: Using the dashboard service object for members
    console.log("Using the dashboard service object for members...");
    const lastMonthMembers =
      await dashboardService.getMembers(lastMonthDateRange);
    console.log(
      `Found ${lastMonthMembers.length} members created in the last month`,
    );
  } catch (error) {
    console.error("Error in example usage:", error);
  }
}

// This function would be called from another module
export default exampleUsage;
