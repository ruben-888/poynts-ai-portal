import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { convertKeysToCamelCase } from "@/utils/formatters";
import { performance } from "perf_hooks";

/**
 * Extracts the part of an email before the @ sign
 * @param email The email address
 * @returns The part before the @ sign, or an empty string if no @ sign is found
 */
function extractCustomerMemberId(email: string): string {
  if (!email) return "";
  const atIndex = email.indexOf("@");
  return atIndex > 0 ? email.substring(0, atIndex) : email;
}

/**
 * GET handler to retrieve the 100 most recent members
 * Returns members ordered by memberid in descending order
 * Returns only the required fields with proper naming
 * Includes last activity date for each member
 * Includes the first enterprise associated with the member
 * Now includes metadata with total counts
 */
export async function GET() {
  try {

    // -------- performance instrumentation --------
    const timings: Record<string, number> = {};
    const startTime = performance.now();
    let checkpoint = startTime;
    // ---------------------------------------------

    // Check permissions
    const { has } = await auth();
    const canViewMembers = has({ permission: "org:members:view" });

    // log auth time
    timings.auth = performance.now() - checkpoint;
    checkpoint = performance.now();

    if (!canViewMembers) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get total counts for metadata using fast raw SQL
    const [totalCountsResult] = await Promise.all([
      db.$queryRaw<Array<{ totalMembers: bigint; totalClients: bigint }>>`
        SELECT 
          (SELECT SUM(
            (SELECT COUNT(*) 
             FROM member_role mr 
             JOIN member m ON mr.memberid = m.memberid 
             WHERE mr.entid = e.ent_id AND mr.roleStatus = 1 AND m.mode = 'live')
          ) 
          FROM enterprise e 
          JOIN enterprise p ON e.ent_id_parent = p.ent_id) as totalMembers,
          (SELECT COUNT(*) 
           FROM enterprise e 
           JOIN enterprise p ON e.ent_id_parent = p.ent_id) as totalClients
      `,
    ]);

    // log totalCounts query time
    timings.totalCountsQuery = performance.now() - checkpoint;
    checkpoint = performance.now();

    const totalMembers = Number(totalCountsResult[0]?.totalMembers || 0);
    const totalClients = Number(totalCountsResult[0]?.totalClients || 0);

    // Single optimized raw SQL query to get members with enterprise info
    const membersWithData = await db.$queryRaw<
      Array<{
        memberid: number;
        email: string;
        mPhone: string | null;
        name: string | null;
        memberStatus: string | null;
        zip: string | null;
        mode: string | null;
        create_date: Date | null;
        update_date: Date | null;
        lastActivity: Date | null;
        ent_id: number | null;
        ent_name: string | null;
        ent_type: string | null;
        ent_status: string | null;
      }>
    >`
      SELECT 
        m.memberid,
        m.email,
        m.mPhone,
        m.name,
        m.memberStatus,
        m.zip,
        m.mode,
        m.create_date,
        m.update_date,
        m.lastActivity,
        e.ent_id,
        e.ent_name,
        e.ent_type,
        e.ent_status
      FROM member m
      LEFT JOIN (
        SELECT 
          mr.memberid,
          ent.ent_id,
          ent.ent_name,
          ent.ent_type,
          ent.ent_status
        FROM member_role mr
        JOIN enterprise ent ON mr.entid = ent.ent_id
        JOIN (
          SELECT memberid, MIN(member_roleid) as min_id
          FROM member_role
          GROUP BY memberid
        ) first_role ON mr.memberid = first_role.memberid AND mr.member_roleid = first_role.min_id
      ) e ON m.memberid = e.memberid
      ORDER BY m.memberid DESC
      LIMIT 10000
    `;

    // log members query time
    timings.membersQuery = performance.now() - checkpoint;
    checkpoint = performance.now();

    // Process members and format response
    const processedMembers = membersWithData.map((member) => {
      return {
        id: member.memberid, // Renamed from memberid
        email: member.email,
        mPhone: member.mPhone,
        name: member.name,
        status: member.memberStatus, // Renamed from memberStatus
        zip: member.zip,
        mode: member.mode,
        customerMemberId: extractCustomerMemberId(member.email),
        clientName: member.ent_name || "Unknown",
        lastActivityDate: member.lastActivity
          ? member.lastActivity.toISOString()
          : null,
        createDate: member.create_date
          ? member.create_date.toISOString()
          : null,
        updateDate: member.update_date
          ? member.update_date.toISOString()
          : null,
        enterprise: member.ent_id
          ? {
              entId: member.ent_id,
              entName: member.ent_name,
              entType: member.ent_type,
              entStatus: member.ent_status,
            }
          : null,
      };
    });

    // Convert keys to camelCase using the existing utility
    const camelCaseMembers = convertKeysToCamelCase(processedMembers);

    // log processing time
    timings.processing = performance.now() - checkpoint;
    timings.total = performance.now() - startTime;
    console.log("Members endpoint timings (ms):", timings);

    // Return the members as JSON with the required data format and metadata
    return NextResponse.json({
      data: camelCaseMembers,
      meta: {
        totalMembers,
        totalClients,
        returned: camelCaseMembers.length,
        limit: 10000,
      },
    });
  } catch (error) {
    console.error("Error fetching members:", error);

    // Return error response
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}
