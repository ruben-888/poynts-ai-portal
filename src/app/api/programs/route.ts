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

    const programs = await postgresDb.programs.findMany({
      where: {
        organization_fk: organizationId,
      },
      include: {
        organizations: {
          select: {
            id: true,
            name: true,
          },
        },
        tier_definitions: true,
        campaigns: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({
      data: programs,
      meta: {
        total: programs.length,
      },
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
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
      status = "active",
      start_date,
      end_date,
      eligibility_rules,
      earning_modifiers,
      poynt_caps,
      metadata,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "name and slug are required" },
        { status: 400 }
      );
    }

    const program = await postgresDb.programs.create({
      data: {
        id: randomUUID(),
        organization_fk: organizationId,
        name,
        slug,
        description,
        status,
        start_date: start_date ? new Date(start_date) : null,
        end_date: end_date ? new Date(end_date) : null,
        eligibility_rules,
        earning_modifiers,
        poynt_caps,
        metadata,
      },
    });

    return NextResponse.json({ data: program }, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create program";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
