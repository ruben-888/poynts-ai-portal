import { NextResponse } from 'next/server';
import { getSystemActivity } from '@/services/reports/legacy/system-activity';

/**
 * GET handler for system activity endpoint
 * Returns system activity data from the database
 * 
 * @returns {NextResponse} JSON response with system activity data
 */
export async function GET(request: Request) {
  try {
    // Get URL parameters
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '100');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    
    // Fetch system activity data
    const activities = await getSystemActivity(limit, offset);
    
    // Return the data as JSON
    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error in system activity API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch system activity data' },
      { status: 500 }
    );
  }
}
