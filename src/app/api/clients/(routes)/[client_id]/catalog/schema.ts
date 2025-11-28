import { z } from "zod";

const ImageSchema = z.object({
  "1200w-326ppi": z.string(),
  "130w-326ppi": z.string(),
  "200w-326ppi": z.string(),
  "278w-326ppi": z.string(),
  "300w-326ppi": z.string(),
  "80w-326ppi": z.string(),
});

const GiftCardItemSchema = z.object({
  cpid: z.string(),
  brandName: z.string(),
  title: z.string(),
  language: z.string(),
  giftcard_id: z.string(),
  display_order: z.string().nullable(),
  utid: z.string(),
  value: z.string(),
  redem_value: z.string(),
  type: z.literal("giftcard"),
  inventory_type: z.string(),
  inventory_remaining: z.string(),
  reward_status: z.string(),
  reward_availability: z.string(),
  catalog_id: z.string(),
  source: z.string(),
  tag_name: z.string(),
});

const GiftCardBrandSchema = z.object({
  brand_id: z.string(),
  brandName: z.string(),
  rewardName: z.string(),
  images: ImageSchema,
  items: z.array(GiftCardItemSchema),
});

const OfferItemSchema = z.object({
  offer_id: z.string(),
  cpid: z.string(),
  brandName: z.string(),
  title: z.string(),
  description: z.string(),
  language: z.string(),
  startdate: z.string(),
  enddate: z.string(),
  redem_value: z.string(),
  status: z.string(),
  reward_status: z.string(),
  reward_availability: z.string(),
  rebate_value: z.string().nullable(),
  create_date: z.string(),
  update_date: z.string(),
  redem_code: z.string(),
  inventory_type: z.string(),
  inventory_remaining: z.string(),
  instructions: z.string(),
  disclaimer: z.string(),
  shortDescription: z.string(),
  terms: z.string(),
  imageUrl: z.string().nullable(),
  custom_id: z.string(),
  redem_url: z.string(),
  value: z.string(),
  tags: z.string(),
  ent_id: z.string(),
  display_order: z.string(),
  catalog_id: z.string(),
  redemption_code_type: z.string(),
  redemption_url: z.string(),
  brand_name: z.string(),
  tag_name: z.string(),
  type: z.literal("offer"),
});

export const CatalogResponseSchema = z.object({
  giftcard: z.array(GiftCardBrandSchema),
  offer: z.array(OfferItemSchema),
});

export type CatalogResponse = z.infer<typeof CatalogResponseSchema>;
