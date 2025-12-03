/**
 * Simple feature flags hook with hardcoded values
 * Replace useGateValue from Statsig
 */

// All feature flags with their default values
const FEATURE_FLAGS: Record<string, boolean> = {
  // Module flags
  financial_module_enabled: true,
  rewards_module_enabled: true,
  catalogs_module_enabled: true,
  members_module_enabled: true,
  clients_module_enabled: true,
  transactions_module_enabled: true,
  support_module_enabled: true,
  user_management: true,

  // System flags
  system_activity_enabled: true,
  api_credentials_enabled: true,
  manage_access_enabled: true,

  // Provider flags
  tango_enabled: true,
  blackhawk_enabled: true,
  tremendous_enabled: true,

  // Rewards flags
  rewards_related_catalogs: true,
  rewards_offers_inventory: true,
  rewards_new_offer: true,

  // Clients flags
  clients_new_client_enabled: true,
  clients_member_link_enabled: true,
};

/**
 * Hook to get feature flag value
 * Drop-in replacement for useGateValue from Statsig
 */
export function useGateValue(flagName: string): boolean {
  return FEATURE_FLAGS[flagName] ?? false;
}

/**
 * Get all feature flags (useful for debugging)
 */
export function useFeatureFlags(): Record<string, boolean> {
  return { ...FEATURE_FLAGS };
}
