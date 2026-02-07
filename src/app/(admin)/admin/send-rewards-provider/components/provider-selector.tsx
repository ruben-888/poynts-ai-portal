"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Image from "next/image";

interface RewardSourceBalance {
  available: number;
  currency: string;
  lastUpdated: string | null;
}

interface RewardSource {
  id: string;
  name: string;
  description?: string;
  status: string;
  balance?: RewardSourceBalance | null;
  balanceError?: string;
}

interface RewardSourcesResponse {
  data: RewardSource[];
  registered: string[];
}

interface ProviderSelectorProps {
  selectedProvider?: string;
  onSelect: (providerId: string) => void;
}

// Provider display configuration with logos and colors
const PROVIDER_CONFIG: Record<
  string,
  { displayName: string; color: string; logo: string }
> = {
  "source-amazon": {
    displayName: "Amazon",
    color: "bg-gradient-to-br from-orange-400 to-yellow-500",
    logo: "/img/source-logos/amazon.png",
  },
  "source-tango": {
    displayName: "Tango Card",
    color: "bg-gradient-to-br from-blue-500 to-indigo-600",
    logo: "/img/source-logos/tango.png",
  },
  "source-blackhawk": {
    displayName: "Blackhawk",
    color: "bg-gradient-to-br from-gray-700 to-gray-900",
    logo: "/img/source-logos/blackhawk.png",
  },
  "source-tremendous": {
    displayName: "Tremendous",
    color: "bg-gradient-to-br from-purple-500 to-pink-600",
    logo: "/img/source-logos/tremendous.png",
  },
};

export function ProviderSelector({
  selectedProvider,
  onSelect,
}: ProviderSelectorProps) {
  // Fetch reward sources with balances
  const { data, isLoading, isError } = useQuery({
    queryKey: ["reward-sources", "with-balances"],
    queryFn: async () => {
      const response = await axios.get<RewardSourcesResponse>(
        "/api/v1/reward-sources",
        {
          params: {
            include_balances: true,
          },
        }
      );
      return response.data;
    },
  });

  const sources = data?.data || [];
  const registered = data?.registered || [];

  // Filter to only show the 4 main providers
  const mainProviders = sources.filter((source) =>
    ["source-amazon", "source-tango", "source-blackhawk", "source-tremendous"].includes(
      source.id
    )
  );

  // Sort: Amazon, Tremendous, Tango, Blackhawk
  const sortedProviders = mainProviders.sort((a, b) => {
    const order = ["source-amazon", "source-tremendous", "source-tango", "source-blackhawk"];
    return order.indexOf(a.id) - order.indexOf(b.id);
  });

  // Disabled providers (not yet available)
  const DISABLED_PROVIDERS = new Set(["source-tango", "source-blackhawk"]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 text-destructive">
        Failed to load reward providers
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {sortedProviders.map((source) => {
        const config = PROVIDER_CONFIG[source.id];
        const isSelected = selectedProvider === source.id;
        const isRegistered = registered.includes(source.id.replace("source-", ""));
        const balance = source.balance?.available ?? 0;
        const hasBalanceError = !!source.balanceError;
        const isBlackhawk = source.id === "source-blackhawk";
        const isDisabled = DISABLED_PROVIDERS.has(source.id);

        return (
          <Card
            key={source.id}
            className={cn(
              "relative overflow-hidden transition-all duration-200",
              isDisabled
                ? "opacity-50 cursor-not-allowed grayscale"
                : "cursor-pointer hover:shadow-lg",
              isSelected && !isDisabled && "ring-2 ring-blue-500 shadow-lg"
            )}
            onClick={() => !isDisabled && onSelect(source.id)}
          >
            {/* Disabled overlay label */}
            {isDisabled && (
              <div className="absolute top-3 right-3 z-10 inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
                Coming Soon
              </div>
            )}

            {/* Selected Indicator */}
            {isSelected && !isDisabled && (
              <div className="absolute top-3 right-3 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}

            {/* Provider Logo Header */}
            <div className="h-24 relative overflow-hidden">
              <Image
                src={config.logo}
                alt={`${config.displayName} logo`}
                fill
                className="object-cover"
                unoptimized
                key={config.logo}
              />
            </div>

            {/* Provider Details */}
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-1">{config.displayName}</h3>
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                {source.description}
              </p>

              {/* Balance Display */}
              <div className="mb-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Available Balance
                </div>
                {isDisabled || isBlackhawk ? (
                  <div className="text-2xl font-bold text-muted-foreground">
                    $???
                  </div>
                ) : hasBalanceError ? (
                  <div className="text-sm text-amber-600 font-medium">
                    {source.balanceError}
                  </div>
                ) : (
                  <div className="text-2xl font-bold">
                    ${balance.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <div
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    isDisabled
                      ? "bg-gray-100 text-gray-500"
                      : isRegistered
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                  )}
                >
                  {isDisabled ? "Unavailable" : isRegistered ? "Connected" : "Not Connected"}
                </div>
                {!isDisabled && (isBlackhawk ? (
                  <div className="text-xs text-muted-foreground font-medium">
                    Unknown
                  </div>
                ) : !hasBalanceError && balance === 0 && (
                  <div className="text-xs text-amber-600 font-medium">
                    No funds
                  </div>
                ))}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
