/**
 * Helper function to handle BigInt serialization for API responses
 */
export function serializeBigInt(data: any): any {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === "bigint") {
    return data.toString();
  }

  // Handle Date objects properly
  if (data instanceof Date) {
    // Return null for invalid dates instead of empty objects
    return isNaN(data.getTime()) ? null : data.toISOString();
  }

  if (Array.isArray(data)) {
    return data.map(serializeBigInt);
  }

  if (typeof data === "object") {
    const result: Record<string, any> = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        result[key] = serializeBigInt(data[key]);
      }
    }
    return result;
  }

  return data;
}
