import { bigQueryClient } from "@/interfaces/bigquery";
import { DashboardData } from "./index";

/**
 * Interface for BigQuery dashboard metrics
 */
export interface BigQueryDashboardMetrics {
  transactionCount: number;
  transactionAmount: number;
  rebateAmount: number;
  newMembersCount: number;
}

/**
 * Fetches dashboard metrics from BigQuery
 * @param startDate - Start date for the data range
 * @param endDate - End date for the data range
 * @returns Dashboard metrics from BigQuery
 */
export async function getBigQueryDashboardMetrics(
  startDate: Date,
  endDate: Date,
): Promise<BigQueryDashboardMetrics> {
  // Format dates for BigQuery (YYYY-MM-DD)
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  // Query for transaction metrics
  const transactionMetricsQuery = `
    SELECT
      COUNT(*) as transaction_count,
      SUM(order_amount) as transaction_amount,
      SUM(rebate_amount) as rebate_amount
    FROM
      \`carepoynt-analytics.transactions.transaction_logs\`
    WHERE
      transaction_date BETWEEN @startDate AND @endDate
      AND transaction_status = 'success'
      AND mode = 'live'
  `;

  // Query for new members
  const newMembersQuery = `
    SELECT
      COUNT(*) as new_members_count
    FROM
      \`carepoynt-analytics.members.member_data\`
    WHERE
      create_date BETWEEN @startDate AND @endDate
      AND mode = 'live'
  `;

  try {
    // Execute transaction metrics query
    const transactionMetrics = await bigQueryClient.executeQuery({
      query: transactionMetricsQuery,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    // Execute new members query
    const newMembersMetrics = await bigQueryClient.executeQuery({
      query: newMembersQuery,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    // Extract metrics from query results
    const transactionCount = transactionMetrics[0]?.transaction_count || 0;
    const transactionAmount = transactionMetrics[0]?.transaction_amount || 0;
    const rebateAmount = transactionMetrics[0]?.rebate_amount || 0;
    const newMembersCount = newMembersMetrics[0]?.new_members_count || 0;

    return {
      transactionCount,
      transactionAmount,
      rebateAmount,
      newMembersCount,
    };
  } catch (error) {
    console.error("Error fetching BigQuery dashboard metrics:", error);
    throw error;
  }
}

/**
 * Fetches dashboard data from BigQuery
 * @param startDate - Start date for the data range
 * @param endDate - End date for the data range
 * @returns Dashboard data including transaction counts, amounts, and member data
 */
export async function getBigQueryDashboardData(
  startDate: Date,
  endDate: Date,
): Promise<DashboardData> {
  try {
    // Calculate previous period date range
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousPeriodEndDate = new Date(startDate.getTime() - 1); // Day before current period starts
    const previousPeriodStartDate = new Date(
      previousPeriodEndDate.getTime() - periodDuration,
    ); // Same duration as current period

    // Get current period metrics
    const currentMetrics = await getBigQueryDashboardMetrics(
      startDate,
      endDate,
    );

    // Get previous period metrics
    const previousMetrics = await getBigQueryDashboardMetrics(
      previousPeriodStartDate,
      previousPeriodEndDate,
    );

    // Calculate percentage changes
    const calculatePercentChange = (
      current: number,
      previous: number,
    ): number => {
      return previous > 0 ? ((current - previous) / previous) * 100 : 0;
    };

    const transactionsCountChange = calculatePercentChange(
      currentMetrics.transactionCount,
      previousMetrics.transactionCount,
    );

    const transactionsAmountChange = calculatePercentChange(
      currentMetrics.transactionAmount,
      previousMetrics.transactionAmount,
    );

    const avgTransactionAmount =
      currentMetrics.transactionCount > 0
        ? currentMetrics.transactionAmount / currentMetrics.transactionCount
        : 0;

    const previousAvgTransactionAmount =
      previousMetrics.transactionCount > 0
        ? previousMetrics.transactionAmount / previousMetrics.transactionCount
        : 0;

    const avgTransactionAmountChange = calculatePercentChange(
      avgTransactionAmount,
      previousAvgTransactionAmount,
    );

    const rebateAmountChange = calculatePercentChange(
      currentMetrics.rebateAmount,
      previousMetrics.rebateAmount,
    );

    const newMembersCountChange = calculatePercentChange(
      currentMetrics.newMembersCount,
      previousMetrics.newMembersCount,
    );

    // Return the dashboard data
    return {
      success: true,
      data: {
        transactions: {
          count: currentMetrics.transactionCount,
          countChange: parseFloat(transactionsCountChange.toFixed(1)),
          avgAmount: parseFloat(avgTransactionAmount.toFixed(2)),
          avgAmountChange: parseFloat(avgTransactionAmountChange.toFixed(1)),
          totalAmount: parseFloat(currentMetrics.transactionAmount.toFixed(2)),
          totalAmountChange: parseFloat(transactionsAmountChange.toFixed(1)),
        },
        rebate: {
          amount: parseFloat(currentMetrics.rebateAmount.toFixed(2)),
          amountChange: parseFloat(rebateAmountChange.toFixed(1)),
        },
        members: {
          newCount: currentMetrics.newMembersCount,
          newCountChange: parseFloat(newMembersCountChange.toFixed(1)),
        },
        timestamp: new Date().toISOString(),
        dateRange: {
          current: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
          previous: {
            start: previousPeriodStartDate.toISOString(),
            end: previousPeriodEndDate.toISOString(),
          },
        },
      },
    };
  } catch (error) {
    console.error("Error fetching BigQuery dashboard data:", error);
    throw error;
  }
}
