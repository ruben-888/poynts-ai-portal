import TremendousCatalogClient from "./components/tremendous-catalog-client";

export const metadata = {
  title: "Tremendous Catalog | Admin Dashboard",
  description:
    "View and manage the catalog of available gift cards from Tremendous.",
};

export default function TremendousCatalogPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tremendous Catalog</h1>
      </div>
      <TremendousCatalogClient />
    </div>
  );
}