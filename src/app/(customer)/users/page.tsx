import { Suspense } from "react";
import { UsersClient } from "./components/users-client";
import { auth } from "@clerk/nextjs/server";
import { NoAccess } from "@/components/status/no-access";
import {
  initializeStatsigServer,
  createStatsigUser,
} from "@/lib/statsig-server";

export default async function UsersPage() {
  const { userId, has } = await auth();

  const canViewUsers = has({
    permission: "org:users:view",
  });

  if (!userId || !canViewUsers) {
    return <NoAccess />;
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-10">Loading users...</div>
      }
    >
      <UsersClient />
    </Suspense>
  );
}
