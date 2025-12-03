import { NextResponse } from "next/server";
import { postgresDb } from "@/utils/postgres-db";

interface RouteParams {
  params: Promise<{ campaign_id: string; step_id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { campaign_id, step_id } = await params;

    const step = await postgresDb.campaign_steps.findFirst({
      where: {
        id: step_id,
        campaign_fk: campaign_id,
      },
    });

    if (!step) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    return NextResponse.json({ data: step });
  } catch (error) {
    console.error("Error fetching campaign step:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign step" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { campaign_id, step_id } = await params;

    // Verify step exists
    const existingStep = await postgresDb.campaign_steps.findFirst({
      where: {
        id: step_id,
        campaign_fk: campaign_id,
      },
    });

    if (!existingStep) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    const body = await request.json();

    const { name, description, poynts, action_type, action_config, is_required } =
      body;

    const step = await postgresDb.campaign_steps.update({
      where: { id: step_id },
      data: {
        name,
        description,
        poynts,
        action_type,
        action_config,
        is_required,
        updated_at: new Date(),
      },
    });

    // Update campaign total_poynts
    await updateCampaignTotalPoynts(campaign_id);

    return NextResponse.json({ data: step });
  } catch (error) {
    console.error("Error updating campaign step:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update campaign step";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { campaign_id, step_id } = await params;

    // Verify step exists
    const existingStep = await postgresDb.campaign_steps.findFirst({
      where: {
        id: step_id,
        campaign_fk: campaign_id,
      },
    });

    if (!existingStep) {
      return NextResponse.json({ error: "Step not found" }, { status: 404 });
    }

    await postgresDb.campaign_steps.delete({
      where: { id: step_id },
    });

    // Reorder remaining steps
    const remainingSteps = await postgresDb.campaign_steps.findMany({
      where: { campaign_fk: campaign_id },
      orderBy: { step_order: "asc" },
    });

    for (let i = 0; i < remainingSteps.length; i++) {
      await postgresDb.campaign_steps.update({
        where: { id: remainingSteps[i].id },
        data: { step_order: i + 1 },
      });
    }

    // Update campaign total_poynts
    await updateCampaignTotalPoynts(campaign_id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign step:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete campaign step";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function updateCampaignTotalPoynts(campaignId: string) {
  const steps = await postgresDb.campaign_steps.findMany({
    where: { campaign_fk: campaignId },
  });

  const totalPoynts = steps.reduce((sum, step) => sum + step.poynts, 0);

  await postgresDb.campaigns.update({
    where: { id: campaignId },
    data: { total_poynts: totalPoynts, updated_at: new Date() },
  });
}
