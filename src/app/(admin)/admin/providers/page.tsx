"use client";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import Link from "next/link";

// Mock data for providers
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

// Recent incidents mock data
const recentIncidents = [
  {
    provider: "Blackhawk Network",
    status: "ongoing",
    description: "Elevated response times in EU region",
    started: "2 hours ago",
  },
  {
    provider: "Amazon",
    status: "resolved",
    description: "API rate limiting issues",
    started: "2 days ago",
    resolved: "2 days ago",
  },
  {
    provider: "Tremendous",
    status: "resolved",
    description: "Delayed webhook delivery",
    started: "5 days ago",
    resolved: "5 days ago",
  },
];

interface ProviderModalProps {
  provider: (typeof providers)[0];
  onClose: () => void;
}

function ProviderModal({ provider, onClose }: ProviderModalProps) {
  return (
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle className="flex items-center justify-between">
          <span>{provider.name}</span>
          <Badge
            variant={
              provider.status === "operational" ? "default" : "destructive"
            }
            className="capitalize"
          >
            {provider.status}
          </Badge>
        </DialogTitle>
        <DialogDescription>ID: {provider.id}</DialogDescription>
      </DialogHeader>
      <div className="grid gap-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Uptime</h4>
            <p className="text-2xl font-bold">{provider.uptime}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Response Time</h4>
            <p className="text-2xl font-bold">{provider.responseTime}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2">Success Rate</h4>
            <p className="text-2xl font-bold">{provider.successRate}</p>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">
            Today&apos;s Transactions
          </h4>
          <p className="text-2xl font-bold">{provider.transactionsToday}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-2">Last Incident</h4>
          <p className="text-muted-foreground">{provider.lastIncident}</p>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button>Update Status</Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default function ProvidersPage() {
  const [selectedProvider, setSelectedProvider] = useState<
    (typeof providers)[0] | null
  >(null);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Providers</h2>
        <div className="flex items-center space-x-2">
          <Button>Refresh Status</Button>
        </div>
      </div>

      {/* Quick Provider Navigation */}
      <div className="flex flex-wrap gap-2">
        {providers.map((provider) => (
          <Link key={provider.id} href={`/admin/providers/${provider.id}`}>
            <Button variant="outline" className="flex items-center gap-2">
              {provider.status === "operational" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
              {provider.name}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        ))}
      </div>

      {/* Provider Status Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Operational</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Providers functioning normally
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degraded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Providers with performance issues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions Today
            </CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,274</div>
            <p className="text-xs text-muted-foreground">
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Response Time
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">182ms</div>
            <p className="text-xs text-muted-foreground">
              Across all providers
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Recent Incidents</TabsTrigger>
          <TabsTrigger value="provider-status">Provider Status</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Incidents</CardTitle>
              <CardDescription>
                History of recent service disruptions and issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentIncidents.map((incident, i) => (
                  <div
                    key={i}
                    className="flex items-start space-x-4 border-b last:border-0 pb-4"
                  >
                    <div
                      className={`mt-0.5 ${
                        incident.status === "ongoing"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }`}
                    >
                      {incident.status === "ongoing" ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{incident.provider}</p>
                      <p className="text-sm text-muted-foreground">
                        {incident.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        Started: {incident.started}
                        {incident.resolved &&
                          ` • Resolved: ${incident.resolved}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="provider-status" className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <Link
                key={provider.id}
                href={`/admin/providers/${provider.id}`}
                className="block"
              >
                <Card className="cursor-pointer hover:bg-accent transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {provider.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        ID: {provider.id}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          provider.status === "operational"
                            ? "default"
                            : "destructive"
                        }
                        className="capitalize"
                      >
                        {provider.status}
                      </Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Response Time</p>
                        <p className="font-medium">{provider.responseTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Success Rate</p>
                        <p className="font-medium">{provider.successRate}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Detailed performance data for each provider
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Provider</th>
                      <th className="text-left py-2">
                        Today&apos;s Transactions
                      </th>
                      <th className="text-left py-2">Success Rate</th>
                      <th className="text-left py-2">Avg Response Time</th>
                      <th className="text-left py-2">Last Incident</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.id} className="border-b">
                        <td className="py-2">{provider.name}</td>
                        <td className="py-2">{provider.transactionsToday}</td>
                        <td className="py-2">{provider.successRate}</td>
                        <td className="py-2">{provider.responseTime}</td>
                        <td className="py-2">{provider.lastIncident}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
