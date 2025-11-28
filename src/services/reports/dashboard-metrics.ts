import {
  getTransactionsWithMetadata,
  getMembersWithMetadata,
  TransactionDateRange,
  TransactionData,
  MemberData,
  getTransactionCount,
  getMembers,
  getMemberCount,
  getTransactionMetrics,
  getMemberMetrics,
  TransactionMetricsResult,
  MemberMetricsResult,
} from "./legacy/dashboard";

/**
 * Dashboard data interface representing transaction metrics and analytics
 */
export interface DashboardData {
  success: boolean;
  data: {
    transactions: {
      count: number;
      countChange: number;
      avgAmount: number;
      avgAmountChange: number;
      totalAmount: number;
      totalAmountChange: number;
    };
    rebate: {
      amount: number;
      amountChange: number;
    };
    members: {
      newCount: number;
      newCountChange: number;
    };
    timestamp: string;
    dateRange: {
      current: {
        start: string;
        end: string;
      };
      previous: {
        start: string;
        end: string;
      };
    };
  };
}

/**
 * Simplified dashboard data interface with just transaction count
 */
export interface SimpleDashboardData {
  success: boolean;
  data: {
    transactions: {
      count: number;
    };
    members: {
      count: number;
    };
    timestamp: string;
    dateRange: {
      current: {
        start: string;
        end: string;
      };
    };
  };
}

/**
 * Calculates percentage change between current and previous values
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Percentage change as a number
 */
const calculatePercentChange = (current: number, previous: number): number => {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0;
};

/**
 * Simplified function that only fetches transaction count
 * This should be much more efficient than the full dashboard data
 * @param startDate - Start date for the current period
 * @param endDate - End date for the current period
 * @returns Simplified dashboard data with just transaction count
 */
export async function getSimpleDashboardData(
  startDate: Date,
  endDate: Date,
): Promise<SimpleDashboardData> {
  try {
    // Set up date range for query
    const currentDateRange: TransactionDateRange = {
      startDate,
      endDate,
    };

    // Fetch just the transaction count using the optimized function
    const transactionCount = await getTransactionCount(currentDateRange);

    // Fetch member count for the date range using the optimized function
    const memberCount = await getMemberCount(currentDateRange);

    // Return simplified dashboard data
    return {
      success: true,
      data: {
        transactions: {
          count: transactionCount,
        },
        members: {
          count: memberCount,
        },
        timestamp: new Date().toISOString(),
        dateRange: {
          current: {
            start: startDate.toISOString(),
            end: endDate.toISOString(),
          },
        },
      },
    };
  } catch (error) {
    console.error("Error fetching simplified dashboard data:", error);
    throw error;
  }
}

/**
 * Fetches dashboard data using BigQuery services
 * @param startDate - Start date for the current period
 * @param endDate - End date for the current period
 * @returns Dashboard data with metrics for current and previous periods
 */
export async function getBigQueryDashboardData(
  startDate: Date,
  endDate: Date,
): Promise<DashboardData> {
  try {
    // Calculate previous period date range (same duration as current period)
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousPeriodEndDate = new Date(startDate.getTime() - 1); // Day before current period starts
    const previousPeriodStartDate = new Date(
      previousPeriodEndDate.getTime() - periodDuration,
    );

    // Set up date ranges for queries
    const currentDateRange: TransactionDateRange = {
      startDate,
      endDate,
    };

    const previousDateRange: TransactionDateRange = {
      startDate: previousPeriodStartDate,
      endDate: previousPeriodEndDate,
    };

    // Fetch transaction metrics for current and previous periods using optimized queries
    const currentTransactionMetrics =
      await getTransactionMetrics(currentDateRange);
    const previousTransactionMetrics =
      await getTransactionMetrics(previousDateRange);

    // Fetch member metrics for current and previous periods using optimized queries
    const currentMemberMetrics = await getMemberMetrics(currentDateRange);
    const previousMemberMetrics = await getMemberMetrics(previousDateRange);

    // Calculate average transaction amount
    const currentAvgAmount =
      currentTransactionMetrics.successful_count > 0
        ? currentTransactionMetrics.total_amount /
          currentTransactionMetrics.successful_count
        : 0;

    const previousAvgAmount =
      previousTransactionMetrics.successful_count > 0
        ? previousTransactionMetrics.total_amount /
          previousTransactionMetrics.successful_count
        : 0;

    // Calculate percentage changes
    const transactionsCountChange = calculatePercentChange(
      currentTransactionMetrics.successful_count,
      previousTransactionMetrics.successful_count,
    );

    const transactionsAmountChange = calculatePercentChange(
      currentTransactionMetrics.total_amount,
      previousTransactionMetrics.total_amount,
    );

    const avgTransactionAmountChange = calculatePercentChange(
      currentAvgAmount,
      previousAvgAmount,
    );

    const rebateAmountChange = calculatePercentChange(
      currentTransactionMetrics.rebate_amount,
      previousTransactionMetrics.rebate_amount,
    );

    const newMembersCountChange = calculatePercentChange(
      currentMemberMetrics.new_live_count,
      previousMemberMetrics.new_live_count,
    );

    // Return the dashboard data
    return {
      success: true,
      data: {
        transactions: {
          count: currentTransactionMetrics.successful_count,
          countChange: parseFloat(transactionsCountChange.toFixed(1)),
          avgAmount: parseFloat(currentAvgAmount.toFixed(2)),
          avgAmountChange: parseFloat(avgTransactionAmountChange.toFixed(1)),
          totalAmount: parseFloat(
            currentTransactionMetrics.total_amount.toFixed(2),
          ),
          totalAmountChange: parseFloat(transactionsAmountChange.toFixed(1)),
        },
        rebate: {
          amount: parseFloat(
            currentTransactionMetrics.rebate_amount.toFixed(2),
          ),
          amountChange: parseFloat(rebateAmountChange.toFixed(1)),
        },
        members: {
          newCount: currentMemberMetrics.new_live_count,
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
