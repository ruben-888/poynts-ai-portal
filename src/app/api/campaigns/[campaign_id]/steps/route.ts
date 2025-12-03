import { NextResponse } from "next/server";
import { postgresDb } from "@/utils/postgres-db";
import { randomUUID } from "crypto";

interface RouteParams {
  params: Promise<{ campaign_id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { campaign_id } = await params;

    const steps = await postgresDb.campaign_steps.findMany({
      where: {
        campaign_fk: campaign_id,
      },
      orderBy: {
        step_order: "asc",
      },
    });

    return NextResponse.json({ data: steps });
  } catch (error) {
    console.error("Error fetching campaign steps:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign steps" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
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

    const {
      name,
      description,
      poynts = 0,
      action_type,
      action_config,
      is_required = true,
    } = body;

    if (!name || !action_type) {
      return NextResponse.json(
        { error: "name and action_type are required" },
        { status: 400 }
      );
    }

    // Get the next step order
    const lastStep = await postgresDb.campaign_steps.findFirst({
      where: { campaign_fk: campaign_id },
      orderBy: { step_order: "desc" },
    });

    const nextOrder = lastStep ? lastStep.step_order + 1 : 1;

    const step = await postgresDb.campaign_steps.create({
      data: {
        id: randomUUID(),
        campaign_fk: campaign_id,
        name,
        description,
        step_order: nextOrder,
        poynts,
        action_type,
        action_config,
        is_required,
      },
    });

    // Update campaign total_poynts
    await updateCampaignTotalPoynts(campaign_id);

    return NextResponse.json({ data: step }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign step:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create campaign step";
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
