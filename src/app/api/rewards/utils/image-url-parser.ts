/**
 * Centralized image URL parsing utilities for rewards
 * Handles various formats: direct URLs, data URLs, and JSON objects with multiple sizes
 */

/**
 * Cleans a JSON string by removing control characters that might break parsing
 */
function cleanJsonString(jsonString: string): string {
  return jsonString
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '') // Remove control characters except \n, \r, \t
    .replace(/[\n\r\t]/g, ' ') // Replace newlines, returns, tabs with spaces
    .trim();
}

/**
 * Checks if a string is a direct URL (HTTP/HTTPS/path/data URL)
 */
function isDirectUrl(str: string): boolean {
  return (
    str.startsWith('http') ||
    str.startsWith('/') ||
    str.startsWith('data:image')
  );
}

/**
 * Extracts the width from an image key like "300w-326ppi"
 */
function extractWidth(key: string): number | null {
  const match = key.match(/(\d+)w-/);
  return match && match[1] ? parseInt(match[1], 10) : null;
}

/**
 * Selects the best image URL from a parsed JSON object
 * Prefers 300w image, then largest by width, then first available
 */
function selectBestImageUrl(imageUrls: Record<string, string>): string | undefined {
  // Prefer 300w image
  if (imageUrls['300w-326ppi']) {
    return imageUrls['300w-326ppi'];
  }

  // Find largest image by width
  let largestWidth = 0;
  let largestUrl: string | undefined;

  for (const [key, url] of Object.entries(imageUrls)) {
    const width = extractWidth(key);
    if (width && width > largestWidth) {
      largestWidth = width;
      largestUrl = url;
    }
  }

  // Return largest or fallback to first available
  return largestUrl || Object.values(imageUrls)[0];
}

/**
 * Attempts to parse a JSON string (with cleaning) and extract the best image URL
 */
function parseJsonImageUrls(jsonString: string, rewardId?: string): string | undefined {
  try {
    const cleanedJson = cleanJsonString(jsonString);
    const imageUrls = JSON.parse(cleanedJson);
    return selectBestImageUrl(imageUrls);
  } catch (error) {
    if (rewardId) {
      console.warn(`Failed to parse image JSON for reward ${rewardId}:`, error);
    }
    return undefined;
  }
}

/**
 * Attempts to parse a simple JSON string (without cleaning) and extract the best image URL
 * Used for well-formed JSON that doesn't need control character removal
 */
function parseSimpleJsonImageUrls(jsonString: string, rewardId?: string): string | undefined {
  try {
    const imageUrls = JSON.parse(jsonString);
    return selectBestImageUrl(imageUrls);
  } catch (error) {
    if (rewardId) {
      console.warn(`Error parsing imageUrlsJson for reward ${rewardId}:`, error);
    }
    return undefined;
  }
}

/**
 * Parses an image URL from various possible formats:
 * - Direct URLs (http/https/path/data:image)
 * - JSON objects with multiple image sizes
 * - Plain strings
 *
 * @param imageUrlsJson - The raw image data string
 * @param rewardId - Optional reward ID for logging
 * @param useCleaningForJson - Whether to apply control character cleaning (default: false)
 * @returns The extracted image URL or undefined
 */
export function parseImageUrl(
  imageUrlsJson: string | null | undefined,
  rewardId?: string,
  useCleaningForJson = false
): string | undefined {
  if (!imageUrlsJson) {
    return undefined;
  }

  try {
    // Direct URL check
    if (isDirectUrl(imageUrlsJson)) {
      return imageUrlsJson;
    }

    // JSON object check
    if (imageUrlsJson.startsWith('{') || imageUrlsJson.startsWith('[')) {
      return useCleaningForJson
        ? parseJsonImageUrls(imageUrlsJson, rewardId)
        : parseSimpleJsonImageUrls(imageUrlsJson, rewardId);
    }

    // Fallback: treat as direct URL
    return imageUrlsJson;
  } catch (error) {
    if (rewardId) {
      console.warn(`Error parsing imageUrlsJson for reward ${rewardId}:`, error);
    }

    // Last resort: if it looks like a URL, return it
    if (isDirectUrl(imageUrlsJson)) {
      return imageUrlsJson;
    }

    return undefined;
  }
}

/**
 * Legacy function name for backward compatibility
 * Extracts image URL from imageUrlsJson (simple JSON parsing without cleaning)
 */
export function extractImageUrl(imageUrlsJson?: string | null): string | undefined {
  return parseImageUrl(imageUrlsJson, undefined, false);
}
