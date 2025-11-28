import { NextRequest, NextResponse } from 'next/server';
import { getTransactionCount, TransactionDateRange } from '@/services/reports/legacy/dashboard';

/**
 * GET handler for transaction count API
 * 
 * This is a simplified endpoint that only returns the count of transactions
 * without any complex joins or additional data. It should be much more efficient
 * than the full transactions endpoint.
 * 
 * Query parameters:
 * - startDate: Optional start date in ISO format (YYYY-MM-DD)
 * - endDate: Optional end date in ISO format (YYYY-MM-DD)
 * 
 * @param request The incoming request
 * @returns JSON response with transaction count
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    // Prepare date range if provided
    const dateRange: TransactionDateRange = {};
    
    if (startDateParam) {
      dateRange.startDate = new Date(startDateParam);
    }
    
    if (endDateParam) {
      dateRange.endDate = new Date(endDateParam);
    }
    
    // Get transaction count using the optimized function
    const count = await getTransactionCount(dateRange);
    
    // Return the response as JSON
    return NextResponse.json({
      success: true,
      count,
      timestamp: new Date().toISOString(),
      dateRange: {
        startDate: dateRange.startDate?.toISOString() || 'default (24h ago)',
        endDate: dateRange.endDate?.toISOString() || 'default (now)'
      }
    });
  } catch (error) {
    console.error('Error fetching transaction count:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch transaction count', 
        message: (error as Error).message 
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS handler to support CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
} 