import { Metadata } from "next";
import { ActivityClient } from "./components/activity-client";
import { auth } from "@clerk/nextjs/server";
import { NoAccess } from "@/components/status/no-access";

export const metadata: Metadata = {
  title: "System Activity",
  description: "View system activity and logs.",
};

export default async function SystemActivityPage() {
  const { userId, has } = await auth();

  const canViewRoute = has({
    permission: "org:system_activity:view",
  });

  if (!userId || !canViewRoute) {
    return <NoAccess />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">System Activity</h2>
      </div>
      <ActivityClient />
    </div>
  );
}
