import { NextResponse } from "next/server";
import { postgresDb } from "@/utils/postgres-db";

interface RouteParams {
  params: Promise<{ campaign_id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { campaign_id } = await params;

    // Verify campaign exists
    const campaign = await postgresDb.campaigns.findUnique({
      where: { id: campaign_id },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const { step_ids } = body;

    if (!Array.isArray(step_ids) || step_ids.length === 0) {
      return NextResponse.json(
        { error: "step_ids array is required" },
        { status: 400 }
      );
    }

    // Update each step's order based on its position in the array
    for (let i = 0; i < step_ids.length; i++) {
      await postgresDb.campaign_steps.update({
        where: { id: step_ids[i] },
        data: { step_order: i + 1, updated_at: new Date() },
      });
    }

    // Fetch updated steps
    const steps = await postgresDb.campaign_steps.findMany({
      where: { campaign_fk: campaign_id },
      orderBy: { step_order: "asc" },
    });

    return NextResponse.json({ data: steps });
  } catch (error) {
    console.error("Error reordering campaign steps:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to reorder campaign steps";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
