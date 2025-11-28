"use client";

import { notFound } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { DataTableFacetedFilter } from "@/components/data-table/data-table-faceted-filter";
import { use } from "react";
import ApiTester from "./components/api-tester";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ViewRewardDetails } from "./components/view-reward-details";
import { useState } from "react";
import { useEffect } from "react";
import { CatalogResponse } from "@/interfaces/providers/types";

// Reuse the providers data from the main providers page
const providers = [
  {
    id: "tango",
    name: "TangoCard",
    status: "operational",
    uptime: "99.99%",
    responseTime: "120ms",
    lastIncident: "None",
    transactionsToday: 1250,
    successRate: "99.8%",
  },
  {
    id: "amazon",
    name: "Amazon",
    status: "operational",
    uptime: "99.95%",
    responseTime: "150ms",
    lastIncident: "2 days ago",
    transactionsToday: 890,
    successRate: "99.9%",
  },
  {
    id: "blackhawk",
    name: "Blackhawk Network",
    status: "degraded",
    uptime: "98.50%",
    responseTime: "280ms",
    lastIncident: "Ongoing",
    transactionsToday: 456,
    successRate: "97.5%",
  },
  {
    id: "tremendous",
    name: "Tremendous",
    status: "operational",
    uptime: "99.90%",
    responseTime: "180ms",
    lastIncident: "5 days ago",
    transactionsToday: 678,
    successRate: "99.7%",
  },
];

// Remove mock catalog data and define interfaces based on our API types
interface CatalogItem {
  utid: string;
  rewardName: string;
  currencyCode: string;
  valueType: string;
  minValue: number;
  maxValue: number;
  countries: string[];
  fulfillmentType: string;
}

interface CatalogEntry {
  brandKey: string;
  brandName: string;
  status: string;
  items: CatalogItem[];
  description?: string;
  shortDescription?: string;
  terms?: string;
  disclaimer?: string;
}

interface ProviderPageProps {
  params: Promise<{
    providerId: string;
  }>;
}

// Define types for API requests and incidents
interface ApiRequest {
  timestamp: string;
  endpoint: string;
  status: string;
  responseTime: string;
}

interface Incident {
  date: string;
  title: string;
  status: string;
  description: string;
}

// Mock API request data
const apiRequests: ApiRequest[] = [
  {
    timestamp: "2024-03-19T14:30:00Z",
    endpoint: "/v1/cards/balance",
    status: "success",
    responseTime: "120ms",
  },
  {
    timestamp: "2024-03-19T14:29:00Z",
    endpoint: "/v1/cards/activate",
    status: "error",
    responseTime: "450ms",
  },
  {
    timestamp: "2024-03-19T14:28:00Z",
    endpoint: "/v1/cards/purchase",
    status: "success",
    responseTime: "180ms",
  },
];

// Mock incidents data
const recentIncidents: Incident[] = [
  {
    date: "2024-03-19",
    title: "Elevated API Response Times",
    status: "resolved",
    description: "Response times increased by 50% for 15 minutes",
  },
  {
    date: "2024-03-18",
    title: "Card Activation Delays",
    status: "resolved",
    description: "Card activations were delayed by up to 5 minutes",
  },
  {
    date: "2024-03-17",
    title: "Balance Check API Intermittent Errors",
    status: "resolved",
    description: "5% of balance check requests returned errors",
  },
];

export default function ProviderPage({ params }: ProviderPageProps) {
  const { providerId } = use(params);
  const [selectedReward, setSelectedReward] = useState<CatalogEntry | null>(
    null,
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [catalogData, setCatalogData] = useState<CatalogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Find the provider data based on the URL parameter
  const provider = providers.find(
    (p) => p.id.toLowerCase() === providerId.toLowerCase(),
  );

  // If provider not found, show 404
  if (!provider) {
    notFound();
  }

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/providers/${providerId}/catalog`);
        if (!response.ok) {
          throw new Error(`Failed to fetch catalog: ${response.statusText}`);
        }
        const data = await response.json();

        // console.log('Catalog data:', data)

        // Transform the data to match our table structure
        const transformedData =
          data.products?.map((product: any) => ({
            brandKey: product.productId,
            brandName: product.brandName,
            status: "active",
            items: [
              {
                utid: product.productId,
                rewardName: product.brandName,
                currencyCode: product.minAmount?.currency || "USD",
                valueType:
                  product.minAmount?.amount === product.maxAmount?.amount
                    ? "FIXED_VALUE"
                    : "VARIABLE_VALUE",
                minValue: product.minAmount?.amount || 0,
                maxValue: product.maxAmount?.amount || 0,
                countries: ["US"], // Default to US if not provided
                fulfillmentType: "DIGITAL", // Default to DIGITAL if not provided
              },
            ],
            description: product.description,
            shortDescription: product.description,
            terms: product.terms,
            disclaimer: "",
          })) || [];

        console.log("Transformed catalog data:", transformedData);
        setCatalogData(transformedData);
      } catch (err) {
        console.error("Error fetching catalog:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch catalog",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalog();
  }, [providerId]);

  // Catalog columns definition
  const catalogColumns = [
    {
      accessorKey: "brandName",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Brand Name" />
      ),
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "productId",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Product ID" />
      ),
      cell: ({ row }: any) => {
        return <span className="font-mono">{row.original.productId}</span>;
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "minAmount",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Min Value" />
      ),
      cell: ({ row }: any) => {
        const amount = row.original.minAmount?.amount;
        return amount ? `$${amount.toFixed(2)}` : "-";
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "maxAmount",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Max Value" />
      ),
      cell: ({ row }: any) => {
        const amount = row.original.maxAmount?.amount;
        return amount ? `$${amount.toFixed(2)}` : "-";
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }: any) => {
        const status = row.original.status || "active";
        return (
          <Badge variant={status === "active" ? "default" : "secondary"}>
            {status}
          </Badge>
        );
      },
      enableSorting: true,
      enableHiding: true,
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }: any) => {
        const reward = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  setSelectedReward(reward);
                  setIsDetailsOpen(true);
                }}
              >
                View Details
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">{provider.name}</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {provider.status}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{provider.uptime}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{provider.responseTime}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{provider.successRate}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Catalog</TabsTrigger>
          <TabsTrigger value="api">API Requests</TabsTrigger>
          <TabsTrigger value="incidents">Recent Incidents</TabsTrigger>
          <TabsTrigger value="api-tester">API Tester</TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <DataTable
              data={catalogData}
              columns={catalogColumns}
              searchColumn={{
                id: "brandName",
                placeholder: "Search by brand name...",
              }}
              filters={[
                {
                  id: "status",
                  title: "Status",
                  options: [
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                    { value: "suspended", label: "Suspended" },
                  ],
                },
              ]}
            />
          )}
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent API Requests</CardTitle>
              <CardDescription>
                Last 24 hours of API activity with this provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Timestamp</th>
                      <th className="text-left py-2">Endpoint</th>
                      <th className="text-left py-2">Status</th>
                      <th className="text-left py-2">Response Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiRequests.map((request, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">
                          {new Date(request.timestamp).toLocaleString()}
                        </td>
                        <td className="py-2">{request.endpoint}</td>
                        <td className="py-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                              request.status === "success"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="py-2">{request.responseTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>
                Service incidents and disruptions from the provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIncidents.map((incident, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-4 border-b last:border-0 pb-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{incident.title}</p>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            incident.status === "resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {incident.status}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {incident.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {incident.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api-tester" className="space-y-4">
          <ApiTester providerId={providerId} />
        </TabsContent>
      </Tabs>

      <ViewRewardDetails
        reward={selectedReward}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}
