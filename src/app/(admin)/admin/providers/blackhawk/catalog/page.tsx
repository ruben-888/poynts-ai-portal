import BlackhawkCatalogClient from "./components/blackhawk-catalog-client";

export const metadata = {
  title: "Blackhawk Catalog | Admin Dashboard",
  description:
    "View and manage the catalog of available gift cards from Blackhawk.",
};

export default function BlackhawkCatalogPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Blackhawk Catalog</h1>
      </div>
      <BlackhawkCatalogClient />
    </div>
  );
}
