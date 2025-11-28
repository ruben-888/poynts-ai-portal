import { BigQuery } from "@google-cloud/bigquery";

/**
 * Configuration interface for BigQuery connection
 */
export interface BigQueryConfig {
  projectId: string;
  keyFilename?: string;
  credentials?: {
    client_email: string;
    private_key: string;
  };
  location?: string;
}

/**
 * Query options interface for BigQuery queries
 */
export interface QueryOptions {
  query: string;
  params?: Record<string, any>;
  location?: string;
  maximumBytesBilled?: string;
  useLegacySql?: boolean;
  jobTimeoutMs?: number;
}

/**
 * BigQuery client interface for executing queries
 */
export interface BigQueryClient {
  executeQuery<T = any>(options: QueryOptions): Promise<T[]>;
  executeQueryWithMetadata<T = any>(
    options: QueryOptions,
  ): Promise<{
    rows: T[];
    metadata: any;
  }>;
}

/**
 * Default BigQuery configuration
 */
const DEFAULT_CONFIG: BigQueryConfig = {
  projectId: process.env.BIGQUERY_PROJECT_ID ?? "",
  location: process.env.BIGQUERY_LOCATION ?? "",
};

/**
 * BigQuery client implementation
 */
export class BigQueryClientImpl implements BigQueryClient {
  private client: BigQuery;

  /**
   * Creates a new BigQuery client
   * @param config - BigQuery configuration
   */
  constructor(config: BigQueryConfig = DEFAULT_CONFIG) {
    this.client = new BigQuery({
      projectId: config.projectId,
      keyFilename: config.keyFilename,
      credentials: config.credentials,
      location: config.location,
    });
  }

  /**
   * Executes a BigQuery query and returns the rows
   * @param options - Query options
   * @returns Promise with query results
   */
  async executeQuery<T = any>(options: QueryOptions): Promise<T[]> {
    try {
      const queryOptions = {
        query: options.query,
        params: options.params,
        location: options.location || DEFAULT_CONFIG.location,
        maximumBytesBilled: options.maximumBytesBilled,
        useLegacySql:
          options.useLegacySql === undefined ? false : options.useLegacySql,
        jobTimeoutMs: options.jobTimeoutMs,
      };

      const result = await this.client.query(queryOptions);
      const rows = result[0] as T[];
      return rows;
    } catch (error) {
      console.error("Error executing BigQuery query:", error);
      throw error;
    }
  }

  /**
   * Executes a BigQuery query and returns both rows and metadata
   * @param options - Query options
   * @returns Promise with query results and metadata
   */
  async executeQueryWithMetadata<T = any>(
    options: QueryOptions,
  ): Promise<{
    rows: T[];
    metadata: any;
  }> {
    try {
      const queryOptions = {
        query: options.query,
        params: options.params,
        location: options.location || DEFAULT_CONFIG.location,
        maximumBytesBilled: options.maximumBytesBilled,
        useLegacySql:
          options.useLegacySql === undefined ? false : options.useLegacySql,
        jobTimeoutMs: options.jobTimeoutMs,
      };

      const result = await this.client.query(queryOptions);
      const rows = result[0] as T[];
      const metadata = result[1];
      return { rows, metadata };
    } catch (error) {
      console.error("Error executing BigQuery query with metadata:", error);
      throw error;
    }
  }
}

/**
 * Creates a new BigQuery client with the provided configuration
 * @param config - BigQuery configuration
 * @returns BigQuery client instance
 */
export function createBigQueryClient(config?: BigQueryConfig): BigQueryClient {
  return new BigQueryClientImpl(config);
}

// Default BigQuery client instance
export const bigQueryClient = createBigQueryClient();
