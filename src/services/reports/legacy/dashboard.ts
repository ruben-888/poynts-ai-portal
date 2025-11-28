import { bigQueryClient } from "@/interfaces/bigquery";

/**
 * Transaction data interface representing the fields returned from BigQuery
 */
export interface TransactionData {
  id: string;
  cpid: string;
  cpidx: string;
  result: string;
  mode: string;
  entity_type: string;
  transaction_date: string;
  enterprise_id: string;
  member_id: string;
  metadata: string;
  poynts: number;
  provider_id: number;
  order_amount: number;
  order_provider_amount: number;
  provider_balance: number;
  provider_balance_customer: number;
  provider_reference_id: string;
  reward_name: string;
  provider_reward_id: string;
  rebate_provider_percentage: number;
  rebate_provider_amount: number;
  rebate_base_percentage: number;
  rebate_base_amount: number;
  rebate_customer_percentage: number;
  rebate_customer_amount: number;
  rebate_cp_percentage: number;
  rebate_cp_amount: number;
  cp_transaction_reference: string;
  cust_transaction_reference: string;
  message: string;
  customer_request: string;
  customer_response: string;
  provider_name: string;
  provider_code: string;
  redem_value: number;
  redem_poynts_value: number;
  reward_language: string;
  brand_name: string;
  enterprise_name: string;
  source_name: string;
  member_name: string;
  member_email: string;
}

/**
 * Member data interface representing the fields returned from BigQuery
 */
export interface MemberData {
  create_date: string;
  memberid: string;
  name: string;
  email: string;
  roleid: string;
  ent_name: string;
  roleName: string;
  isLive: boolean;
  mode: string;
}

/**
 * Date range options for transaction queries
 */
