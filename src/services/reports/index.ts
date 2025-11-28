import { db } from "@/utils/db";

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
 * Calculates percentage change between current and previous values
 * @param current - Current period value
 * @param previous - Previous period value
 * @returns Percentage change as a number
 */
const calculatePercentChange = (current: number, previous: number): number => {
  return previous > 0 ? ((current - previous) / previous) * 100 : 0;
};

/**
 * Fetches dashboard data including transaction metrics
 * @param startDate - Start date for the data range
 * @param endDate - End date for the data range
 * @returns Dashboard metrics including transaction counts, amounts, and member data
 */
export async function getDashboardData(
  startDate: Date,
  endDate: Date,
): Promise<DashboardData> {
  try {
    // Common where clause for transaction queries
    const transactionWhereClause = {
      date: {
        gte: startDate,
        lte: endDate,
      },
      result: "success",
      reward_type: {
        not: null,
      },
      mode: "live",
    };

    // Get total number of transactions
    const transactionsCount = await db.cp_transactionlog.count({
      where: transactionWhereClause,
    });

    // Get total transactions amount (sum of order_amount)
    const transactionsAmountResult = await db.cp_transactionlog.aggregate({
      where: transactionWhereClause,
      _sum: {
        order_amount: true,
      },
    });
    const transactionsAmount = transactionsAmountResult._sum.order_amount || 0;

    // Calculate average transaction amount
    const avgTransactionAmount =
      transactionsCount > 0
        ? Number(transactionsAmount) / transactionsCount
        : 0;

    // Get total rebate amount (sum of rebate_customer_amount)
    const rebateAmountResult = await db.cp_transactionlog.aggregate({
      where: transactionWhereClause,
      _sum: {
        rebate_customer_amount: true,
      },
    });
    const rebateAmount = rebateAmountResult._sum.rebate_customer_amount || 0;

    // Get count of new members registered in the date range
    const newMembersCount = await db.member.count({
      where: {
        create_date: {
          gte: startDate,
          lte: endDate,
        },
        mode: "live",
      },
    });

    // Calculate previous period date range
    const periodDuration = endDate.getTime() - startDate.getTime();
    const previousPeriodEndDate = new Date(startDate.getTime() - 1); // Day before current period starts
    const previousPeriodStartDate = new Date(
      previousPeriodEndDate.getTime() - periodDuration,
    ); // Same duration as current period

    // Common where clause for previous period transaction queries
    const previousTransactionWhereClause = {
      date: {
        gte: previousPeriodStartDate,
        lte: previousPeriodEndDate,
      },
      result: "success",
      reward_type: {
        not: null,
      },
      mode: "live",
    };

    // Get previous period transactions count
    const previousTransactionsCount = await db.cp_transactionlog.count({
      where: previousTransactionWhereClause,
    });

    // Get previous period transactions amount
    const previousTransactionsAmountResult =
      await db.cp_transactionlog.aggregate({
        where: previousTransactionWhereClause,
        _sum: {
          order_amount: true,
        },
      });
    const previousTransactionsAmount =
      previousTransactionsAmountResult._sum.order_amount || 0;

    // Calculate previous period average transaction amount
    const previousAvgTransactionAmount =
      previousTransactionsCount > 0
        ? Number(previousTransactionsAmount) / previousTransactionsCount
        : 0;

    // Get previous period rebate amount
    const previousRebateAmountResult = await db.cp_transactionlog.aggregate({
      where: previousTransactionWhereClause,
      _sum: {
        rebate_customer_amount: true,
      },
    });
    const previousRebateAmount =
      previousRebateAmountResult._sum.rebate_customer_amount || 0;

    // Get previous period new members count
    const previousNewMembersCount = await db.member.count({
      where: {
        create_date: {
          gte: previousPeriodStartDate,
          lte: previousPeriodEndDate,
        },
        mode: "live",
      },
    });

    // Calculate percentage changes
    const transactionsCountChange = calculatePercentChange(
      transactionsCount,
      previousTransactionsCount,
    );
    const transactionsAmountChange = calculatePercentChange(
      Number(transactionsAmount),
      Number(previousTransactionsAmount),
    );
    const avgTransactionAmountChange = calculatePercentChange(
      avgTransactionAmount,
      previousAvgTransactionAmount,
    );
    const rebateAmountChange = calculatePercentChange(
      Number(rebateAmount),
      Number(previousRebateAmount),
    );
    const newMembersCountChange = calculatePercentChange(
      newMembersCount,
      previousNewMembersCount,
    );

    // Return the dashboard data
    return {
      success: true,
      data: {
        transactions: {
          count: transactionsCount,
          countChange: parseFloat(transactionsCountChange.toFixed(1)),
          avgAmount: parseFloat(avgTransactionAmount.toFixed(2)),
          avgAmountChange: parseFloat(avgTransactionAmountChange.toFixed(1)),
          totalAmount: parseFloat(Number(transactionsAmount).toFixed(2)),
          totalAmountChange: parseFloat(transactionsAmountChange.toFixed(1)),
        },
        rebate: {
          amount: parseFloat(Number(rebateAmount).toFixed(2)),
          amountChange: parseFloat(rebateAmountChange.toFixed(1)),
        },
        members: {
          newCount: newMembersCount,
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
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}
