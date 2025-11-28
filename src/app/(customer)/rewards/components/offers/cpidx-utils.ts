// Helper to generate a 10-character uppercase brand slug from brand name
function getBrandSlug(brandName: string): string {
  // Remove non-alphanumeric, uppercase, trim to max 10 chars, min 5 chars
  const cleaned = (brandName || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (cleaned.length < 5) return ""; // or throw new Error("Brand slug must be at least 5 chars");
  return cleaned.slice(0, 10);
}

// Helper to generate a 6-character random alphanumeric string
function getRandomString(length = 6): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Main function to generate CPIDx
export function generateCpidx({
  brandName,
  language,
  value,
}: {
  brandName: string;
  language: string;
  value: string | number;
}): string {
  const prefix = "OC";
  const brandSlug = getBrandSlug(brandName);
  const lang = (language || "EN").toUpperCase();
  const val = typeof value === "string" ? parseFloat(value) : value;
  const valuePart = isNaN(val) ? "0" : String(Math.round(val));
  const random = getRandomString(6);
  return `${prefix}-${brandSlug}-${lang}-${valuePart}-${random}`;
} 
