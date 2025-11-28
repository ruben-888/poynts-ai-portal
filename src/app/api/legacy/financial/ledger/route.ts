import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * GET handler for bank ledger data with bank names
 *
 * Implements the Prisma equivalent of:
 * SELECT pbl.transaction_date, pbl.amount, pbl.notes, pbl.billing_reference, cb.name AS bank_name
 * FROM poynts_bank_ledger pbl LEFT JOIN cp_client_bank cb on cb.id = pbl.client_bank_id
 */

// Define interface for bank ledger entry
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

export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering and pagination
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "2000");
    const skip = (page - 1) * limit;

    // Execute the query with Prisma
    const bankLedgerEntries = await db.poynts_bank_ledger.findMany({
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
      skip,
      take: limit,
      orderBy: {
        transaction_date: "desc",
      },
    });

    // Get total count for pagination
    const totalCount = await db.poynts_bank_ledger.count();

    // Return the data with pagination info
    return NextResponse.json({
      data: bankLedgerEntries.map((entry: BankLedgerEntry) => ({
        ...entry,
        amount: Number(entry.amount),
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
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching bank ledger data:", error);
    return NextResponse.json(
      { error: "Failed to fetch bank ledger data" },
      { status: 500 },
    );
  }
}

/**
 * POST handler for bank ledger data with advanced filtering
 *
 * Allows more complex filtering options through a request body
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract pagination parameters
    const { page = 1, limit = 10 } = body;
    const skip = (page - 1) * limit;

    // Extract filter parameters
    const { startDate, endDate, minAmount, maxAmount, bankId, searchTerm } =
      body;

    // Build where conditions
    const where: any = {};

    // Date range filter
    if (startDate || endDate) {
      where.transaction_date = {};
      if (startDate) {
        where.transaction_date.gte = new Date(startDate);
      }
      if (endDate) {
        where.transaction_date.lte = new Date(endDate);
      }
    }

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      where.amount = {};
      if (minAmount !== undefined) {
        where.amount.gte = minAmount;
      }
      if (maxAmount !== undefined) {
        where.amount.lte = maxAmount;
      }
    }

    // Bank ID filter
    if (bankId) {
      where.client_bank_id = bankId;
    }

    // Search term for notes or billing reference
    if (searchTerm) {
      where.OR = [
        { notes: { contains: searchTerm } },
        { billing_reference: { contains: searchTerm } },
      ];
    }

    // Execute the query with filters
    const bankLedgerEntries = await db.poynts_bank_ledger.findMany({
      where,
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
      skip,
      take: limit,
      orderBy: body.orderBy || { transaction_date: "desc" },
    });

    // Get filtered count for pagination
    const totalCount = await db.poynts_bank_ledger.count({ where });

    // Return the filtered data with pagination info
    return NextResponse.json({
      data: bankLedgerEntries.map((entry: BankLedgerEntry) => ({
        ...entry,
        amount: Number(entry.amount),
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
      })),
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error filtering bank ledger data:", error);
    return NextResponse.json(
      { error: "Failed to filter bank ledger data" },
      { status: 500 },
    );
  }
}
