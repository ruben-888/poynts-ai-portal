import { Metadata } from "next";
import { CatalogsClient } from "./components/catalogs-client";
import { auth } from "@clerk/nextjs/server";
import { NoAccess } from "@/components/status/no-access";

export const metadata: Metadata = {
  title: "Catalogs",
  description: "View and manage your catalogs and products.",
};

export default async function CatalogsPage() {
  const { userId, has } = await auth();

  const canViewRoute = has({
    permission: "org:catalogs:view",
  });

  if (!userId || !canViewRoute) {
    return <NoAccess />;
  }

  return <CatalogsClient />;
}
