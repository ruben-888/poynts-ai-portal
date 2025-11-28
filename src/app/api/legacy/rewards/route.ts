import { NextResponse } from 'next/server';

/**
 * Legacy Rewards API
 * 
 * Fetches rewards data from the external CarePoynt system and returns it in its
 * original format without any transformation or grouping.
 * 
 * This endpoint serves as a direct pass-through to the external rewards system,
 * maintaining backward compatibility with systems that expect the original data structure.
 */
export async function GET() {
  try {
    // Make the same external request as the main rewards endpoint
    const response = await fetch(
      "https://prod.well.carepoynt.com/mc/rewards/availiable/8",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Get the raw rewards data without transformation
    const rewards = await response.json();

    // Return the raw data directly
    return NextResponse.json({ 
      data: rewards,
      source: "legacy",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error fetching legacy rewards:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch legacy rewards",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
