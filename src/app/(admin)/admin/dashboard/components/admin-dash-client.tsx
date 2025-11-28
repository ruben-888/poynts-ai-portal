"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ExternalLink,
  Gift,
  Users,
  CreditCard,
  Building2,
  DollarSign,
  Coins,
  Wallet,
  PiggyBank,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { Overview } from "./overview";
import { RecentSales } from "./recent-sales";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatNumber } from "@/lib/utils";
import { useEffect, useState } from "react";

// Define the balance type
interface Balance {
  source: string;
  poynts: number;
  money_est: number;
  money_real: number;
  rebate_bank: number;
  rebate_accum: number;
}

// Define the API response type
interface ApiResponse {
  tango_orders: number;
  amazon_orders: number;
  poynts_holding: number;
  poynts_tango: number;
  poynts_amazon: number;
  poynts_blackhawk: number;
  poynts_total: number;
  amazon_money: number;
  tango_money: number;
  blackhawk_money: number;
  amazon_money_est: number;
  tango_money_est: number;
  blackhawk_money_est: number;
  new_format: Balance[];
}

// Function to fetch balances
const fetchBalances = async (): Promise<ApiResponse> => {
  const response = await fetch("/api/legacy/balances");
  if (!response.ok) {
    throw new Error("Failed to fetch balances");
  }
  return response.json();
};

export function AdminDashboardClient() {
  // State to store processed balance data
  const [balanceData, setBalanceData] = useState<Balance[]>([]);

  // Get the query client for invalidating queries
  const queryClient = useQueryClient();

  // Fetch balances using React Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["balances"],
    queryFn: fetchBalances,
  });

  // Process the data when it changes
  useEffect(() => {
    if (data && data.new_format) {
      console.log("API Response:", data);

      // Extract the new_format array from the API response
      setBalanceData(data.new_format);
    }
  }, [data]);

  // Function to handle refresh button click
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["balances"] });
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <Button
          variant="outline"
          size="icon"
          onClick={handleRefresh}
          disabled={isLoading || isFetching}
        >
          <RefreshCw
            className={`h-4 w-4 ${isLoading || isFetching ? "animate-spin" : ""}`}
          />
          <span className="sr-only">Refresh data</span>
        </Button>
      </div>

      {/* Main Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          // Loading state
          Array(3)
            .fill(0)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Loading...
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-6 w-24 bg-gray-200 animate-pulse rounded"></div>
                </CardContent>
              </Card>
            ))
        ) : error ? (
          // Error state
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-red-500">Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Failed to load balance information. Please try again later.</p>
            </CardContent>
          </Card>
        ) : (
          // Data loaded successfully - use balanceData state instead of directly using balances
          balanceData.map((balance: Balance) => (
            <Card key={balance.source} className="relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-2 py-1 text-xs font-bold rounded-bl">
                Source {balance.source}
              </div>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {/* Provider {balance.source} */}
                </CardTitle>
                {/* <Wallet className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <Coins className="h-3 w-3 mr-1" /> Poynts
                    </p>
                    <div className="text-xl font-bold">
                      {formatNumber(balance.poynts)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" /> Est. Money
                    </p>
                    <div className="text-xl font-bold">
                      ${formatNumber(balance.money_est)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <DollarSign className="h-3 w-3 mr-1" /> Real Money
                    </p>
                    <div className="text-xl font-bold">
                      ${formatNumber(balance.money_real)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center">
                      <PiggyBank className="h-3 w-3 mr-1" /> Rebate Bank
                    </p>
                    <div className="text-xl font-bold">
                      ${formatNumber(balance.rebate_bank)}
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <PiggyBank className="h-3 w-3 mr-1" /> Accumulated Rebates
                  </p>
                  <div className="text-xl font-bold">
                    ${formatNumber(balance.rebate_accum)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Provider Activity Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Provider Activity Overview</CardTitle>
            <CardDescription>
              Gift card issuance across all providers
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview />
          </CardContent>
        </Card>

        {/* Recent Customer Activity */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Customer Activity</CardTitle>
            <CardDescription>
              Latest transactions and catalog updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>

      {/* Important Links Section */}
      <Card>
        <CardHeader>
          <CardTitle>Important Links</CardTitle>
          <CardDescription>
            Quick access to external resources and tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="https://api-docs.example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                API Documentation
              </Button>
            </Link>
            <Link
              href="https://status.example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                System Status
              </Button>
            </Link>
            <Link
              href="https://support.example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Support Portal
              </Button>
            </Link>
            <Link
              href="https://partners.example.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                Partner Portal
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
