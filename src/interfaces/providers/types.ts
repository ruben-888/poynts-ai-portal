/**
 * Common types shared across all gift card providers (Tango, Blackhawk, Amazon, etc.)
 * These types define the standardized interface that all providers must implement,
 * allowing for consistent interaction regardless of the underlying provider.
 */

/**
 * Represents a monetary value with amount and currency
 * Used consistently across all provider interactions
 */
export type Money = {
  amount: number;
  currency: string;
};

/**
 * Standard request format for purchasing gift cards
 * Each provider will map this to their specific API requirements
 */
export type PurchaseRequest = {
  productId: string; // Provider-specific product identifier
  amount: Money;
  recipientEmail?: string;
  recipientName?: string;
  message?: string; // Optional message to include with the gift card
};

/**
 * Standardized response format for gift card purchases
 * Providers will map their specific responses to this format
 */
export type PurchaseResponse = {
  orderId: string;
  status: "SUCCESS" | "PENDING" | "FAILED";
  cardNumber?: string; // May be null if card is delivered via email
  pin?: string; // Optional PIN for card redemption
  amount: Money;
  expirationDate?: string;
  redemptionInstructions?: string;
};

/**
 * Standard response format for balance checks
 * Used primarily for account/wallet balance queries
 */
export type BalanceResponse = {
  cardNumber: string;
  balance: Money;
  isActive: boolean;
  expirationDate?: string;
};

/**
 * Represents a gift card product in the catalog
 * Used to standardize product information across providers
 */
export type CatalogProduct = {
  productId: string; // Provider-specific identifier
  brandName: string; // e.g., "Amazon", "Target", etc.
  description?: string;
  imageUrl?: string;
  minAmount?: Money; // Minimum purchase amount if variable
  maxAmount?: Money; // Maximum purchase amount if variable
  fixedAmounts?: Money[]; // Available denominations if fixed
  terms?: string; // Terms and conditions
};

/**
 * Standard catalog response format
 * Each provider will map their catalog to this format
 */
export type CatalogResponse = {
  products: CatalogProduct[];
};

/**
 * Core interface that all gift card providers must implement
 * This ensures consistent interaction with different providers
 */
export type GiftCardProvider = {
  purchaseGiftCard: (data: PurchaseRequest) => Promise<PurchaseResponse>;
  checkBalance: (cardNumber: string) => Promise<BalanceResponse>;
  getCatalog: () => Promise<CatalogResponse>;
};

/**
 * Configuration required to initialize a provider
 * Each provider may use these fields differently
 */
export type ProviderConfig = {
  apiKey: string; // Provider-specific API key
  apiUrl?: string; // Base URL for API calls (optional)
  platformName?: string; // Platform name for providers that require it (e.g. Tango)
  sandbox?: boolean; // Whether to use test/sandbox environment
};
