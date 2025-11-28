export interface GiftCardSource {
  id: number; // This should be the database ID (giftcard_id) for API calls
  name: string;
  status: string;
  cpid: string;
  cpidx: string;
  latency: number | null;
  providerStatus: string;
  cardStatus: string;
  utid?: string;
  rebate_provider_percentage?: number;
  rebate_base_percentage?: number;
  rebate_customer_percentage?: number;
  rebate_cp_percentage?: number;
}
