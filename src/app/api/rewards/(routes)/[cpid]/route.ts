import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { auth } from "@clerk/nextjs/server";
import { getSingleRewardByCPID } from "../../services/get-single-reward-by-cpid";
import { updateSingleReward } from "../../services/update-single-reward";
import { extractUserContext } from "../../../_shared/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { cpid: string } }
) {
  try {
    const { has } = await auth();

    if (!has({ permission: "org:rewards:view" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { cpid } = await params;

    // Check if user has CP admin permissions to include rebate data
    const isCPAdmin = has({ permission: "org:cpadmin:access" });

    const rewards = await getSingleRewardByCPID(cpid, isCPAdmin);
    return NextResponse.json(rewards);
  } catch (error) {
    console.error("Error fetching rewards:", error);
    return NextResponse.json(
      { error: "Failed to fetch rewards" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { cpid: string } }
) {
  try {
    const { has, userId, sessionClaims } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract user context for activity logging
    const userContext = extractUserContext(userId, sessionClaims);

    const { cpid } = await params;

    const data = await request.json();

    // Extract the fields we're handling in this update
    const { poynts, tags } = data;

    // Call the service function to update the reward with user context
    await updateSingleReward(
      cpid,
      {
        poynts: poynts ? Number(poynts) : undefined,
        tags: tags || undefined,
      },
      userContext
    );

    const updatedRewardToReturn = await getSingleRewardByCPID(cpid);

    return NextResponse.json(updatedRewardToReturn, { status: 200 });
  } catch (error) {
    console.error("Error updating reward:", error);
    return NextResponse.json(
      { error: "Failed to update reward" },
      { status: 500 }
    );
  }
}
