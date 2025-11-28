import { db } from "@/utils/db";

export interface ClientData {
  ent_id: string;
  ent_id_parent: string;
  ent_name: string;
  ent_desc: string;
  ent_type: string;
  ent_startDate: string;
  ent_status: string;
  ent_phone: string | null;
  ent_address: string;
  ent_city: string;
  ent_state: string;
  ent_zip: string;
  ent_interfaces: string;
  ent_ADT_user: string | null;
  ent_ADT_pw: string | null;
  ent_npi: string | null;
  ent_aid: string;
  ent_demo: string;
  ent_cmspmpm: string;
  ent_paid: string;
  geo_long: string;
  geo_lat: string;
  profile_logo: string;
  profile_photo: string;
  profile_rating_google: string | null;
  profile_rating_fb: string | null;
  profile_rating_yelp: string | null;
  profile_reviews_google: string | null;
  profile_reviews_fb: string | null;
  profile_reviews_yelp: string | null;
  profile_details: string | null;
  website_url: string | null;
  parent_name: string;
  member_count: number;
}

export async function getAllClients(): Promise<ClientData[]> {
  const enterprises = await db.$queryRaw<Array<any>>`
    SELECT e.*, p.ent_name AS parent_name,
      (SELECT COUNT(*) 
       FROM member_role mr 
       JOIN member m ON mr.memberid = m.memberid 
       WHERE mr.entid = e.ent_id AND mr.roleStatus = 1 AND m.mode = 'live') AS member_count
    FROM enterprise AS e 
    JOIN enterprise AS p ON e.ent_id_parent = p.ent_id
    ORDER BY e.ent_name ASC
  `;

  // Format the data to match the expected response format
  return enterprises.map((enterprise) => ({
    ent_id: String(enterprise.ent_id),
    ent_id_parent: String(enterprise.ent_id_parent),
    ent_name: enterprise.ent_name,
    ent_desc: enterprise.ent_desc,
    ent_type: enterprise.ent_type,
    ent_startDate: enterprise.ent_startDate.toISOString(),
    ent_status: enterprise.ent_status,
    ent_phone: enterprise.ent_phone,
    ent_address: enterprise.ent_address || "",
    ent_city: enterprise.ent_city || "",
    ent_state: enterprise.ent_state || "",
    ent_zip: enterprise.ent_zip || "",
    ent_interfaces: enterprise.ent_interfaces || "",
    ent_ADT_user: enterprise.ent_ADT_user,
    ent_ADT_pw: enterprise.ent_ADT_pw,
    ent_npi: enterprise.ent_npi,
    ent_aid: enterprise.ent_aid || "",
    ent_demo: String(enterprise.ent_demo),
    ent_cmspmpm: String(enterprise.ent_cmspmpm),
    ent_paid: String(enterprise.ent_paid),
    geo_long: String(enterprise.geo_long || ""),
    geo_lat: String(enterprise.geo_lat || ""),
    profile_logo: enterprise.profile_logo || "",
    profile_photo: enterprise.profile_photo || "",
    profile_rating_google: enterprise.profile_rating_google,
    profile_rating_fb: enterprise.profile_rating_fb,
    profile_rating_yelp: enterprise.profile_rating_yelp,
    profile_reviews_google: enterprise.profile_reviews_google,
    profile_reviews_fb: enterprise.profile_reviews_fb,
    profile_reviews_yelp: enterprise.profile_reviews_yelp,
    profile_details: enterprise.profile_details,
    website_url: enterprise.website_url,
    parent_name: enterprise.parent_name,
    member_count: Number(enterprise.member_count) || 0,
  }));
}
