"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import JsonViewer from "@/components/json-viewer";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  isValidProviderType,
  ProviderType,
} from "@/interfaces/providers/registry";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

// Define available endpoints for each provider
const PROVIDER_ENDPOINTS = {
  tango: ["List Reward Catalogs", "Get Account Balance"],
  blackhawk: ["List Reward Catalogs", "Get Account Balance"],
} as const;

type ApiEndpoint =
  (typeof PROVIDER_ENDPOINTS)[keyof typeof PROVIDER_ENDPOINTS][number];

interface ApiTesterProps {
  providerId: string;
}

export default function ApiTester({ providerId }: ApiTesterProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<ApiEndpoint | null>(
    null,
  );
  const [response, setResponse] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Normalize the provider ID to match our registry
  const normalizedProviderId = providerId.replace("-card", "");

  const handleEndpointClick = async (endpoint: ApiEndpoint) => {
    if (!isValidProviderType(normalizedProviderId)) {
      setError(`Invalid provider: ${providerId}`);
      return;
    }

    setSelectedEndpoint(endpoint);
    setLoading(true);
    setError(null);

    try {
      let result;
      const apiUrl = `/api/providers/${normalizedProviderId}`;

      console.log(`Making API request to ${apiUrl} for endpoint: ${endpoint}`);

      switch (endpoint) {
        case "Get Account Balance":
          // console.log('Fetching balance...')
          const balanceRes = await fetch(`${apiUrl}/balance`);
          result = await balanceRes.json();
          // console.log('Balance response status:', balanceRes.status)
          // console.log('Balance response:', result)
          if (!balanceRes.ok)
            throw new Error(result.error || "Failed to fetch balance");
          break;

        case "List Reward Catalogs":
          // console.log('Fetching catalog...')
          const catalogRes = await fetch(`${apiUrl}/catalog`);
          result = await catalogRes.json();
          // console.log('Catalog response status:', catalogRes.status)
          // console.log('Catalog response:', result)
          if (!catalogRes.ok)
            throw new Error(result.error || "Failed to fetch catalog");
          break;

        default:
          setError(`Endpoint ${endpoint} not implemented`);
          return;
      }

      // console.log('Final processed result:', result)
      setResponse(result);
    } catch (err) {
      console.error("API Error:", err);
      setError(
        `API Error: ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Get available endpoints for current provider
  const availableEndpoints =
    normalizedProviderId && isValidProviderType(normalizedProviderId)
      ? PROVIDER_ENDPOINTS[normalizedProviderId as ProviderType]
      : [];

  return (
    <ResizablePanelGroup
      direction="horizontal"
      className="h-[600px] rounded-lg border"
    >
      <ResizablePanel defaultSize={25} minSize={20} maxSize={30}>
        <div className="flex h-full flex-col">
          <div className="border-b px-4 py-2">
            <h3 className="font-semibold">API Endpoints for {providerId}</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-2 p-4">
              {availableEndpoints.map((endpoint) => (
                <Button
                  key={endpoint}
                  variant={
                    selectedEndpoint === endpoint ? "default" : "outline"
                  }
                  className="w-full justify-start"
                  onClick={() => handleEndpointClick(endpoint)}
                  disabled={loading}
                >
                  {endpoint}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>

      <ResizableHandle withHandle />

      <ResizablePanel defaultSize={75}>
        <div className="flex h-full flex-col">
          <div className="border-b px-4 py-2">
            <h3 className="font-semibold">Response</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4">
              {loading ? (
                <div className="text-center text-muted-foreground">
                  Loading...
                </div>
              ) : error ? (
                <div className="text-center text-red-500">{error}</div>
              ) : response ? (
                <JsonViewer jsonObject={response} />
              ) : (
                <div className="text-center text-muted-foreground">
                  Select an endpoint to see the response
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
