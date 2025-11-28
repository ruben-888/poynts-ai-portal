import { NextResponse } from "next/server";
import { getWelldotCredentials } from "@/services/reports/legacy/credentials";

/**
 * GET handler for credentials endpoint
 * Returns credentials for Welldot client using the credentials service
 *
 * @returns {NextResponse} JSON response with primary and backup credentials
 */
export async function GET() {
  // Get credentials from service
  const response = await getWelldotCredentials();

  // Handle service errors
  if (response.error) {
    const status = response.error === "Client not found" ? 404 : 500;
    return NextResponse.json({ error: response.error }, { status });
  }

  // Return credentials
  return NextResponse.json(response, { status: 200 });
}
