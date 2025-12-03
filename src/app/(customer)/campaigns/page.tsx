import CampaignsClient from "./components/campaigns-client";

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
        <p className="text-muted-foreground">
          Manage your marketing campaigns and member activities
        </p>
      </div>
      <CampaignsClient />
    </div>
  );
}
