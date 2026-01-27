import SendRewardsClient from "./components/send-rewards-client";

export default function SendRewardsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Send Rewards</h1>
        <p className="text-muted-foreground mt-2">
          Create and send rewards to recipients
        </p>
      </div>
      <SendRewardsClient />
    </div>
  );
}
