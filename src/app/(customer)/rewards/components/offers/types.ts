export interface OfferDetail {
  cpid: string;
  type: "giftcard" | "offer";
  title: string;
  brand_name: string;
  language: string;
  value: number;
  poynts: number;
  source_count: number;
  tenant_id: string | Record<string, never>;
  reward_status: string;
  reward_availability: string;
  tags?: string | null;
  startdate?: string | null | Record<string, never>;
  enddate?: string | null | Record<string, never>;
  is_enabled: boolean;
  value_type?: string;
  description?: string;
  disclaimer?: string;
  terms?: string;
  items: {
    id: number;
    tenant_id: string | Record<string, never>;
    redemption_id: string | number;
    cpid: string;
    redemption_type: string;
    value: number | string;
    poynts: number | string;
    redem_value?: number;
    name: string | null;
    inventory_remaining: number;
    title: string;
    startdate?: string | null | Record<string, never>;
    enddate?: string | null | Record<string, never>;
    reward_status: string;
    language: string;
    reward_availability: string;
    utid?: string;
    value_type?: string;
    tags?: string | null;
    priority: number;
    provider_id?: number;
    cpidx: string;
    type: string;
    reward_image?: string;
    source_letter?: string;
    latency?: string | number;
    description?: string;
    disclaimer?: string;
    terms?: string;
  }[];
}

export interface DetailedOfferData {
  id: number;
  cpid: string;
  title: string;
  description: string;
  reward_status: string;
  reward_availability: string;
  startdate: Record<string, never> | string;
  enddate: Record<string, never> | string;
  entid: number;
  redem_type: string;
  renewal_rule: string;
  redem_value: number;
  fielo_promo_id: string;
  status: string;
  redemBase_id: number | null;
  coupon_expiredate: string | null;
  is_coupon: number;
  coupon_code: string | null;
  coupon_url: string | null;
  coupon_bitmap: string | null;
  frequency: number;
  pos_code: string | null;
  voucher_type_id: number;
  is_deleted: number;
  is_active: number;
  create_date: Record<string, never>;
  update_date: Record<string, never>;
  redem_code: string | null;
  redem_code_type: string;
  partner_voucher_amount: number;
  inventory_type: string;
  inventory_remaining: number;
  instructions: string;
  disclaimer: string;
  shortDescription: string;
  terms: string;
  imageUrl: string;
  language: string;
  custom_id: string;
  rebate_value: number | null;
  redem_url: string | null;
  value: string;
  tags: string;
  brand_name: string;
  days_active: string;
  days_left: string;
  redemption_codes: {
    code_total: number;
    codes_used: number;
    codes_available: number;
    codes: {
      id: number;
      cp_redemptions_id: number;
      code: string;
      date_used: string | null;
      date_added: Record<string, never>;
    }[];
  };
}

export interface DetailedOfferResponse {
  success: boolean;
  data: DetailedOfferData;
}

export interface BaseTabProps {
  offerData?: DetailedOfferData;
  selectedOffer?: OfferDetail | null;
  isCreateMode?: boolean;
  canManageRewards: boolean;
  isSaving: boolean;
  setIsSaving: (saving: boolean) => void;
  redemptionId: string;
  onClose?: () => void;
}

export interface DetailsTabProps extends BaseTabProps {
  languageInput: string;
  setLanguageInput: (value: string) => void;
  redemptionUrlInput: string;
  setRedemptionUrlInput: (value: string) => void;
  customIdInput: string;
  setCustomIdInput: (value: string) => void;
  rebateValueInput: string;
  setRebateValueInput: (value: string) => void;
  startDateInput: string;
  setStartDateInput: (value: string) => void;
  endDateInput: string;
  setEndDateInput: (value: string) => void;
  isDirty: boolean;
  brandNameInput: string;
  valueInput: string;
}
