import { ClientBanksList } from "./components/client-banks-list";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Banks | Financial Management",
  description: "View and manage client banks in the financial system",
};

/**
 * Page component for client banks management
 */
export default function ClientBanksPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ledger Entries</h1>
      </div>
      <ClientBanksList />
    </div>
  );
}
