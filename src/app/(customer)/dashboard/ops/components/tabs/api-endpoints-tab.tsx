"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, AlertTriangle, AlertCircle, Clock } from "lucide-react";

interface APIEndpoint {
  id: string;
  name: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  status: "healthy" | "degraded" | "down";
  avgLatency: number;
  p95Latency: number;
  p99Latency: number;
  requestsPerHour: number;
  errorRate: number;
  uptime: number;
  lastChecked: string;
  hourlyRequests: {
    hour: string;
    requests: number;
    errors: number;
    avgLatency: number;
  }[];
}

interface ApiEndpointsTabProps {
  apiEndpoints: APIEndpoint[];
}

export function ApiEndpointsTab({ apiEndpoints }: ApiEndpointsTabProps) {
  const getApiStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-100 text-green-800 border-green-200";
      case "degraded": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "down": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getApiStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <Activity className="h-4 w-4 text-green-500" />;
      case "degraded": return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "down": return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "bg-blue-100 text-blue-800";
      case "POST": return "bg-green-100 text-green-800";
      case "PUT": return "bg-orange-100 text-orange-800";
      case "DELETE": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Requests by Endpoint */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Requests by Endpoint</CardTitle>
                <CardDescription>
                  Request volume comparison across endpoints
                </CardDescription>
              </div>
              <Select defaultValue="24h">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">Last 24 hours</SelectItem>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {apiEndpoints.map((endpoint) => {
                const totalRequests = endpoint.hourlyRequests.reduce((sum, hour) => sum + hour.requests, 0);
                const maxRequests = Math.max(...apiEndpoints.map(e => e.hourlyRequests.reduce((sum, hour) => sum + hour.requests, 0)));
                return (
                  <div key={endpoint.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <span className="text-sm font-medium">{endpoint.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">{endpoint.avgLatency}ms</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(totalRequests / maxRequests) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Provider Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Provider Requests</CardTitle>
            <CardDescription>
              Gift card provider performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Source A", requests: 12543, avgLatency: 245 },
                { name: "Source B", requests: 8921, avgLatency: 189 },
                { name: "Source C", requests: 6234, avgLatency: 312 }
              ].map((provider) => {
                const maxRequests = 12543;
                return (
                  <div key={provider.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">{provider.name}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-muted-foreground">{provider.requests.toLocaleString()}</span>
                        <span className="text-sm text-muted-foreground">{provider.avgLatency}ms</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(provider.requests / maxRequests) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed API Endpoints */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Detailed monitoring data for all API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {apiEndpoints.map((endpoint) => (
              <div key={endpoint.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getApiStatusIcon(endpoint.status)}
                    <Badge variant="outline" className={getMethodColor(endpoint.method)}>
                      {endpoint.method}
                    </Badge>
                    <h3 className="font-semibold">{endpoint.name}</h3>
                    <Badge variant="outline" className={getApiStatusColor(endpoint.status)}>
                      {endpoint.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground">{endpoint.path}</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Requests/Hour</div>
                    <div className="font-semibold">{endpoint.requestsPerHour.toLocaleString()}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Avg Latency</div>
                    <div className="font-semibold">{endpoint.avgLatency}ms</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">P95 Latency</div>
                    <div className="font-semibold">{endpoint.p95Latency}ms</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Error Rate</div>
                    <div className="font-semibold">{endpoint.errorRate}%</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Uptime</div>
                    <div className="font-semibold">{endpoint.uptime}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}