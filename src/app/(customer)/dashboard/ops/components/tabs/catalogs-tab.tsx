"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Calendar, Clock, ShieldAlert } from "lucide-react";

interface SuspendedCatalog {
  id: string;
  clientName: string;
  suspendedCount: number;
  totalItems: number;
  lastSuspension: string;
  severity: "high" | "medium" | "low";
}

interface SuspendedReward {
  id: string;
  name: string;
  brand: string;
  catalog: string;
  suspensionType: "auto" | "manual";
  suspendedDate: string;
  reason: string;
  severity: "critical" | "high" | "medium" | "low";
}

interface NewReward {
  id: string;
  name: string;
  brand: string;
  category: string;
  catalog: string;
  addedDate: string;
  status: "available" | "pending_approval" | "testing";
}

export function CatalogsTab() {
  // Mock data for suspended catalogs (correlating to client names from rewards tab)
  const suspendedCatalogs: SuspendedCatalog[] = [
    {
      id: "1",
      clientName: "Bank of America",
      suspendedCount: 3,
      totalItems: 45,
      lastSuspension: "2 hours ago",
      severity: "high"
    },
    {
      id: "2",
      clientName: "Church Health",
      suspendedCount: 1,
      totalItems: 23,
      lastSuspension: "1 day ago",
      severity: "medium"
    },
    {
      id: "3",
      clientName: "Bio Delivery Sciences-test",
      suspendedCount: 2,
      totalItems: 18,
      lastSuspension: "3 hours ago",
      severity: "high"
    },
    {
      id: "4",
      clientName: "Diamond Resorts",
      suspendedCount: 1,
      totalItems: 31,
      lastSuspension: "6 hours ago",
      severity: "low"
    }
  ];

  // Mock data for suspended rewards
  const suspendedRewards: SuspendedReward[] = [
    {
      id: "1",
      name: "Amazon Gift Card $50",
      brand: "Amazon",
      catalog: "Bank of America",
      suspensionType: "auto",
      suspendedDate: "2025-01-15T14:30:00Z",
      reason: "Inventory threshold exceeded",
      severity: "critical"
    },
    {
      id: "2",
      name: "Starbucks Gift Card $25",
      brand: "Starbucks",
      catalog: "Bank of America",
      suspensionType: "manual",
      suspendedDate: "2025-01-15T10:15:00Z",
      reason: "Provider API issues",
      severity: "high"
    },
    {
      id: "3",
      name: "Nike Gift Card $100",
      brand: "Nike",
      catalog: "Bank of America",
      suspensionType: "auto",
      suspendedDate: "2025-01-14T16:20:00Z",
      reason: "Failed validation checks",
      severity: "high"
    },
    {
      id: "4",
      name: "Apple Gift Card $15",
      brand: "Apple",
      catalog: "Church Health",
      suspensionType: "manual",
      suspendedDate: "2025-01-14T09:45:00Z",
      reason: "Client request pending review",
      severity: "medium"
    },
    {
      id: "5",
      name: "Target Gift Card $25",
      brand: "Target",
      catalog: "Bio Delivery Sciences-test",
      suspensionType: "auto",
      suspendedDate: "2025-01-15T12:10:00Z",
      reason: "Rate limiting detected",
      severity: "high"
    },
    {
      id: "6",
      name: "Whole Foods Gift Card $20",
      brand: "Whole Foods",
      catalog: "Bio Delivery Sciences-test",
      suspensionType: "auto",
      suspendedDate: "2025-01-15T11:30:00Z",
      reason: "Provider maintenance window",
      severity: "medium"
    },
    {
      id: "7",
      name: "Best Buy Gift Card $75",
      brand: "Best Buy",
      catalog: "Diamond Resorts",
      suspensionType: "manual",
      suspendedDate: "2025-01-13T14:00:00Z",
      reason: "Compliance review required",
      severity: "low"
    }
  ];

  // Mock data for new rewards (past month)
  const newRewards: NewReward[] = [
    {
      id: "1",
      name: "PlayStation Store Gift Card",
      brand: "PlayStation",
      category: "Gaming",
      catalog: "Bank of America",
      addedDate: "2025-01-10T09:00:00Z",
      status: "available"
    },
    {
      id: "2",
      name: "Home Depot Gift Card",
      brand: "Home Depot",
      category: "Home Improvement",
      catalog: "Church Health",
      addedDate: "2025-01-08T14:30:00Z",
      status: "available"
    },
    {
      id: "3",
      name: "Spotify Premium Gift Card",
      brand: "Spotify",
      category: "Entertainment",
      catalog: "Bank of America",
      addedDate: "2025-01-05T11:15:00Z",
      status: "testing"
    },
    {
      id: "4",
      name: "DoorDash Gift Card",
      brand: "DoorDash",
      category: "Food Delivery",
      catalog: "Calyx-test",
      addedDate: "2025-01-03T16:45:00Z",
      status: "available"
    },
    {
      id: "5",
      name: "Xbox Gift Card",
      brand: "Xbox",
      category: "Gaming",
      catalog: "Bio Delivery Sciences-test",
      addedDate: "2024-12-28T10:20:00Z",
      status: "pending_approval"
    },
    {
      id: "6",
      name: "Sephora Gift Card",
      brand: "Sephora",
      category: "Beauty",
      catalog: "Diamond Resorts",
      addedDate: "2024-12-25T13:00:00Z",
      status: "available"
    },
    {
      id: "7",
      name: "Disney+ Gift Card",
      brand: "Disney",
      category: "Entertainment",
      catalog: "BofA Validation",
      addedDate: "2024-12-22T09:30:00Z",
      status: "testing"
    },
    {
      id: "8",
      name: "Lowe's Gift Card",
      brand: "Lowe's",
      category: "Home Improvement",
      catalog: "Church Health",
      addedDate: "2024-12-20T15:10:00Z",
      status: "available"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending_approval":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "testing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span>Suspended Catalogs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{suspendedCatalogs.length}</div>
            <div className="text-sm text-muted-foreground">Catalogs with issues</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <ShieldAlert className="h-5 w-5 text-red-600" />
              <span>Suspended Rewards</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{suspendedRewards.length}</div>
            <div className="text-sm text-muted-foreground">Rewards currently suspended</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <span>New Rewards</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{newRewards.length}</div>
            <div className="text-sm text-muted-foreground">Added this month</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Suspended Catalogs */}
        <Card>
          <CardHeader>
            <CardTitle>Catalogs with Suspensions</CardTitle>
            <CardDescription>
              Client catalogs currently experiencing suspended rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {suspendedCatalogs.map((catalog) => (
                <div key={catalog.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">{catalog.clientName}</p>
                        <Badge className={getSeverityColor(catalog.severity)}>
                          {catalog.severity}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {catalog.suspendedCount} of {catalog.totalItems} items suspended
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last: {catalog.lastSuspension}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-red-600">
                      {catalog.suspendedCount}
                    </div>
                    <div className="text-xs text-muted-foreground">suspended</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* New Rewards Available */}
        <Card>
          <CardHeader>
            <CardTitle>New Rewards Available</CardTitle>
            <CardDescription>
              Recently added rewards (past 30 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {newRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">{reward.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {reward.brand}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <p className="text-xs text-muted-foreground">{reward.catalog}</p>
                        <span className="text-xs text-muted-foreground">•</span>
                        <p className="text-xs text-muted-foreground">{reward.category}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(reward.addedDate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(reward.status)}>
                      {reward.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suspended Rewards Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Suspended Rewards Detail</CardTitle>
          <CardDescription>
            Complete list of currently suspended rewards with suspension details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {suspendedRewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {reward.suspensionType === "auto" ? (
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-orange-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="h-4 w-4 text-red-600" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">{reward.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {reward.brand}
                      </Badge>
                      <Badge className={getSeverityColor(reward.severity)}>
                        {reward.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-muted-foreground">{reward.catalog}</p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <Badge 
                        variant={reward.suspensionType === "auto" ? "secondary" : "destructive"}
                        className="text-xs"
                      >
                        {reward.suspensionType} suspension
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{reward.reason}</p>
                    <p className="text-xs text-muted-foreground">
                      Suspended {formatDate(reward.suspendedDate)}
                    </p>
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