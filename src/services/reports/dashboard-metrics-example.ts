import { getBigQueryDashboardData } from "./dashboard-metrics";

/**
 * Example usage of the BigQuery dashboard metrics
 */
async function exampleDashboardUsage() {
  try {
    // Example 1: Get dashboard data for the current month
    console.log("Fetching dashboard data for the current month...");
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const dashboardData = await getBigQueryDashboardData(startOfMonth, now);

    console.log("Dashboard data for current month:");
    console.log(
      `Transactions count: ${dashboardData.data.transactions.count} (${dashboardData.data.transactions.countChange}% change)`,
    );
    console.log(
      `Average transaction amount: $${dashboardData.data.transactions.avgAmount} (${dashboardData.data.transactions.avgAmountChange}% change)`,
    );
    console.log(
      `Total transaction amount: $${dashboardData.data.transactions.totalAmount} (${dashboardData.data.transactions.totalAmountChange}% change)`,
    );
    console.log(
      `Rebate amount: $${dashboardData.data.rebate.amount} (${dashboardData.data.rebate.amountChange}% change)`,
    );
    console.log(
      `New members: ${dashboardData.data.members.newCount} (${dashboardData.data.members.newCountChange}% change)`,
    );

    // Example 2: Get dashboard data for a custom date range
    console.log("\nFetching dashboard data for the last 7 days...");
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

    const weeklyDashboardData = await getBigQueryDashboardData(
      startDate,
      endDate,
    );

    console.log("Dashboard data for last 7 days:");
    console.log(
      `Transactions count: ${weeklyDashboardData.data.transactions.count} (${weeklyDashboardData.data.transactions.countChange}% change)`,
    );
    console.log(
      `Average transaction amount: $${weeklyDashboardData.data.transactions.avgAmount} (${weeklyDashboardData.data.transactions.avgAmountChange}% change)`,
    );
    console.log(
      `Total transaction amount: $${weeklyDashboardData.data.transactions.totalAmount} (${weeklyDashboardData.data.transactions.totalAmountChange}% change)`,
    );
    console.log(
      `Rebate amount: $${weeklyDashboardData.data.rebate.amount} (${weeklyDashboardData.data.rebate.amountChange}% change)`,
    );
    console.log(
      `New members: ${weeklyDashboardData.data.members.newCount} (${weeklyDashboardData.data.members.newCountChange}% change)`,
    );

    // Example 3: Get dashboard data for a specific quarter
    console.log("\nFetching dashboard data for Q1 2025...");
    const q1StartDate = new Date(2025, 0, 1); // Jan 1, 2025
    const q1EndDate = new Date(2025, 2, 31, 23, 59, 59); // Mar 31, 2025 23:59:59

    const quarterlyDashboardData = await getBigQueryDashboardData(
      q1StartDate,
      q1EndDate,
    );

    console.log("Dashboard data for Q1 2025:");
    console.log(
      `Transactions count: ${quarterlyDashboardData.data.transactions.count} (${quarterlyDashboardData.data.transactions.countChange}% change)`,
    );
    console.log(
      `Average transaction amount: $${quarterlyDashboardData.data.transactions.avgAmount} (${quarterlyDashboardData.data.transactions.avgAmountChange}% change)`,
    );
    console.log(
      `Total transaction amount: $${quarterlyDashboardData.data.transactions.totalAmount} (${quarterlyDashboardData.data.transactions.totalAmountChange}% change)`,
    );
    console.log(
      `Rebate amount: $${quarterlyDashboardData.data.rebate.amount} (${quarterlyDashboardData.data.rebate.amountChange}% change)`,
    );
    console.log(
      `New members: ${quarterlyDashboardData.data.members.newCount} (${quarterlyDashboardData.data.members.newCountChange}% change)`,
    );
  } catch (error) {
    console.error("Error in dashboard example usage:", error);
  }
}

// This function would be called from another module
export default exampleDashboardUsage;
