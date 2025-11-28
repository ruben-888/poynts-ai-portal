import { NextRequest, NextResponse } from "next/server";
import { db } from "@/utils/db";

/**
 * Type for Provider data needed in dropdown
 */
type ProviderForDropdown = {
  id: number;
  name: string | null;
  code: string | null;
};

/**
 * Type for raw client bank data from database
 */
type RawClientBank = {
  id: number;
  name: string | null;
  respective_provider_id: number | null;
  created_at: Date;
  updated_at: Date | null;
};

/**
 * Type for raw provider data from database
 */
type RawProvider = {
  id: number;
  name: string | null;
  code: string | null;
};

/**
 * Type for Client Bank data with minimal fields for dropdown usage
 * Now includes provider information and balance
 */
type ClientBankForDropdown = {
  id: number;
  name: string | null;
  provider: ProviderForDropdown | null;
  balance: number;
  created_at: Date;
  updated_at: Date | null;
};

/**
 * GET handler for client banks
 *
 * Returns a list of client banks with minimal data for dropdown menus
 * Includes provider info when available, excludes client_id
 * Now includes balance amount calculated from associated ledger records
 *
 * @param request - The incoming request object
 * @returns NextResponse with client banks data
 */
export async function GET(request: NextRequest) {
  try {
    // Query database for client banks with provider info
    const clientBanks = await db.cp_client_bank.findMany({
      select: {
        id: true,
        name: true,
        created_at: true,
        updated_at: true,
        respective_provider_id: true,
        // Not including the ledgers relation
      },
      orderBy: {
        name: "asc", // Sort alphabetically by name for dropdown usability
      },
    });

    // Get all providers to use for lookup
    const providers = await db.providers.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    // Create a map of providers by ID for easy lookup
    const providerMap = new Map<number, RawProvider>();
    providers.forEach((provider: RawProvider) => {
      providerMap.set(provider.id, provider);
    });

    // Get the sum of ledger amounts for each client bank
    const bankBalances = await db.$queryRaw<
      Array<{ client_bank_id: number; balance: any }>
    >`
      SELECT client_bank_id, SUM(amount) as balance
      FROM poynts_bank_ledger
      GROUP BY client_bank_id
    `;

    // Create a map of bank balances by client bank ID
    const balanceMap = new Map<number, number>();
    bankBalances.forEach((item) => {
      balanceMap.set(item.client_bank_id, Number(item.balance));
    });

    // Transform the client banks data to include provider info and balance
    const clientBanksWithProviderAndBalance = clientBanks.map(
      (bank: RawClientBank) => {
        const provider = bank.respective_provider_id
          ? providerMap.get(bank.respective_provider_id)
          : null;
        const balance = balanceMap.get(bank.id) || 0;

        return {
          id: bank.id,
          name: bank.name,
          provider: provider
            ? {
                id: provider.id,
                name: provider.name,
                code: provider.code,
              }
            : null,
          balance,
          created_at: bank.created_at,
          updated_at: bank.updated_at,
        };
      },
    );

    // Return the client banks data with provider info and balance
    return NextResponse.json(clientBanksWithProviderAndBalance, {
      status: 200,
    });
  } catch (error) {
    console.error("Error fetching client banks:", error);
    return NextResponse.json(
      { error: "Failed to fetch client banks" },
      { status: 500 },
    );
  }
}
