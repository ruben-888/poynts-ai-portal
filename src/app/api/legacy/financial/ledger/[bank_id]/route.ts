import { db } from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import { Decimal } from "@prisma/client/runtime/library";

interface BankLedgerEntry {
  id: number;
  transaction_date: Date;
  amount: Decimal;
  notes: string;
  billing_reference: string;
  bank: {
    id: number;
    name: string | null;
  };
}

/**
 * GET handler for fetching ledger entries filtered by bank ID
 *
 * @param request - The incoming request
 * @returns JSON response with the filtered ledger entries
 */
export async function GET(
  request: NextRequest
) {
  try {
    // Extract the bank_id from the URL path
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    const bankIdStr = pathParts[pathParts.length - 1];
    const bankId = parseInt(bankIdStr);
    
    // Check if bankId is a valid number
    if (isNaN(bankId)) {
      return NextResponse.json(
        { error: "Invalid bank ID format" },
        { status: 400 },
      );
    }

    // Get query parameters for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "1000");

    // Fetch all ledger entries for the specific bank
    const bankLedgerEntries = await db.poynts_bank_ledger.findMany({
      where: {
        bank: {
          id: bankId,
        },
      },
      select: {
        id: true,
        transaction_date: true,
        amount: true,
        notes: true,
        billing_reference: true,
        bank: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        transaction_date: "asc", // First get in ascending order to calculate running balance
      },
      take: limit, // Apply limit to database query
    });

    // If no entries found, return empty array
    if (bankLedgerEntries.length === 0) {
      return NextResponse.json({
        data: [],
      });
    }

    // Calculate running balance for each entry
    let runningBalance = 0;
    const entriesWithBalance = bankLedgerEntries.map((entry) => {
      runningBalance += Number(entry.amount);
      return {
        ...entry,
        amount: Number(entry.amount),
        running_balance: runningBalance,
        bank: {
          ...entry.bank,
          code: entry.bank.name?.includes("Source A")
            ? "A"
            : entry.bank.name?.includes("Source B")
              ? "B"
              : entry.bank.name?.includes("Source C")
                ? "C"
                : "X",
        },
      };
    });

    // Reverse the order to get newest first
    const sortedEntries = entriesWithBalance.reverse();

    // Return all entries without pagination metadata
    return NextResponse.json({
      data: sortedEntries,
    });
  } catch (error) {
    console.error("Error fetching ledger entries by bank ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger entries" },
      { status: 500 },
    );
  }
}
