"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Activity, Gift, CreditCard, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OverviewTab } from "./tabs/overview-tab";
import { RewardsTab } from "./tabs/rewards-tab";
import { IssuesTab } from "./tabs/issues-tab";
import { IncidentsTab } from "./tabs/incidents-tab";
import { ApiEndpointsTab } from "./tabs/api-endpoints-tab";
import { CatalogsTab } from "./tabs/catalogs-tab";

// Mock data interfaces
interface MetricCardData {
  title: string;
  value: string;
  change: string;
  changeType: "increase" | "decrease" | "neutral";
  description: string;
  icon: React.ReactNode;
}

interface RedemptionDataPoint {
  time: string;
  redemptions: number;
  value: number;
}

interface SystemEvent {
  id: string;
  type: "redemption" | "system" | "alert" | "gift_card" | "member";
  title: string;
  description: string;
  timestamp: string;
  severity: "info" | "warning" | "error" | "critical";
  status: "active" | "resolved" | "investigating";
}

interface SuspendedIssue {
  id: string;
  title: string;
  description: string;
  severity: "high" | "medium" | "low";
  since: string;
  affectedUsers: number;
}

interface Incident {
  id: string;
  title: string;
  description: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "critical" | "major" | "minor" | "maintenance";
  createdAt: string;
  updatedAt: string;
  affectedServices: string[];
  updates: {
    timestamp: string;
    message: string;
    status: string;
  }[];
}

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

interface PopularReward {
  id: string;
  name: string;
  brand: string;
  category: string;
  redemptions: number;
  totalValue: number;
  averageValue: number;
  popularityRank: number;
}

