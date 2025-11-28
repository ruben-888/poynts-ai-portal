import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils/db';

export async function GET(request: NextRequest) {
  try {
    console.log('= Searching for June 2025 transaction log records without rebate values...');
    
    // Query for records in June 2025 where all rebate fields are null or 0
    const missingRebateRecords = await db.cp_transactionlog.findMany({
      where: {
        date: {
          gte: new Date('2025-06-01T00:00:00.000Z'),
          lt: new Date('2025-07-01T00:00:00.000Z')
        },
        AND: [
          {
            OR: [
              { rebate_provider_percentage: null },
              { rebate_provider_percentage: 0 }
            ]
          },
          {
            OR: [
              { rebate_provider_amount: null },
              { rebate_provider_amount: 0 }
            ]
          },
          {
            OR: [
              { rebate_base_percentage: null },
              { rebate_base_percentage: 0 }
            ]
          },
          {
            OR: [
              { rebate_base_amount: null },
              { rebate_base_amount: 0 }
            ]
          },
          {
            OR: [
              { rebate_customer_percentage: null },
              { rebate_customer_percentage: 0 }
            ]
          },
          {
            OR: [
              { rebate_customer_amount: null },
              { rebate_customer_amount: 0 }
            ]
          },
          {
            OR: [
              { rebate_cp_percentage: null },
              { rebate_cp_percentage: 0 }
            ]
          },
          {
            OR: [
              { rebate_cp_amount: null },
              { rebate_cp_amount: 0 }
            ]
          }
        ]
      },
      select: {
        id: true,
        date: true,
        memberid: true,
        entid: true,
        promo_id: true,
        reward_id: true,
        reward_name: true,
        reward_type: true,
        order_amount: true,
        poynts: true,
        result: true,
        rebate_provider_percentage: true,
        rebate_provider_amount: true,
        rebate_base_percentage: true,
        rebate_base_amount: true,
        rebate_customer_percentage: true,
        rebate_customer_amount: true,
        rebate_cp_percentage: true,
        rebate_cp_amount: true,
        provider_reference_id: true,
        cp_transaction_reference: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    console.log(`= Found ${missingRebateRecords.length} records in June 2025 without rebate values`);
    
    // Calculate summary statistics
    const rewardTypeSummary = missingRebateRecords.reduce((acc, record) => {
      const type = record.reward_type || 'Unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const totalAmount = missingRebateRecords.reduce((sum, record) => {
      return sum + (parseFloat(record.order_amount?.toString() || '0') || 0);
    }, 0);
    
    const totalPoynts = missingRebateRecords.reduce((sum, record) => {
      return sum + (record.poynts || 0);
    }, 0);

    return NextResponse.json({
      success: true,
      data: {
        total_records: missingRebateRecords.length,
        records: missingRebateRecords,
        summary: {
          by_reward_type: rewardTypeSummary,
          total_order_amount: totalAmount,
          total_poynts: totalPoynts
        }
      }
    });
    
  } catch (error) {
    console.error('Error querying transaction log:', error);
    
    return NextResponse.json({
      success: false,
      error: {
        message: 'Failed to query transaction log',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}