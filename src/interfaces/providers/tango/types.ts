/**
 * Tango Card API Type Definitions
 * These types represent the actual response/request formats from Tango's RaaS API
 * Documentation: https://developers.tangocard.com/reference/setup
 */

import { Money } from "../types";

/**
 * Represents a single reward item in the Tango catalog
 * Maps to Tango's reward item structure in their catalog
 */
export type TangoCatalogItem = {
  utid: string; // Unique Tango ID - used for ordering
  rewardName: string; // Display name of the reward
  currencyCode: string;
  status: string; // 'active' or other status
  minValue: number; // Minimum denomination allowed
  maxValue: number; // Maximum denomination allowed
  faceValue?: number; // Fixed value if applicable
  exchangeRateRule?: string;
  rewardType: string; // Type of reward (e.g., 'gift card')
  countries: string[]; // Supported countries
  brandKey: string; // References parent brand
  imageUrls: {
    // Various image sizes available
    "100w"?: string;
    "200w"?: string;
    "300w"?: string;
    "600w"?: string;
  };
  disclaimer?: string;
  description?: string;
  terms?: string;
  redemptionInstructions?: string;
};

/**
 * Tango's catalog response structure
 * Contains brands which each contain multiple reward items
 */
export type TangoCatalogResponse = {
  brands: Array<{
    brandKey: string;
    brandName: string;
    disclaimer: string;
    description: string;
    shortDescription: string;
    terms: string;
    imageUrls: {
      "100w"?: string;
      "200w"?: string;
      "300w"?: string;
      "600w"?: string;
    };
    items: TangoCatalogItem[];
  }>;
};

/**
 * Request format for ordering rewards through Tango
 * Required fields align with Tango's API specifications
 */
export type TangoOrderRequest = {
  accountIdentifier: string; // Tango account ID
  amount: number; // Purchase amount
  customerIdentifier: string; // Customer ID in Tango's system
  emailSubject?: string; // Custom email subject
  message?: string; // Gift message
  recipient: {
    email: string;
    firstName?: string;
    lastName?: string;
  };
  sendEmail: boolean; // Whether to send email to recipient
  utid: string; // Unique Tango ID from catalog
  externalRefID?: string; // Your system's reference ID
};

/**
 * Response format for Tango order requests
 * Contains reward credentials and status
 */
export type TangoOrderResponse = {
  referenceOrderID: string; // Tango's order reference
  status: "COMPLETE" | "PENDING" | "FAILED";
  responseAt: string; // Timestamp
  reward: {
    credentials: {
      token?: string; // Card number or token
      claimLink?: string; // URL to claim reward
      pin?: string; // PIN if applicable
    };
    redemptionInstructions: string;
  };
};

/**
 * Response format for Tango account queries
 * Used for checking account balance and status
 */
export type TangoAccountResponse = {
  customerIdentifier: string;
  accountIdentifier: string;
  accountNumber: string;
  displayName: string;
  currencyCode: string;
  currentBalance: number;
  status: string; // Account status
};
