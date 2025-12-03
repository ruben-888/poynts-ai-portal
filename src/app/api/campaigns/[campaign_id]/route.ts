import { NextResponse } from "next/server";
import { postgresDb } from "@/utils/postgres-db";

interface RouteParams {
  params: Promise<{ campaign_id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { campaign_id } = await params;

    const campaign = await postgresDb.campaigns.findUnique({
      where: {
        id: campaign_id,
      },
      include: {
        campaign_steps: {
          orderBy: {
            step_order: "asc",
          },
        },
        organizations: {
          select: {
            id: true,
            name: true,
          },
        },
        programs: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: campaign,
    });
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaign" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { campaign_id } = await params;

    // Verify campaign exists
    const existingCampaign = await postgresDb.campaigns.findUnique({
      where: { id: campaign_id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      name,
      slug,
      description,
      type,
      status,
      total_poynts,
      image_url,
      start_date,
      end_date,
      max_participants,
      metadata,
      program_fk,
      requires_verification,
    } = body;

    const campaign = await postgresDb.campaigns.update({
      where: { id: campaign_id },
      data: {
        name,
        slug,
        description,
        type,
        status,
        total_poynts,
        image_url,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        max_participants,
        metadata,
        program_fk,
        requires_verification,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ data: campaign });
  } catch (error) {
    console.error("Error updating campaign:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update campaign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { campaign_id } = await params;

    // Verify campaign exists
    const existingCampaign = await postgresDb.campaigns.findUnique({
      where: { id: campaign_id },
    });

    if (!existingCampaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    await postgresDb.campaigns.delete({
      where: { id: campaign_id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting campaign:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete campaign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
