import LedgersClient from "./components/ledgers-client";

export const metadata = {
  title: "Ledgers | CarePoynt Admin",
  description: "View and manage ledger entries in the CarePoynt system",
};

export default function LedgersPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Ledger Entries</h1>
      </div>
      <LedgersClient />
    </div>
  );
}
