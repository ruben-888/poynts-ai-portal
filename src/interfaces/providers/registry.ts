import { GiftCardProvider, ProviderConfig } from "./types";

// Import implemented providers
import { createBlackhawkProvider } from "./blackhawk";
import { createTangoProvider } from "./tango";

export type ProviderType = "blackhawk" | "tango";

const providerRegistry: Record<
  ProviderType,
  (config: ProviderConfig) => GiftCardProvider
> = {
  blackhawk: createBlackhawkProvider,
  tango: createTangoProvider,
};

export const getProvider = (
  type: ProviderType,
  config: ProviderConfig,
): GiftCardProvider => {
  const createProvider = providerRegistry[type];
  if (!createProvider) {
    throw new Error(`Provider ${type} not found`);
  }
  return createProvider(config);
};

// Helper to validate provider type
export const isValidProviderType = (type: string): type is ProviderType => {
  return type in providerRegistry;
};
