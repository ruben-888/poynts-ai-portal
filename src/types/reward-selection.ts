/**
 * Reward Selection Types
 *
 * Normalized types for reward selection across different providers
 * (Tremendous, Tango, Blackhawk, etc.)
 */

export interface NormalizedReward {
  /** Provider source ID (e.g., "source-tremendous") */
  sourceId: string;

  /** Provider's unique identifier for this reward */
  sourceIdentifier: string;

  /** Brand name (e.g., "Amazon", "Starbucks") */
  brandName: string;

  /** Product name */
  productName: string;

  /** Product description */
  description: string;

  /** Product image URL */
  imageUrl: string;

  /** Currency code (e.g., "USD") */
  currency: string;

  /** Reward status */
  status: "active" | "inactive";

  /** Minimum value for this reward (normalized across providers) */
  minValue: number;

  /** Maximum value for this reward (normalized across providers) */
  maxValue: number;

  /** Fixed face value (for providers with single-value rewards like Tremendous/Tango) */
  faceValue?: number;

  /** Available countries for this reward */
  countries: string[];

  /** Raw provider data (for debugging/reference) */
  rawData?: unknown;
}

export interface RecipientFormData {
  /** Recipient's full name */
  name: string;

  /** Recipient's email address */
  email: string;

  /** Reward amount as string (for form input, will be parsed to number) */
  amount: string;

  /** Email subject line */
  subject: string;

  /** Custom message to recipient */
  message: string;
}
