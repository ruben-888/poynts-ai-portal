import { NextRequest, NextResponse } from 'next/server';
import { dashboardService, TransactionDateRange } from '@/services/reports/legacy/dashboard';

/**
 * GET handler for transactions API
 * 
 * Query parameters:
 * - startDate: Optional start date in ISO format (YYYY-MM-DD)
 * - endDate: Optional end date in ISO format (YYYY-MM-DD)
 * - memberId: Optional member ID to filter by
 * - enterpriseId: Optional enterprise ID to filter by
 * - includeMetadata: Optional boolean to include query metadata
 * - page: Optional page number for pagination (default: 1)
 * - pageSize: Optional number of items per page (default: 50, max: 100)
 * 
 * @param request The incoming request
 * @returns JSON response with transaction data
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const memberId = searchParams.get('memberId');
    const enterpriseId = searchParams.get('enterpriseId');
    const includeMetadata = searchParams.get('includeMetadata') === 'true';
    
    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '50', 10)));
    
    // Prepare date range if provided
    const dateRange: TransactionDateRange = {};
    
    if (startDateParam) {
      dateRange.startDate = new Date(startDateParam);
    }
    
    if (endDateParam) {
      dateRange.endDate = new Date(endDateParam);
    }
    
    // Fetch transactions based on parameters
    let transactions;
    let metadata;
    
    if (memberId) {
      // Get transactions for specific member
      transactions = await dashboardService.getMemberTransactions(memberId, dateRange);
    } else if (enterpriseId) {
      // Get transactions for specific enterprise
      transactions = await dashboardService.getEnterpriseTransactions(enterpriseId, dateRange);
    } else if (includeMetadata) {
      // Get transactions with metadata
      const result = await dashboardService.getTransactionsWithMetadata(dateRange);
      transactions = result.transactions;
      metadata = result.metadata;
    } else {
      // Get all transactions for the date range
      transactions = await dashboardService.getTransactions(dateRange);
    }
    
    // Apply pagination
    const totalItems = transactions.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    // Prepare response
    const response = {
      transactions: paginatedTransactions,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    };
    
    // Include metadata if requested
    if (metadata) {
      return NextResponse.json({
        ...response,
        metadata,
      });
    }
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching transaction data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction data', message: (error as Error).message },
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
