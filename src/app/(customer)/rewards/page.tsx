import { Metadata } from "next";
import { RewardsClient } from "./components/rewards-client";
import { NoAccess } from "@/components/status/no-access";
import { auth } from "@clerk/nextjs/server";

export const metadata: Metadata = {
  title: "Rewards",
  description: "View and manage your rewards.",
};

export default async function RewardsPage() {
  const { userId, has } = await auth();

  const canViewRoute = has({
    permission: "org:rewards:view",
  });

  const canManageRewards = has({
    permission: "org:rewards:manage",
  });

  if (!userId || !canViewRoute) {
    return <NoAccess />;
  }

  return <RewardsClient canManageRewards={canManageRewards} />;
}
