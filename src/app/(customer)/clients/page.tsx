import { Metadata } from "next";
import { ClientsClient } from "./components/clients-client";
import { auth } from "@clerk/nextjs/server";
import { NoAccess } from "@/components/status/no-access";

export const metadata: Metadata = {
  title: "Clients",
  description: "View and manage your clients and organizations.",
};

export default async function ClientsPage() {
  const { userId, has } = await auth();

  const canViewRoute = has({
    permission: "org:clients:view",
  });

  if (!userId || !canViewRoute) {
    return <NoAccess />;
  }

  return <ClientsClient />;
}
