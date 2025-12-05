/**
 * Shared Types for Extension Widgets
 */

export interface Widget {
  /** Unique identifier for this widget (prefix with client name) */
  id: string;
  /** Optional CSS selector to wait for before injecting */
  waitForSelector?: string;
  /** The JavaScript code to inject into the page */
  code: string;
}

export interface ClientTheme {
  primaryColor: string;
  accentColor: string;
}

export interface ClientConfigData {
  /** Display name for the client */
  name: string;
  /** Domains this client matches */
  domains: string[];
  /** Organization ID from the Poynts database */
  organizationId: string;
  /** Optional: Specific program ID */
  programId?: string;
  /** Optional: Featured campaign IDs */
  featuredCampaignIds?: string[];
  /** Theme customization */
  theme: ClientTheme;
}

export interface ClientConfig {
  /** Display name for the client */
  name: string;
  /** Domains this client matches (e.g., ["example.com", "www.example.com"]) */
  domains: string[];
  /** Function that returns widgets for a given path */
  getWidgets: (path: string) => Widget[];
  /** Optional: Full config data for API access */
  config?: ClientConfigData;
}
