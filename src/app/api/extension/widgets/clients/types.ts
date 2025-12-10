/**
 * Shared Types for Extension Widgets
 */

/**
 * Widget metadata returned by the API
 * The extension uses this to request the actual script from /script endpoint
 */
export interface WidgetMetadata {
  /** Unique identifier for this widget (prefix with client name) */
  id: string;
  /** Optional CSS selector to wait for before injecting */
  waitForSelector?: string;
}

/**
 * Full widget with code (used internally, not returned by API)
 * @deprecated Use WidgetMetadata instead - code is now served via /script endpoint
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
  /** Function that returns widget metadata for a given path */
  getWidgets: (path: string) => WidgetMetadata[];
  /** Optional: Full config data for API access */
  config?: ClientConfigData;
}
