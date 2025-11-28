import CombinedCatalogClient from "./components/combined-client";

export const metadata = {
  title: "Combined Catalog | Admin Dashboard",
  description:
    "View and manage the unified catalog of gift cards from all providers.",
};

export default function CombinedCatalogPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Combined Provider Catalog</h1>
        <p className="text-muted-foreground mt-1">
          Unified view of gift cards from Tango and Blackhawk providers
        </p>
      </div>
      <CombinedCatalogClient />
    </div>
  );
}