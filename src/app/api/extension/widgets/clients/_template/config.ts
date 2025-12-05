/**
 * [CLIENT NAME] Configuration
 *
 * This file contains client-specific settings that connect this demo
 * to the Poynts platform (organization, campaigns, etc.)
 */

export const config = {
  /**
   * Display name for this client
   */
  name: "Example Client",

  /**
   * Domains this client matches
   * Include both www and non-www versions if applicable
   */
  domains: ["example.com", "www.example.com"],

  /**
   * Organization ID from the Poynts database
   * This links the demo to a specific organization's campaigns and data
   * Find this in: Admin > Organizations or via the API
   */
  organizationId: "org_xxxxxxxxxxxxxxxx",

  /**
   * Optional: Specific program ID if this client uses a particular program
   * Leave undefined to use the organization's default program
   */
  programId: undefined as string | undefined,

  /**
   * Optional: Campaign IDs to feature in this demo
   * If undefined, will load all active campaigns for the organization
   */
  featuredCampaignIds: undefined as string[] | undefined,

  /**
   * Theme customization for widgets
   */
  theme: {
    primaryColor: "#6366f1",
    accentColor: "#8b5cf6",
    // Add more theme options as needed
  },
};
