type ObjectWithStringKeys = { [key: string]: any };

/**
 * Field name mappings for specific renames
 */
const FIELD_NAME_MAPPINGS: Record<string, string> = {
  promoId: "offerId",
  rewardId: "giftcardId",
};

/**
 * Checks if an object looks like a Prisma Decimal
 * (has s, e, d properties where d is an array of numbers)
 */
function isPrismaDecimal(obj: any): boolean {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "s" in obj &&
    "e" in obj &&
    "d" in obj &&
    Array.isArray(obj.d)
  );
}

/**
 * Converts a Prisma Decimal object to a regular number
 *
 * Prisma Decimal format:
 * - s: sign (1 or -1)
 * - e: exponent (position of decimal point)
 * - d: array of digits
 *
 * Examples:
 * - { s: 1, e: 2, d: [1, 2, 3] } => 123
 * - { s: 1, e: 1, d: [1, 2, 3] } => 12.3
 * - { s: 1, e: 0, d: [1, 2, 3] } => 1.23
 * - { s: 1, e: -1, d: [1, 2, 3] } => 0.123
 */
function convertPrismaDecimalToNumber(decimal: any): number {
  try {
    // For safety, check if this is a valid decimal object
    if (!isPrismaDecimal(decimal)) {
      console.warn("Invalid Prisma Decimal object:", decimal);
      return 0;
    }

    // Use the Decimal.toString() method if available (preferred approach)
    if (
      typeof decimal.toString === "function" &&
      decimal.toString() !== "[object Object]"
    ) {
      return parseFloat(decimal.toString());
    }

    // Manual conversion as fallback - simplified approach
    // Convert to string first, then parse as float
    const str = String(decimal);
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  } catch (error) {
    console.error("Error converting Prisma Decimal:", error);
    return 0;
  }
}

/**
 * Converts snake_case keys to camelCase in an object or array of objects
 * Also converts Prisma Decimal objects to regular numbers and maps specific field names
 * @param input - Object or array of objects with snake_case keys
 * @returns Same structure with camelCase keys and converted decimal values
 */
export function convertKeysToCamelCase<T>(input: T): T {
  // Handle arrays recursively
  if (Array.isArray(input)) {
    return input.map((item) => convertKeysToCamelCase(item)) as T;
  }

  // Handle null or non-object values
  if (input === null || typeof input !== "object") {
    return input;
  }

  // Handle Prisma Decimal objects
  if (isPrismaDecimal(input)) {
    return convertPrismaDecimalToNumber(input) as unknown as T;
  }

  // Convert object keys
  const inputObj = input as ObjectWithStringKeys;
  return Object.keys(inputObj).reduce((acc: ObjectWithStringKeys, key) => {
    // Convert key to camelCase
    const camelKey = key.replace(/_([a-z])/g, (_, letter) =>
      letter.toUpperCase()
    );

    // Apply field name mapping if it exists
    const mappedKey = FIELD_NAME_MAPPINGS[camelKey] || camelKey;

    // Handle nested objects/arrays recursively
    const value =
      typeof inputObj[key] === "object"
        ? convertKeysToCamelCase(inputObj[key])
        : inputObj[key];

    return {
      ...acc,
      [mappedKey]: value,
    };
  }, {}) as T;
}
