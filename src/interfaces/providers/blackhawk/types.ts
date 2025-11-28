import { Money } from "../types";

// Blackhawk-specific request/response types
export type BlackhawkPurchaseRequest = {
  sku: string; // Blackhawk's product identifier
  amount: Money;
  recipient: {
    email?: string;
    name?: string;
  };
  metadata?: Record<string, unknown>;
};

export type BlackhawkPurchaseResponse = {
  transactionId: string;
  status: string;
  card: {
    number: string;
    pin?: string;
    balance: Money;
    expiresAt: string;
  };
  redemptionUrl?: string;
};

export type BlackhawkBalanceResponse = {
  card: {
    number: string;
    balance: Money;
    isActive: boolean;
    expiresAt: string;
  };
};

export type BlackhawkProduct = {
  sku: string;
  brandName: string;
  description: string;
  imageUrl: string;
  denomination?: Money;
  minAmount?: Money;
  maxAmount?: Money;
  availableDenominations?: Money[];
  termsAndConditions?: string;
};

export type BlackhawkCatalogResponse = {
  products: BlackhawkProduct[];
  pagination?: {
    nextCursor?: string;
    hasMore: boolean;
  };
};
