import { Metadata } from "next"
import { OverviewClient } from "./components/overview-client"

export const metadata: Metadata = {
  title: "Catalog Overview",
  description: "Overview of all catalogs and their rewards.",
}

export default function CatalogOverviewPage() {
  return <OverviewClient />
}