export interface TransactionDateRange {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Transaction query result with metadata
 */
export interface TransactionQueryResult {
  transactions: TransactionData[];
  metadata: any;
}

/**
 * Simple transaction count result
 */
export interface TransactionCountResult {
  count: number;
}

/**
 * Transaction metrics result interface
 */
export interface TransactionMetricsResult {
  count: number;
  successful_count: number;
  total_amount: number;
  rebate_amount: number;
}

/**
 * Member metrics result interface
 */
export interface MemberMetricsResult {
  total_count: number;
  new_live_count: number;
}

/**
 * Prepares date range parameters for the query
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Formatted start and end dates for BigQuery
 */
const prepareDateRange = (
  dateRange?: TransactionDateRange,
): {
  formattedStartDate: string;
  formattedEndDate: string;
} => {
  // Default to last 24 hours if no date range provided
  const endDate = dateRange?.endDate || new Date();
  const startDate =
    dateRange?.startDate || new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

  // Format dates for BigQuery in a simpler format (YYYY-MM-DD)
  const formattedStartDate = startDate.toISOString().split("T")[0];
  const formattedEndDate = endDate.toISOString().split("T")[0];

  return { formattedStartDate, formattedEndDate };
};

/**
 * Builds a simplified transaction count query SQL
 * @returns SQL query string for transaction count
 */
const buildTransactionCountQuery = (): string => {
  return `
    SELECT
      COUNT(*) as count
    FROM \`cp-platform-prod.legacy_com_carepoynt_well_prod.cp_transactionlog\` tr
    WHERE tr.date >= @startDate
      AND tr.date <= @endDate
  `;
};

/**
 * Builds the transaction query SQL
 * @returns SQL query string for transactions
 */
const buildTransactionQuery = (): string => {
  return `
    SELECT
      tr.id, 
      tr.cpid,
      REGEXP_REPLACE(tr.cpid, '-[A-Z0-9]+$', '') as cpidx,
      tr.result, 
      tr.mode, 
      tr.entity_type, 
      tr.date AS transaction_date, 
      tr.entid AS enterprise_id,
      tr.memberid AS member_id, 
      tr.metadata, 
      tr.poynts, 
      tr.provider_id, 
      tr.order_amount,
      tr.order_provider_amount, 
      tr.provider_balance, 
      tr.provider_balance_customer, 
      tr.provider_reference_id,
      tr.reward_name, 
      tr.provider_reward_id, 
      tr.rebate_provider_percentage, 
      tr.rebate_provider_amount,
      tr.rebate_base_percentage, 
      tr.rebate_base_amount, 
      tr.rebate_customer_percentage, 
      tr.rebate_customer_amount,
      tr.rebate_cp_percentage, 
      tr.rebate_cp_amount, 
      tr.cp_transaction_reference, 
      tr.cust_transaction_reference, 
      tr.message,
      tr.customer_request, 
      tr.customer_response,
      pr.name AS provider_name, 
      pr.code AS provider_code,
      rd.value AS redem_value, 
      rd.redem_value AS redem_poynts_value, 
      rd.language AS reward_language,
      rdb.brandName AS brand_name,
      en.ent_name AS enterprise_name,
      COALESCE(NULLIF(pr.code, 'O'), '?') AS source_name,
      m.name AS member_name,
      m.email AS member_email
    FROM \`cp-platform-prod.legacy_com_carepoynt_well_prod.cp_transactionlog\` tr
    LEFT OUTER JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.providers\` pr
        ON tr.provider_id = pr.id
    LEFT OUTER JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.enterprise\` en
        ON tr.entid = en.ent_id
    LEFT OUTER JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.redemption_giftcards\` rd
        ON tr.cpid = rd.cpid
    LEFT OUTER JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.redemption_giftcard_items\` rdi
        ON rd.item_id = rdi.item_id
    LEFT OUTER JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.redemption_giftcard_brands\` rdb
        ON rdi.brand_id = rdb.brand_id
    LEFT OUTER JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.member\` m
        ON tr.memberid = m.memberid
    WHERE tr.date >= @startDate
      AND tr.date <= @endDate
    ORDER BY tr.id DESC
  `;
};

/**
 * Builds the member query SQL
 * @returns SQL query string for members
 */
const buildMemberQuery = (): string => {
  return `
    SELECT 
      m.create_date, 
      m.memberid, 
      m.name, 
      m.email, 
      mr.roleid, 
      e.ent_name, 
      r.roleName, 
      m.isLive,
      m.mode 
    FROM
      \`cp-platform-prod.legacy_com_carepoynt_well_prod.member\` m 
    LEFT JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.member_role\` mr 
      ON m.memberid = mr.memberid 
    LEFT JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.enterprise\` e 
      ON e.ent_id = mr.entid
    LEFT JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.roles\` r 
      ON r.roleid = mr.roleid
    WHERE m.create_date >= @startDate
      AND m.create_date <= @endDate
    ORDER BY m.memberid ASC
  `;
};

/**
 * Builds a member count query SQL
 * @returns SQL query string for member count
 */
const buildMemberCountQuery = (): string => {
  return `
    SELECT COUNT(DISTINCT m.memberid) as count
    FROM \`cp-platform-prod.legacy_com_carepoynt_well_prod.member\` m 
    LEFT JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.member_role\` mr 
      ON m.memberid = mr.memberid 
    LEFT JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.enterprise\` e 
      ON e.ent_id = mr.entid
    LEFT JOIN \`cp-platform-prod.legacy_com_carepoynt_well_prod.roles\` r 
      ON r.roleid = mr.roleid
    WHERE m.create_date >= @startDate
      AND m.create_date <= @endDate
  `;
};

/**
 * Builds an optimized transaction metrics query SQL
 * @returns SQL query string for transaction metrics
 */
const buildTransactionMetricsQuery = (): string => {
  return `
    SELECT
      COUNT(*) as count,
      SUM(CASE WHEN tr.result = 'success' AND tr.mode = 'live' AND tr.reward_name IS NOT NULL 
          THEN 1 ELSE 0 END) as successful_count,
      SUM(CASE WHEN tr.result = 'success' AND tr.mode = 'live' AND tr.reward_name IS NOT NULL 
          THEN COALESCE(tr.order_amount, 0) ELSE 0 END) as total_amount,
      SUM(CASE WHEN tr.result = 'success' AND tr.mode = 'live' AND tr.reward_name IS NOT NULL 
          THEN COALESCE(tr.rebate_customer_amount, 0) ELSE 0 END) as rebate_amount
    FROM \`cp-platform-prod.legacy_com_carepoynt_well_prod.cp_transactionlog\` tr
    WHERE tr.date >= @startDate
      AND tr.date <= @endDate
  `;
};

/**
 * Builds an optimized member metrics query SQL
 * @returns SQL query string for member metrics
 */
const buildMemberMetricsQuery = (): string => {
  return `
    SELECT
      COUNT(DISTINCT m.memberid) as total_count,
      COUNT(DISTINCT CASE WHEN (m.isLive = 'true' OR m.isLive = '1') AND m.mode = 'live' THEN m.memberid ELSE NULL END) as new_live_count
    FROM \`cp-platform-prod.legacy_com_carepoynt_well_prod.member\` m
    WHERE m.create_date >= @startDate
      AND m.create_date <= @endDate
  `;
};

/**
 * Fetches just the count of transactions for a specified date range
 * This is a simplified version that should be more efficient
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with transaction count
 */
export const getTransactionCount = async (
  dateRange?: TransactionDateRange,
): Promise<number> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildTransactionCountQuery();

    const result = await bigQueryClient.executeQuery<TransactionCountResult>({
      query,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    return result[0]?.count || 0;
  } catch (error) {
    console.error("Error fetching transaction count:", error);
    throw error;
  }
};

/**
 * Fetches transaction data for a specified date range
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with transaction data
 */
export const getTransactions = async (
  dateRange?: TransactionDateRange,
): Promise<TransactionData[]> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildTransactionQuery();

    const transactions = await bigQueryClient.executeQuery<TransactionData>({
      query,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    return transactions;
  } catch (error) {
    console.error("Error fetching transaction data:", error);
    throw error;
  }
};

/**
 * Fetches transaction data with metadata for a specified date range
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with transaction data and query metadata
 */
export const getTransactionsWithMetadata = async (
  dateRange?: TransactionDateRange,
): Promise<TransactionQueryResult> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildTransactionQuery();

