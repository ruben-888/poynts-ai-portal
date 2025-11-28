import { Metadata } from "next";
import { DateRange } from "react-day-picker";
import { auth } from "@clerk/nextjs/server";
import { NoAccess } from "@/components/status/no-access";
import { IncidentReportForm } from "../components/incident-report";

export const metadata: Metadata = {
  title: "Incident Report",
  description: "Report an incident to our support team.",
};

export default async function IncidentReportPage() {
  const { has } = await auth();
  if (!has({ permission: "org:support:manage" })) {
    return <NoAccess />;
  }

  return <IncidentReportForm />;
}
