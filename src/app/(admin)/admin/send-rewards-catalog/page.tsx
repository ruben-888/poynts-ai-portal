import SendRewardsCatalogClient from "./components/send-rewards-catalog-client";

export default function SendRewardsCatalogPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Send Rewards from Catalog</h1>
        <p className="text-muted-foreground mt-2">
          Send rewards from your organization&apos;s catalog inventory
        </p>
      </div>
      <SendRewardsCatalogClient />
    </div>
  );
}