    const result =
      await bigQueryClient.executeQueryWithMetadata<TransactionData>({
        query,
        params: {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      });

    return {
      transactions: result.rows,
      metadata: result.metadata,
    };
  } catch (error) {
    console.error("Error fetching transaction data with metadata:", error);
    throw error;
  }
};

/**
 * Fetches transactions for a specific member
 * @param memberId - Member ID to filter by
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with transaction data
 */
export const getMemberTransactions = async (
  memberId: string,
  dateRange?: TransactionDateRange,
): Promise<TransactionData[]> => {
  try {
    const transactions = await getTransactions(dateRange);
    return transactions.filter(
      (transaction) => transaction.member_id === memberId,
    );
  } catch (error) {
    console.error(`Error fetching transactions for member ${memberId}:`, error);
    throw error;
  }
};

/**
 * Fetches transactions for a specific enterprise
 * @param enterpriseId - Enterprise ID to filter by
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with transaction data
 */
export const getEnterpriseTransactions = async (
  enterpriseId: string,
  dateRange?: TransactionDateRange,
): Promise<TransactionData[]> => {
  try {
    const transactions = await getTransactions(dateRange);
    return transactions.filter(
      (transaction) => transaction.enterprise_id === enterpriseId,
    );
  } catch (error) {
    console.error(
      `Error fetching transactions for enterprise ${enterpriseId}:`,
      error,
    );
    throw error;
  }
};

/**
 * Fetches member data for a specified date range
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with member data
 */
export const getMembers = async (
  dateRange?: TransactionDateRange,
): Promise<MemberData[]> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildMemberQuery();

    const members = await bigQueryClient.executeQuery<MemberData>({
      query,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    return members;
  } catch (error) {
    console.error("Error fetching member data:", error);
    throw error;
  }
};

/**
 * Fetches member data with metadata for a specified date range
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with member data and query metadata
 */
export const getMembersWithMetadata = async (
  dateRange?: TransactionDateRange,
): Promise<{
  members: MemberData[];
  metadata: any;
}> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildMemberQuery();

    const result = await bigQueryClient.executeQueryWithMetadata<MemberData>({
      query,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    return {
      members: result.rows,
      metadata: result.metadata,
    };
  } catch (error) {
    console.error("Error fetching member data with metadata:", error);
    throw error;
  }
};

/**
 * Fetches members for a specific enterprise
 * @param enterpriseId - Enterprise ID to filter by
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with member data
 */
export const getEnterpriseMembers = async (
  enterpriseId: string,
  dateRange?: TransactionDateRange,
): Promise<MemberData[]> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildMemberQuery() + ` AND e.ent_id = @enterpriseId`;

    const members = await bigQueryClient.executeQuery<MemberData>({
      query,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        enterpriseId,
      },
    });

    return members;
  } catch (error) {
    console.error(
      `Error fetching members for enterprise ${enterpriseId}:`,
      error,
    );
    throw error;
  }
};

/**
 * Fetches just the count of members for a specified date range
 * This is a simplified version that should be more efficient
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with member count
 */
export const getMemberCount = async (
  dateRange?: TransactionDateRange,
): Promise<number> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildMemberCountQuery();

    const result = await bigQueryClient.executeQuery<TransactionCountResult>({
      query,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    return result[0]?.count || 0;
  } catch (error) {
    console.error("Error fetching member count:", error);
    throw error;
  }
};

/**
 * Fetches optimized transaction metrics for a specified date range
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with transaction metrics
 */
export const getTransactionMetrics = async (
  dateRange?: TransactionDateRange,
): Promise<TransactionMetricsResult> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildTransactionMetricsQuery();

    const result = await bigQueryClient.executeQuery<TransactionMetricsResult>({
      query,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    return (
      result[0] || {
        count: 0,
        successful_count: 0,
        total_amount: 0,
        rebate_amount: 0,
      }
    );
  } catch (error) {
    console.error("Error fetching transaction metrics:", error);
    throw error;
  }
};

/**
 * Fetches optimized member metrics for a specified date range
 * @param dateRange - Optional date range (defaults to last 24 hours)
 * @returns Promise with member metrics
 */
export const getMemberMetrics = async (
  dateRange?: TransactionDateRange,
): Promise<MemberMetricsResult> => {
  try {
    const { formattedStartDate, formattedEndDate } =
      prepareDateRange(dateRange);
    const query = buildMemberMetricsQuery();

    const result = await bigQueryClient.executeQuery<MemberMetricsResult>({
      query,
      params: {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      },
    });

    return result[0] || { total_count: 0, new_live_count: 0 };
  } catch (error) {
    console.error("Error fetching member metrics:", error);
    throw error;
  }
};

// Export all functions as a dashboard service object
export const dashboardService = {
  getTransactionCount,
  getTransactions,
  getTransactionsWithMetadata,
  getMemberTransactions,
  getEnterpriseTransactions,
  getMembers,
  getMembersWithMetadata,
  getEnterpriseMembers,
  getMemberCount,
  getTransactionMetrics,
  getMemberMetrics,
};
