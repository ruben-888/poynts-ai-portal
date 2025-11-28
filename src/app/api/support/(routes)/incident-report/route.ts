import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { extractUserContext, UserContext } from "../../../_shared/types";
import { incidentReportCreateSchema, mapIncidentReportFromCreateRequest, mapCreateResponseFromIncidentReport } from "./schema";
import { createIncidentReport } from "../../services/datadog-incident";

export async function POST(request: NextRequest) {
  try {
    // Check authorization
    const { has, userId, sessionClaims } = await auth();
    if (!has({ permission: "org:support:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Extract user context from session claims.
    const userContext = extractUserContext(userId, sessionClaims);

    // Validate request data.
    const data = await request.json();
    const validationResult = incidentReportCreateSchema.safeParse(data);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation Error",
          validation_errors: validationResult.error.flatten().fieldErrors
        },
        { status: 422 }
      );
    }

    // Create incident.
    const incidentReport = mapIncidentReportFromCreateRequest(validationResult.data, userContext as UserContext)
    if (!await createIncidentReport(incidentReport)) {
      throw new Error("Failed to create incident report.");
    }
    return NextResponse.json(mapCreateResponseFromIncidentReport(incidentReport));


  } catch (error: any) {
    // TODO logging
    console.error("Error creating incident report:", error);
    return NextResponse.json(
      { error: "Failed to create incident report." },
      { status: 500 }
    );
  }
}
