import { NextResponse } from 'next/server';
import { db } from '@/utils/db';

/**
 * Utility function to convert snake_case keys to camelCase
 * @param obj The object to convert
 * @returns A new object with camelCase keys
 */
function toCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      // Convert key from snake_case to camelCase
      const camelKey = key.replace(/([-_][a-z])/g, group => 
        group.toUpperCase().replace('-', '').replace('_', '')
      );
      
      // Apply recursively to nested objects
      acc[camelKey] = toCamelCase(obj[key]);
      return acc;
    }, {} as Record<string, any>);
  }
  
  return obj;
}

/**
 * Extracts the part of an email before the @ sign
 * @param email The email address
 * @returns The part before the @ sign, or an empty string if no @ sign is found
 */
function extractCustomerMemberId(email: string): string {
  if (!email) return '';
  const atIndex = email.indexOf('@');
  return atIndex > 0 ? email.substring(0, atIndex) : email;
}

/**
 * GET handler to retrieve the 100 most recent members
 * Returns members ordered by memberid in descending order
 * Excludes problematic date fields to avoid errors
 * Converts response keys to camelCase
 * Includes transaction count for each member
 * Adds customerMemberId field extracted from email
 * Includes the first enterprise associated with the member
 */
export async function GET() {
  try {
    // Fetch the 100 most recent members ordered by memberid descending
    const members = await db.member.findMany({
      take: 100,
      orderBy: {
        memberid: 'desc',
      },
      select: {
        // Include only the required fields
        memberid: true,
        email: true,
        mPhone: true,
        name: true,
        memberStatus: true,
        gender: true,
        zip: true,
        directEmail: true,
        tzOffset: true,
        address: true,
        city: true,
        state: true,
        hPhone: true,
        accountNum: true,
        username: true,
        isLive: true,
        mode: true,
        // Include member roles with enterprise information
        memberRoles: {
          take: 1, // Get just the first role with enterprise
          select: {
            enterprise: {
              select: {
                ent_id: true,
                ent_name: true,
                ent_type: true,
                ent_status: true,
              }
            }
          }
        }
      }
    });

    // Get the member IDs to fetch transaction counts
    const memberIds = members.map(member => member.memberid);

    // Fetch transaction counts for each member
    const transactionCounts = await db.cp_transactionlog.groupBy({
      by: ['memberid'],
      _count: {
        id: true
      },
      where: {
        memberid: {
          in: memberIds
        }
      }
    });

    // Create a map of member ID to transaction count
    const transactionCountMap = new Map();
    transactionCounts.forEach(count => {
      transactionCountMap.set(count.memberid, count._count.id);
    });

    // Add transaction counts and customerMemberId to member data
    const processedMembers = members.map(member => {
      // Extract the first enterprise if it exists
      const firstEnterprise = member.memberRoles?.[0]?.enterprise || null;

      return {
        ...member,
        transactionCount: transactionCountMap.get(member.memberid) || 0,
        customerMemberId: extractCustomerMemberId(member.email),
        client_name: firstEnterprise ? firstEnterprise.ent_name : "Unknown",
        create_date: "—",  // Default value instead of null
        enterprise: firstEnterprise,
        // Remove the memberRoles array since we've extracted what we need
        memberRoles: undefined
      };
    });

    // Convert keys to camelCase
    const camelCaseMembers = toCamelCase(processedMembers);

    // Return the members as JSON with camelCase keys
    return NextResponse.json({ 
      success: true, 
      data: camelCaseMembers 
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch members',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
