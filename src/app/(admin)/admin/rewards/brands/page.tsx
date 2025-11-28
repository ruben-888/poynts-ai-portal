import BrandsClient from "./components/brands-client";

export const metadata = {
  title: "Gift Card Brands | Admin Dashboard",
  description: "View and manage available gift card brands.",
};

export default function BrandsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Gift Card Brands</h1>
      </div>
      <BrandsClient />
    </div>
  );
}