import { db } from "@/utils/db";
import { serializeBigInt } from "@/app/api/_utils/formatters";
import { computeStatusFromDbFields, type FrontendStatus } from "../(routes)/offers/utils";

interface OfferRedemptionCode {
  id: number;
  cp_redemptions_id: number | null;
  code: string;
  date_used: Date | null;
  date_added: Date | null;
}

interface OfferQueryResult {
  id: number;
  cpid: string | null;
  title: string | null;
  description: string | null;
  reward_status: string | null;
  reward_availability: string | null;
  startdate: Date | null;
  enddate: Date | null;
  entid: number | null;
  redem_type: string | null;
  renewal_rule: string;
  redem_value: number | null;
  fielo_promo_id: string | null;
  status: number | null;
  redemBase_id: number | null;
  coupon_expiredate: Date | null;
  is_coupon: number | null;
  coupon_code: string | null;
  coupon_url: string | null;
  coupon_bitmap: Buffer | null;
  frequency: number | null;
  pos_code: string | null;
  voucher_type_id: number | null;
  is_deleted: number;
  is_active: number;
  create_date: Date;
  update_date: Date;
  redem_code: string | null;
  redem_code_type: string | null;
  partner_voucher_amount: number | null;
  inventory_type: string | null;
  inventory_remaining: number | null;
  instructions: string | null;
  disclaimer: string | null;
  shortDescription: string | null;
  terms: string | null;
  imageUrl: string | null;
  language: string | null;
  custom_id: string | null;
  rebate_value: number | null;
  redem_url: string | null;
  value: string | null;
  tags: string | null;
  brand_name: string | null;
  days_active: number;
  days_left: number;
}

interface TransformedOffer extends OfferQueryResult {
  redemption_codes: {
    code_total: number;
    codes_used: number;
    codes_available: number;
    codes: OfferRedemptionCode[];
  };
  // Add computed status field
  status: FrontendStatus;
}

export async function getSingleOfferById(redemptionId: string | number) {
  try {
    // Convert to number if string
    const id =
      typeof redemptionId === "string" ? parseInt(redemptionId) : redemptionId;

    if (isNaN(id)) {
      throw new Error("Invalid redemption ID");
    }

    console.log("getting offer by id", id);

    // Get the main offer data
    const offers = await db.$queryRaw<OfferQueryResult[]>`
      SELECT id, cpid,
          title,
          description,
          reward_status,
          reward_availability,
          startdate,
          enddate,
          entid,
          redem_type,
          renewal_rule,
          redem_value,
          fielo_promo_id,
          IF(enddate < NOW(), 0, status) as status,
          reward_status,
          redemBase_id,
          coupon_expiredate,
          is_coupon,
          coupon_code,
          coupon_url,
          coupon_bitmap,
          frequency,
          pos_code,
          voucher_type_id,
          is_deleted,
          is_active,
          create_date,
          update_date,
          redem_code,
          redem_code_type,
          partner_voucher_amount,
          inventory_type,
          inventory_remaining,
          instructions,
          disclaimer,
          shortDescription,
          terms,
          imageUrl,
          language,
          custom_id,
          rebate_value,
          redem_url,
          value,
          tags,
          brandName as brand_name,
          DATEDIFF(enddate, startdate) as days_active,
          IF(DATEDIFF(enddate, CURDATE()) < 0, 0, DATEDIFF(enddate, CURDATE())) as days_left
      FROM cp_redemptions
      WHERE id = ${id}
      AND is_deleted = 0
    `;

    if (!offers || offers.length === 0) {
      console.log("no offer found", id);
      return null;
    }

    const offer = offers[0];

    // Get redemption codes for this offer
    const redemptionCodes = await db.$queryRaw<OfferRedemptionCode[]>`
      SELECT * FROM cp_redemptions_codes 
      WHERE cp_redemptions_id = ${offer.id}
    `;

    // Calculate code statistics
    let codes_total = 0;
    let codes_used = 0;
    let codes_available = 0;

    redemptionCodes.forEach((code) => {
      codes_total++;
      if (code.date_used) {
        codes_used++;
      } else {
        codes_available++;
      }
    });

    // Compute the frontend status from database fields
    const computedStatus = computeStatusFromDbFields(
      offer.is_active,
      offer.reward_status,
      offer.is_deleted
    );

    // Transform the offer to include redemption codes data and computed status
    const transformedOffer: TransformedOffer = {
      ...offer,
      redemption_codes: {
        code_total: codes_total,
        codes_used: codes_used,
        codes_available: codes_available,
        codes: redemptionCodes,
      },
      status: computedStatus,
    };

    // Serialize BigInt values before returning
    return serializeBigInt(transformedOffer);
  } catch (error) {
    console.error("Error fetching single offer:", error);
    throw error;
  }
}
