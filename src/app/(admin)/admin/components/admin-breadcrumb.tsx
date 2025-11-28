"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientBank } from "../legacy/financial/journal-entries/hooks/use-client-banks";

// Map of route segments to display names
const routeMap: { [key: string]: string } = {
  admin: "Admin",
  dashboard: "Dashboard",
  orders: "Orders",
  rewards: "Rewards",
  providers: "Providers",
  settings: "Settings",
  "gift-cards": "Gift Cards",
  offers: "Offers",
  inventory: "Inventory",
  failed: "Failed Orders",
  status: "Status",
  performance: "Performance",
  security: "Security",
  notifications: "Notifications",
  legacy: "Legacy",
  financial: "Financial",
  ledgers: "Ledgers",
  "client-banks": "Client Banks",
  "journal-entries": "Journal Entries",
};

// Provider data from the providers page
const providers = [
  {
    id: "tango-card",
    name: "TangoCard",
  },
  {
    id: "amazon",
    name: "Amazon",
  },
  {
    id: "blackhawk",
    name: "Blackhawk Network",
  },
  {
    id: "tremendous",
    name: "Tremendous",
  },
];

export function AdminBreadcrumb() {
  const pathname = usePathname();
  const router = useRouter();

  // Remove leading slash and split into segments
  const segments = pathname.split("/").filter(Boolean);

  // Check if we're on a provider page
  const isProviderPage = segments.includes("providers") && segments.length > 2;
  const currentProviderId = isProviderPage
    ? segments[segments.length - 1]
    : null;
  const currentProvider = providers.find((p) => p.id === currentProviderId);

  // Check if we're on a bank ledger page
  const isBankLedgerPage = segments.includes("ledgers") && segments.length > 4;
  const bankId = isBankLedgerPage ? segments[segments.length - 1] : null;

  // Fetch bank details if we're on a bank ledger page
  const { data: bankDetails } = useClientBank(bankId || "");

  const handleProviderChange = (providerId: string) => {
    const basePath = segments.slice(0, -1).join("/");
    router.push(`/${basePath}/${providerId}`);
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {segments.map((segment, index) => {
          // Get the display name from our map, fallback to capitalized segment
          let displayName =
            routeMap[segment] ||
            segment.charAt(0).toUpperCase() + segment.slice(1);

          // Build the href for this segment
          const href = `/${segments.slice(0, index + 1).join("/")}`;

          // If this is the last segment and we're on a provider page, show the select
          const isLastSegment = index === segments.length - 1;
          const showProviderSelect = isLastSegment && isProviderPage;

          // If this is a bank ID segment, use the bank name
          if (isLastSegment && isBankLedgerPage && bankDetails) {
            displayName = bankDetails.name || displayName;
          }

          // If this is a provider ID segment, use the provider name
          if (showProviderSelect && currentProvider) {
            displayName = currentProvider.name;
          }

          return (
            <React.Fragment key={segment}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem className="hidden md:block">
                {showProviderSelect ? (
                  <Select
                    value={currentProviderId || ""}
                    onValueChange={handleProviderChange}
                  >
                    <SelectTrigger className="h-auto p-0 border-0 bg-transparent font-medium hover:underline">
                      <SelectValue>{displayName}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          {provider.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : isLastSegment ? (
                  <BreadcrumbPage>{displayName}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={href}>{displayName}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
