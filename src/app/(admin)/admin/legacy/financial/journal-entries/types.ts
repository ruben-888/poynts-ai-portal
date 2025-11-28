export interface JournalEntry {
  id: number;
  entry_date: string;
  entry_type: string;
  amount: number | null;
  entry_notes: string | null;
  from_ledger: {
    id: number;
    amount: number;
    transaction_date: string;
    billing_reference: string | null;
    notes: string | null;
    provider_reference: string | null;
    reconciled: number | null;
    bank: {
      id: number;
      name: string | null;
    } | null;
  } | null;
  to_ledger: {
    id: number;
    amount: number;
    transaction_date: string;
    billing_reference: string | null;
    notes: string | null;
    provider_reference: string | null;
    reconciled: number | null;
    bank: {
      id: number;
      name: string | null;
    } | null;
  } | null;
}

export interface FilterOption {
  value: string;
  label: string;
}
