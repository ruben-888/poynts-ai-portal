import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { sourcesRequestSchema } from "./schema";
import { getRewardSources } from "@/app/api/rewards/services/get-reward-sources";

export async function POST(req: Request) {
  try {
    const { has } = await auth();

    if (!has({ permission: "org:rewards:view" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = sourcesRequestSchema.parse(body);
    const { cpids } = validatedData;

    const sources = await getRewardSources(cpids);

    return NextResponse.json({ sources });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 },
      );
    }

    console.error("Error fetching reward sources:", error);
    return NextResponse.json(
      { error: "Failed to fetch reward sources" },
      { status: 500 },
    );
  }
}
