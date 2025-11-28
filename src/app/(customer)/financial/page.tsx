import { FinancialDashboard } from "./components/financial-dashboard";

export const metadata = {
  title: "Financial",
  description: "Financial metrics and reporting dashboard",
};

export default function FinancialPage() {
  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Financial</h2>
      </div>
      <FinancialDashboard />
    </div>
  );
}
