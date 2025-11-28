import { auth } from "@clerk/nextjs/server";
import DashboardClient from "./dashboard-client";

export default async function DashboardServer() {
  const { has } = await auth();

  // Check if user has internal access using Clerk permissions
  const hasInternalAccess = has({ permission: "org:cpadmin:access" });

  return <DashboardClient hasInternalAccess={hasInternalAccess} />;
}
