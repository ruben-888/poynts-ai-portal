import { NextResponse } from "next/server";
import { postgresDb } from "@/utils/postgres-db";

interface RouteParams {
  params: Promise<{ program_id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { program_id } = await params;

    const program = await postgresDb.programs.findUnique({
      where: {
        id: program_id,
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
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: program });
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { program_id } = await params;

    // Verify program exists
    const existingProgram = await postgresDb.programs.findUnique({
      where: { id: program_id },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    const body = await request.json();

    const {
      name,
      slug,
      description,
      status,
      start_date,
      end_date,
      eligibility_rules,
      earning_modifiers,
      poynt_caps,
      metadata,
    } = body;

    const program = await postgresDb.programs.update({
      where: { id: program_id },
      data: {
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
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ data: program });
  } catch (error) {
    console.error("Error updating program:", error);
    const message = error instanceof Error ? error.message : "Failed to update program";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { program_id } = await params;

    // Verify program exists
    const existingProgram = await postgresDb.programs.findUnique({
      where: { id: program_id },
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    await postgresDb.programs.delete({
      where: { id: program_id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting program:", error);
    const message = error instanceof Error ? error.message : "Failed to delete program";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
