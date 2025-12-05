/**
 * Order domain response types
 */

import {
  OrderStatusEnum,
  DeliveryStatusEnum,
  DeliveryMethodEnum,
  RewardTypeEnum,
  StatusEnum,
  Inventory,
} from "../../_lib/schemas";

/**
 * Reward entity (embedded in order responses)
 */
export interface Reward {
  id: string;
  type?: RewardTypeEnum | null;
  brand_fk?: string | null;
  source_fk?: string | null;
  name?: string | null;
  description?: string | null;
  status?: StatusEnum | null;
  value?: number | null;
  currency?: string | null;
  poynts?: number | null;
  image?: string | null;
  inventory?: Inventory | null;
  external_id?: string | null;
}

/**
 * Order entity
 */
export interface Order {
  id: string;
  external_id: string;
  catalog_fk: string;
  member_fk: string;
  organization_fk: string;
  status: OrderStatusEnum;
  poynts?: number | null;
  value?: number | null;
  currency?: string | null;
  notes?: string | null;
  reward?: Reward | null;
  created_at: string;
  updated_at: string;
}

/**
 * Order with recipients included
 */
export interface OrderWithRecipients extends Order {
  recipients?: Recipient[];
}

/**
 * Recipient entity
 */
export interface Recipient {
  id: string;
  order_fk: string;
  email?: string | null;
  phone?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  delivery_method: DeliveryMethodEnum;
  delivery_status: DeliveryStatusEnum;
  delivered_at?: string | null;
  metadata?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

/**
 * Order list response
 */
export interface OrderListResponse {
  data: Order[];
  limit: number;
  offset: number;
}

/**
 * Order detail response
 */
export interface OrderDetailResponse {
  data: OrderWithRecipients;
  meta?: {
    timestamp: string;
  };
}

/**
 * Order create response
 */
export interface OrderCreateResponse {
  data: Order;
  meta?: {
    timestamp: string;
  };
}
