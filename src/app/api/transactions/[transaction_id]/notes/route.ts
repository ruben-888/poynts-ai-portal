import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { transaction_id: string } }
) {
  try {
    const { transaction_id } = await params;
    const { notes } = await request.json();

    // Parse transaction ID
    const transactionId = parseInt(transaction_id);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { success: false, error: "Invalid transaction ID" },
        { status: 400 }
      );
    }

    // Update the notes in the database
    const updatedTransaction = await db.cp_transactionlog.update({
      where: { id: transactionId },
      data: { notes },
      select: { id: true, notes: true },
    });

    return NextResponse.json({
      success: true,
      data: updatedTransaction,
    });
  } catch (error) {
    console.error("Error updating transaction notes:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update notes",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}