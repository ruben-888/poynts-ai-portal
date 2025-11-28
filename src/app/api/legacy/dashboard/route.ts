import { NextResponse } from 'next/server';
import { getBigQueryDashboardData, getSimpleDashboardData } from '@/services/reports/dashboard-metrics';

/**
 * GET handler for the dashboard endpoint
 * Returns dashboard metrics including transaction counts, amounts, and member data
 * Uses BigQuery for data retrieval
 * 
 * Query parameters:
 * - startDate: Optional start date in ISO format (YYYY-MM-DD)
 * - endDate: Optional end date in ISO format (YYYY-MM-DD)
 * - full: Optional boolean to use the full (non-simplified) version
 */
export async function GET(request: Request) {
  try {
    // Parse date range from query parameters or use default (month-to-date)
    const { searchParams } = new URL(request.url);
    
    // Check if we should use the full version (default to simplified)
    const useFull = searchParams.get('full') === 'true';
    
    // Default to month-to-date if no dates provided
    const defaultEndDate = new Date();
    const defaultStartDate = new Date(defaultEndDate.getFullYear(), defaultEndDate.getMonth(), 1);
    
    // Parse start and end dates from query parameters
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    
    const startDate = startDateParam ? new Date(startDateParam) : defaultStartDate;
    const endDate = endDateParam ? new Date(endDateParam) : defaultEndDate;
    
    // Get dashboard data from BigQuery - use simplified version by default
    const dashboardData = useFull 
      ? await getBigQueryDashboardData(startDate, endDate)
      : await getSimpleDashboardData(startDate, endDate);
    
    // Return the response as JSON
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error in dashboard endpoint:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'An error occurred in the dashboard endpoint',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
