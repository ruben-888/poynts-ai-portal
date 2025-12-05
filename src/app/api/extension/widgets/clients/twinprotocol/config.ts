/**
 * Twin Protocol Configuration
 *
 * Connects this demo to the Poynts platform
 */

export const config = {
  /**
   * Display name for this client
   */
  name: "Twin Protocol",

  /**
   * Domains this client matches
   */
  domains: ["twinprotocol.ai", "www.twinprotocol.ai"],

  /**
   * Organization ID from the Poynts database
   * TODO: Update with actual Twin Protocol organization ID
   */
  organizationId: "org_twinprotocol",

  /**
   * Program ID (optional - uses org default if undefined)
   */
  programId: undefined as string | undefined,

  /**
   * Featured campaign IDs (optional - loads all active if undefined)
   */
  featuredCampaignIds: undefined as string[] | undefined,

  /**
   * Theme customization
   */
  theme: {
    primaryColor: "#6366f1",
    accentColor: "#8b5cf6",
  },
};
