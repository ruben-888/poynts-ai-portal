import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";

// Define a type for the journal entry with related data
type JournalEntryWithRelations = {
  id: number;
  entry_date: Date | null;
  entry_type: string | null;
  amount: any; // Decimal in Prisma
  entry_notes: string | null;
  from_entry: number | null;
  to_entry: number | null;
  fromLedger: {
    id: number;
    notes: string;
    amount: any; // Decimal in Prisma
    transaction_date: Date;
    client_bank_id: number;
    billing_reference: string;
    provider_reference: string | null;
    reconciled: number | null;
    bank: {
      id: number;
      name: string | null;
    } | null;
  } | null;
  toLedger: {
    id: number;
    notes: string;
    amount: any; // Decimal in Prisma
    transaction_date: Date;
    client_bank_id: number;
    billing_reference: string;
    provider_reference: string | null;
    reconciled: number | null;
    bank: {
      id: number;
      name: string | null;
    } | null;
  } | null;
};

/**
 * GET handler for journal entries
 *
 * @param request - The incoming request object
 * @returns NextResponse with journal entries data sorted by most recent first
 */
export async function GET(request: NextRequest) {
  try {
    // Fetch journal entries with related data using Prisma relations
    const journalEntries = await db.poynts_bank_journal.findMany({
      select: {
        id: true,
        entry_date: true,
        entry_type: true,
        amount: true,
        entry_notes: true,
        from_entry: true,
        to_entry: true,
        // Include related ledger data using the relations
        fromLedger: {
          select: {
            id: true,
            notes: true,
            amount: true,
            transaction_date: true,
            client_bank_id: true,
            billing_reference: true,
            provider_reference: true,
            reconciled: true,
            bank: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        toLedger: {
          select: {
            id: true,
            notes: true,
            amount: true,
            transaction_date: true,
            client_bank_id: true,
            billing_reference: true,
            provider_reference: true,
            reconciled: true,
            bank: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        entry_date: "desc", // Most recent first
      },
    });

    // Process the entries with the related data already included
    const formattedEntries = journalEntries.map(
      (entry: JournalEntryWithRelations) => {
        // Convert Decimal/string amounts to numbers
        const entryAmount = entry.amount
          ? parseFloat(entry.amount.toString())
          : null;

        // Format the entry with all related data in nested objects
        return {
          id: entry.id,
          entry_date: entry.entry_date,
          entry_type: entry.entry_type,
          amount: entryAmount,
          entry_notes: entry.entry_notes,
          from_ledger: entry.fromLedger
            ? {
                id: entry.fromLedger.id,
                amount: parseFloat(entry.fromLedger.amount.toString()),
                transaction_date: entry.fromLedger.transaction_date,
                billing_reference: entry.fromLedger.billing_reference,
                notes: entry.fromLedger.notes,
                provider_reference: entry.fromLedger.provider_reference,
                reconciled: entry.fromLedger.reconciled,
                bank: entry.fromLedger.bank
                  ? {
                      id: entry.fromLedger.bank.id,
                      name: entry.fromLedger.bank.name,
                    }
                  : null,
              }
            : null,
          to_ledger: entry.toLedger
            ? {
                id: entry.toLedger.id,
                amount: parseFloat(entry.toLedger.amount.toString()),
                transaction_date: entry.toLedger.transaction_date,
                billing_reference: entry.toLedger.billing_reference,
                notes: entry.toLedger.notes,
                provider_reference: entry.toLedger.provider_reference,
                reconciled: entry.toLedger.reconciled,
                bank: entry.toLedger.bank
                  ? {
                      id: entry.toLedger.bank.id,
                      name: entry.toLedger.bank.name,
                    }
                  : null,
              }
            : null,
        };
      },
    );

    return NextResponse.json({
      data: formattedEntries,
      success: true,
      count: formattedEntries.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in journal entries GET route:", error);
    return NextResponse.json(
      { error: "Failed to process request", success: false },
      { status: 500 },
    );
  }
}
