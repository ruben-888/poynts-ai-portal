import { BankLedger } from "./components/bank-ledger";

export default async function BankLedgerPage(props: {
  params: Promise<{ bank_id: string }>;
}) {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Bank Ledger</h1>
      </div>
      <BankLedger />
    </div>
  );
}
