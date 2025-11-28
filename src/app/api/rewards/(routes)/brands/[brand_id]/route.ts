import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/utils/db";
import { updateBrandSchema } from "./schema";
import { serializeBigInt } from "@/app/api/_utils/formatters";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ brand_id: string }> }
) {
  try {
    // Check permissions
    const { has } = await auth();

    if (!has({ permission: "org:rewards:manage" })) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Await params to get brand_id
    const { brand_id } = await params;
    const brandId = parseInt(brand_id);

    if (isNaN(brandId)) {
      return NextResponse.json(
        { error: "Invalid brand ID" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateBrandSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if brand exists
    const existingBrand = await db.redemption_giftcard_brands.findUnique({
      where: { brand_id: brandId },
    });

    if (!existingBrand) {
      return NextResponse.json(
        { error: "Brand not found" },
        { status: 404 }
      );
    }

    // Update brand with only provided fields
    const updatedBrand = await db.redemption_giftcard_brands.update({
      where: { brand_id: brandId },
      data: {
        ...(data.brandTag !== undefined && { brandTag: data.brandTag }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.terms !== undefined && { terms: data.terms }),
        ...(data.disclaimer !== undefined && { disclaimer: data.disclaimer }),
      },
    });

    // Serialize BigInt values before sending the response
    const serializedBrand = serializeBigInt(updatedBrand);

    return NextResponse.json(
      {
        success: true,
        message: "Brand updated successfully",
        data: serializedBrand,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating brand:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          details: "Brand update failed. Check server logs for details.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update brand", details: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