export function OpsDashboardClient() {
  const [selectedTimeRange, setSelectedTimeRange] = React.useState("24h");
  const [isAlertDismissed, setIsAlertDismissed] = React.useState(false);

  // Mock data - in real implementation, these would come from API calls
  const metricsData: MetricCardData[] = [
    {
      title: "Active Redemptions",
      value: "1,247",
      change: "+12.3%",
      changeType: "increase",
      description: "Last 24 hours",
      icon: <Gift className="h-4 w-4" />,
    },
    {
      title: "Gift Card Inventory",
      value: "98.2%",
      change: "-0.8%",
      changeType: "decrease",
      description: "Available stock",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Active Members",
      value: "15,432",
      change: "+5.7%",
      changeType: "increase",
      description: "This week",
      icon: <Users className="h-4 w-4" />,
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "0%",
      changeType: "neutral",
      description: "Uptime",
      icon: <Activity className="h-4 w-4" />,
    },
  ];

  const suspendedIssues: SuspendedIssue[] = [
    {
      id: "1",
      title: "Source B API Rate Limiting",
      description: "Experiencing intermittent rate limiting on gift card purchases",
      severity: "high",
      since: "2 hours ago",
      affectedUsers: 45,
    },
    {
      id: "2",
      title: "Source C Integration Delay",
      description: "Gift card activation taking longer than usual",
      severity: "medium", 
      since: "4 hours ago",
      affectedUsers: 12,
    },
  ];

  const recentActivity: SystemEvent[] = [
    {
      id: "1",
      type: "redemption",
      title: "Large Volume Redemption",
      description: "Amazon gift card redemption for $500 by member John Doe",
      timestamp: "2 minutes ago",
      severity: "info",
      status: "active",
    },
    {
      id: "2",
      type: "alert",
      title: "Low Inventory Alert",
      description: "Starbucks gift cards below threshold (< 50 remaining)",
      timestamp: "15 minutes ago",
      severity: "warning",
      status: "investigating",
    },
    {
      id: "3",
      type: "system",
      title: "Catalog Update",
      description: "New brand categories added to catalog",
      timestamp: "1 hour ago",
      severity: "info",
      status: "resolved",
    },
    {
      id: "4",
      type: "gift_card",
      title: "Provider Sync",
      description: "Successfully synced 1,200 new gift card items from Source B",
      timestamp: "2 hours ago",
      severity: "info",
      status: "resolved",
    },
    {
      id: "5",
      type: "member",
      title: "Member Registration Spike",
      description: "25% increase in new member registrations",
      timestamp: "3 hours ago",
      severity: "info",
      status: "active",
    },
  ];

  const incidents: Incident[] = [
    {
      id: "INC-001",
      title: "Gift Card API Service Degradation",
      description: "Users experiencing slow response times when purchasing gift cards",
      status: "monitoring",
      severity: "major",
      createdAt: "2024-01-15T14:30:00Z",
      updatedAt: "2024-01-15T16:45:00Z",
      affectedServices: ["Gift Card API", "Payment Processing"],
      updates: [
        {
          timestamp: "2024-01-15T16:45:00Z",
          message: "Response times have improved to normal levels. Monitoring continues.",
          status: "monitoring"
        },
        {
          timestamp: "2024-01-15T15:20:00Z",
          message: "Engineering team has identified the root cause and applied a fix.",
          status: "identified"
        },
        {
          timestamp: "2024-01-15T14:30:00Z",
          message: "Investigating reports of slow gift card purchase response times.",
          status: "investigating"
        }
      ]
    },
    {
      id: "INC-002",
      title: "Source B Provider Timeout",
      description: "Intermittent timeouts when connecting to Source B gift card provider",
      status: "investigating",
      severity: "minor",
      createdAt: "2024-01-15T12:15:00Z",
      updatedAt: "2024-01-15T12:45:00Z",
      affectedServices: ["Source B Integration"],
      updates: [
        {
          timestamp: "2024-01-15T12:45:00Z",
          message: "Reached out to Source B support team for assistance.",
          status: "investigating"
        },
        {
          timestamp: "2024-01-15T12:15:00Z",
          message: "Monitoring timeout errors from Source B provider.",
          status: "investigating"
        }
      ]
    },
    {
      id: "INC-003",
      title: "Database Performance Issues",
      description: "Slow query performance affecting dashboard loading times",
      status: "resolved",
      severity: "major",
      createdAt: "2024-01-15T08:00:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
      affectedServices: ["Database", "Admin Dashboard", "Customer Portal"],
      updates: [
        {
          timestamp: "2024-01-15T10:30:00Z",
          message: "Database optimization complete. Performance has returned to normal.",
          status: "resolved"
        },
        {
          timestamp: "2024-01-15T09:15:00Z",
          message: "Database team is optimizing slow queries and rebuilding indexes.",
          status: "identified"
        },
        {
          timestamp: "2024-01-15T08:00:00Z",
          message: "Reports of slow dashboard loading times under investigation.",
          status: "investigating"
        }
      ]
    }
  ];

  const apiEndpoints: APIEndpoint[] = [
    {
      id: "redeem-gift-card",
      name: "Redeem Gift Card",
      method: "POST",
      path: "/api/redemptions/gift-card",
      description: "Redeem a gift card for a member",
      status: "healthy",
      avgLatency: 245,
      p95Latency: 450,
      p99Latency: 680,
      requestsPerHour: 1247,
      errorRate: 0.8,
      uptime: 99.9,
      lastChecked: "2024-01-15T17:30:00Z",
      hourlyRequests: [
        { hour: "12:00", requests: 89, errors: 1, avgLatency: 230 },
        { hour: "13:00", requests: 134, errors: 0, avgLatency: 245 },
        { hour: "14:00", requests: 156, errors: 2, avgLatency: 267 },
        { hour: "15:00", requests: 142, errors: 1, avgLatency: 234 },
        { hour: "16:00", requests: 167, errors: 0, avgLatency: 221 },
        { hour: "17:00", requests: 189, errors: 3, avgLatency: 289 },
      ]
    },
    {
      id: "redeem-offer",
      name: "Redeem Offer",
      method: "POST",
      path: "/api/redemptions/offer",
      description: "Redeem a custom offer for a member",
      status: "healthy",
      avgLatency: 189,
      p95Latency: 320,
      p99Latency: 480,
      requestsPerHour: 567,
      errorRate: 1.2,
      uptime: 99.8,
      lastChecked: "2024-01-15T17:29:00Z",
      hourlyRequests: [
        { hour: "12:00", requests: 45, errors: 0, avgLatency: 178 },
        { hour: "13:00", requests: 67, errors: 1, avgLatency: 189 },
        { hour: "14:00", requests: 89, errors: 2, avgLatency: 201 },
        { hour: "15:00", requests: 78, errors: 0, avgLatency: 167 },
        { hour: "16:00", requests: 92, errors: 1, avgLatency: 195 },
        { hour: "17:00", requests: 98, errors: 1, avgLatency: 203 },
      ]
    },
    {
      id: "create-member",
      name: "Create Member",
      method: "POST",
      path: "/api/members",
      description: "Create a new member account",
      status: "degraded",
      avgLatency: 890,
      p95Latency: 1200,
      p99Latency: 1800,
      requestsPerHour: 234,
      errorRate: 3.2,
      uptime: 97.5,
      lastChecked: "2024-01-15T17:28:00Z",
      hourlyRequests: [
        { hour: "12:00", requests: 23, errors: 1, avgLatency: 850 },
        { hour: "13:00", requests: 34, errors: 2, avgLatency: 920 },
        { hour: "14:00", requests: 45, errors: 1, avgLatency: 780 },
        { hour: "15:00", requests: 38, errors: 3, avgLatency: 1100 },
        { hour: "16:00", requests: 41, errors: 2, avgLatency: 890 },
        { hour: "17:00", requests: 39, errors: 1, avgLatency: 920 },
      ]
    },
    {
      id: "get-catalog",
      name: "Get Catalog",
      method: "GET",
      path: "/api/catalog",
      description: "Retrieve available catalog items",
      status: "healthy",
      avgLatency: 123,
      p95Latency: 200,
      p99Latency: 350,
      requestsPerHour: 2890,
      errorRate: 0.3,
      uptime: 99.95,
      lastChecked: "2024-01-15T17:30:00Z",
      hourlyRequests: [
        { hour: "12:00", requests: 456, errors: 1, avgLatency: 118 },
        { hour: "13:00", requests: 523, errors: 0, avgLatency: 123 },
        { hour: "14:00", requests: 612, errors: 2, avgLatency: 134 },
        { hour: "15:00", requests: 587, errors: 1, avgLatency: 119 },
        { hour: "16:00", requests: 634, errors: 0, avgLatency: 117 },
        { hour: "17:00", requests: 678, errors: 1, avgLatency: 128 },
      ]
    }
  ];

  const popularRewards: PopularReward[] = [
    {
      id: "1",
      name: "$25 Amazon Gift Card",
      brand: "Amazon",
      category: "E-commerce",
      redemptions: 87,
      totalValue: 2175,
      averageValue: 25,
      popularityRank: 1
    },
    {
      id: "2",
      name: "$10 Starbucks Gift Card",
      brand: "Starbucks",
      category: "Food & Beverage",
      redemptions: 64,
      totalValue: 640,
      averageValue: 10,
      popularityRank: 2
    },
    {
      id: "3",
      name: "$50 Target Gift Card",
      brand: "Target",
      category: "Retail",
      redemptions: 43,
      totalValue: 2150,
      averageValue: 50,
      popularityRank: 3
    },
    {
      id: "4",
      name: "$15 Netflix Gift Card",
      brand: "Netflix",
      category: "Entertainment",
      redemptions: 38,
      totalValue: 570,
      averageValue: 15,
      popularityRank: 4
    },
    {
      id: "5",
      name: "$20 Uber Gift Card",
      brand: "Uber",
      category: "Transportation",
      redemptions: 32,
      totalValue: 640,
      averageValue: 20,
      popularityRank: 5
    },
    {
      id: "6",
      name: "$100 Best Buy Gift Card",
      brand: "Best Buy",
      category: "Electronics",
      redemptions: 28,
      totalValue: 2800,
      averageValue: 100,
      popularityRank: 6
    },
    {
      id: "7",
      name: "$5 Dunkin' Gift Card",
      brand: "Dunkin'",
      category: "Food & Beverage",
      redemptions: 27,
      totalValue: 135,
      averageValue: 5,
      popularityRank: 7
    },
    {
      id: "8",
      name: "$25 iTunes Gift Card",
      brand: "Apple",
      category: "Digital",
      redemptions: 24,
      totalValue: 600,
      averageValue: 25,
      popularityRank: 8
    },
    {
      id: "9",
      name: "$30 DoorDash Gift Card",
      brand: "DoorDash",
      category: "Food Delivery",
      redemptions: 21,
      totalValue: 630,
      averageValue: 30,
      popularityRank: 9
    },
    {
      id: "10",
      name: "$75 Home Depot Gift Card",
      brand: "Home Depot",
      category: "Home Improvement",
      redemptions: 19,
      totalValue: 1425,
      averageValue: 75,
      popularityRank: 10
    }
  ];

  // Mock redemption chart data
  const redemptionData: RedemptionDataPoint[] = [
    { time: "00:00", redemptions: 45, value: 2300 },
    { time: "04:00", redemptions: 12, value: 800 },
    { time: "08:00", redemptions: 89, value: 4200 },
    { time: "12:00", redemptions: 156, value: 7800 },
    { time: "16:00", redemptions: 134, value: 6700 },
    { time: "20:00", redemptions: 98, value: 5200 },
  ];



  return (
    <div className="space-y-6">
      {/* Suspended Issues Alert */}
      {suspendedIssues.length > 0 && !isAlertDismissed && (
        <Alert className="border-orange-200 bg-orange-50 relative">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800 pr-8">
            <strong>{suspendedIssues.length} suspended issue{suspendedIssues.length > 1 ? 's' : ''}</strong> requiring attention
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-6 w-6 p-0 text-orange-600 hover:text-orange-800 hover:bg-orange-100"
            onClick={() => setIsAlertDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="catalogs">Catalogs</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="api">API Endpoints</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OverviewTab metricsData={metricsData} recentActivity={recentActivity} popularRewards={popularRewards} />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <RewardsTab />
        </TabsContent>

        <TabsContent value="catalogs" className="space-y-4">
          <CatalogsTab />
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <IssuesTab suspendedIssues={suspendedIssues} />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <IncidentsTab incidents={incidents} />
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          <ApiEndpointsTab apiEndpoints={apiEndpoints} />
        </TabsContent>
      </Tabs>
    </div>
  );
}