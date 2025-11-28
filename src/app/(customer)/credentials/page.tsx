import CredentialsClient from "./components/credentials-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "API Credentials | Care Poynt",
  description: "Manage your API credentials",
};

export default async function CredentialsPage() {
  // Server-side operations would go here, like fetching initial data if needed

  return <CredentialsClient />;
}
