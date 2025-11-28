import { NextResponse } from 'next/server';

/**
 * GET handler for the balances endpoint
 * Proxies requests to the Tango accounts-all-providers API
 * Returns balance information for various gift card providers
 */
export async function GET() {
  try {
    // Target URL to proxy the request to
    const targetUrl = 'https://prod.well.carepoynt.com/redemption-service/tango/accounts-all-providers';
    
    // Make the request to the target URL
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    // Parse the response data
    const data = await response.json();

    // Return the data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching balance data:', error);
    
    // Return an error response
    return NextResponse.json(
      { error: 'Failed to fetch balance data' },
      { status: 500 }
    );
  }
}
