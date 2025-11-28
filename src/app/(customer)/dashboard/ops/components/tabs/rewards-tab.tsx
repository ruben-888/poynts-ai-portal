"use client";

import * as React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RewardBrand {
  id: string;
  name: string;
  brand: string;
  category: string;
  redemptions: number;
  totalValue: number;
  popularityRank: number;
  valueBreakdown: {
    value: string;
    count: number;
  }[];
}

interface ClientRewards {
  id: string;
  clientName: string;
  totalRedemptions: number;
  totalValue: number;
  topReward: string;
  lastRedemption: string;
}

export function RewardsTab() {
  // Mock data for top 10 rewards
  const topRewards: RewardBrand[] = [
    {
      id: "1",
      name: "Amazon Gift Card",
      brand: "Amazon",
      category: "E-commerce",
      redemptions: 187,
      totalValue: 4675,
      popularityRank: 1,
      valueBreakdown: [
        { value: "$25", count: 89 },
        { value: "$50", count: 54 },
        { value: "$10", count: 44 }
      ]
    },
    {
      id: "2",
      name: "Starbucks Gift Card",
      brand: "Starbucks",
      category: "Food & Beverage",
      redemptions: 164,
      totalValue: 1640,
      popularityRank: 2,
      valueBreakdown: [
        { value: "$10", count: 92 },
        { value: "$15", count: 45 },
        { value: "$5", count: 27 }
      ]
    },
    {
      id: "3",
      name: "Nike Gift Card",
      brand: "Nike",
      category: "Retail",
      redemptions: 143,
      totalValue: 7150,
      popularityRank: 3,
      valueBreakdown: [
        { value: "$50", count: 78 },
        { value: "$25", count: 42 },
        { value: "$100", count: 23 }
      ]
    },
    {
      id: "4",
      name: "Apple Gift Card",
      brand: "Apple",
      category: "Technology",
      redemptions: 138,
      totalValue: 2070,
      popularityRank: 4,
      valueBreakdown: [
        { value: "$15", count: 65 },
        { value: "$25", count: 43 },
        { value: "$10", count: 30 }
      ]
    },
    {
      id: "5",
      name: "Whole Foods Gift Card",
      brand: "Whole Foods",
      category: "Grocery",
      redemptions: 132,
      totalValue: 2640,
      popularityRank: 5,
      valueBreakdown: [
        { value: "$20", count: 76 },
        { value: "$15", count: 34 },
        { value: "$25", count: 22 }
      ]
    },
    {
      id: "6",
      name: "Target Gift Card",
      brand: "Target",
      category: "Retail",
      redemptions: 124,
      totalValue: 3100,
      popularityRank: 6,
      valueBreakdown: [
        { value: "$25", count: 67 },
        { value: "$20", count: 34 },
        { value: "$15", count: 23 }
      ]
    },
    {
      id: "7",
      name: "Uber Gift Card",
      brand: "Uber",
      category: "Transportation",
      redemptions: 98,
      totalValue: 2940,
      popularityRank: 7,
      valueBreakdown: [
        { value: "$30", count: 56 },
        { value: "$20", count: 25 },
        { value: "$15", count: 17 }
      ]
    },
    {
      id: "8",
      name: "Netflix Gift Card",
      brand: "Netflix",
      category: "Entertainment",
      redemptions: 89,
      totalValue: 1335,
      popularityRank: 8,
      valueBreakdown: [
        { value: "$15", count: 54 },
        { value: "$10", count: 23 },
        { value: "$25", count: 12 }
      ]
    },
    {
      id: "9",
      name: "Best Buy Gift Card",
      brand: "Best Buy",
      category: "Electronics",
      redemptions: 76,
      totalValue: 3800,
      popularityRank: 9,
      valueBreakdown: [
        { value: "$50", count: 45 },
        { value: "$25", count: 21 },
        { value: "$100", count: 10 }
      ]
    },
    {
      id: "10",
      name: "GameStop Gift Card",
      brand: "GameStop",
      category: "Gaming",
      redemptions: 67,
      totalValue: 1675,
      popularityRank: 10,
      valueBreakdown: [
        { value: "$25", count: 43 },
        { value: "$15", count: 16 },
        { value: "$10", count: 8 }
      ]
    }
  ];

  // Mock data for client rewards
  const clientRewards: ClientRewards[] = [
    {
      id: "1",
      clientName: "Bank of America",
      totalRedemptions: 1245,
      totalValue: 67250,
      topReward: "Amazon Gift Card",
      lastRedemption: "2 hours ago"
    },
    {
      id: "2",
      clientName: "Church Health",
      totalRedemptions: 89,
      totalValue: 4450,
      topReward: "Starbucks Gift Card",
      lastRedemption: "5 hours ago"
    },
    {
      id: "3",
      clientName: "Bio Delivery Sciences-test",
      totalRedemptions: 43,
      totalValue: 2150,
      topReward: "Nike Gift Card",
      lastRedemption: "1 day ago"
    },
    {
      id: "4",
      clientName: "Calyx-test",
      totalRedemptions: 38,
      totalValue: 1900,
      topReward: "Apple Gift Card",
      lastRedemption: "3 hours ago"
    },
    {
      id: "5",
      clientName: "Diamond Resorts",
      totalRedemptions: 34,
      totalValue: 1700,
      topReward: "Target Gift Card",
      lastRedemption: "6 hours ago"
    },
    {
      id: "6",
      clientName: "BofA Validation",
      totalRedemptions: 12,
      totalValue: 600,
      topReward: "Netflix Gift Card",
      lastRedemption: "1 day ago"
    }
  ];

  // Calculate totals
  const totalRedemptions = topRewards.reduce((sum, reward) => sum + reward.redemptions, 0);
  const totalValue = topRewards.reduce((sum, reward) => sum + reward.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Redemptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalRedemptions.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Across all reward types</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${totalValue.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total financial value redeemed</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top 10 Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Rewards</CardTitle>
            <CardDescription>
              Most popular gift card rewards by redemption count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topRewards.map((reward) => (
                <div key={reward.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {reward.popularityRank}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">{reward.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {reward.brand}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{reward.category}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {reward.valueBreakdown.map((breakdown, index) => (
                          <span key={index} className="text-xs text-muted-foreground">
                            {breakdown.value} ({breakdown.count})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{reward.redemptions}</div>
                    <div className="text-xs text-muted-foreground">
                      ${reward.totalValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards by Client */}
        <Card>
          <CardHeader>
            <CardTitle>Rewards by Client</CardTitle>
            <CardDescription>
              Client redemption activity and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientRewards.map((client) => (
                <div key={client.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium truncate">{client.clientName}</p>
                        <Badge variant="outline" className="text-xs">
                          {client.topReward}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Last: {client.lastRedemption}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{client.totalRedemptions}</div>
                    <div className="text-xs text-muted-foreground">
                      ${client.totalValue.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}