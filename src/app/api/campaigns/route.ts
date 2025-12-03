import { NextResponse } from "next/server";
import { postgresDb } from "@/utils/postgres-db";
import { randomUUID } from "crypto";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organization_id");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organization_id query parameter is required" },
        { status: 400 }
      );
    }

    const campaigns = await postgresDb.campaigns.findMany({
      where: {
        organization_fk: organizationId,
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
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({
      data: campaigns,
      meta: {
        total: campaigns.length,
      },
    });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get("organization_id");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organization_id query parameter is required" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      name,
      slug,
      description,
      type,
      status = "draft",
      total_poynts = 0,
      image_url,
      start_date,
      end_date,
      max_participants,
      metadata,
      program_fk,
      requires_verification = false,
    } = body;

    if (!name || !slug || !type) {
      return NextResponse.json(
        { error: "name, slug, and type are required" },
        { status: 400 }
      );
    }

    const campaign = await postgresDb.campaigns.create({
      data: {
        id: randomUUID(),
        organization_fk: organizationId,
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
      },
    });

    return NextResponse.json({ data: campaign }, { status: 201 });
  } catch (error) {
    console.error("Error creating campaign:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create campaign";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
