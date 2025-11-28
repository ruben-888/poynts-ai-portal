import { Metadata } from "next";
import { AdminDashboardClient } from "./components/admin-dash-client";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description:
    "Main administration dashboard for gift card and rewards management",
};

export default async function DashboardPage() {
  return <AdminDashboardClient />;
}
