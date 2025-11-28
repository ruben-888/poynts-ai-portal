import TangoCatalogClient from "./components/tango-catalog-client";

export const metadata = {
  title: "Tango Catalog | Admin Dashboard",
  description:
    "View and manage the catalog of available gift cards from Tango.",
};

export default function TangoCatalogPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Tango Catalog</h1>
      </div>
      <TangoCatalogClient />
    </div>
  );
}