"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown } from "lucide-react";
import { DashboardData } from "@/services/reports";

/**
 * BigQuery Metrics component props
 */
interface BigQueryMetricsProps {
  startDate: Date;
  endDate: Date;
  fetchDashboardData: (
    startDate: Date,
    endDate: Date,
  ) => Promise<DashboardData>;
}

/**
 * Component that displays dashboard metrics from BigQuery
 */
export default function BigQueryMetrics({
  startDate,
  endDate,
  fetchDashboardData,
}: BigQueryMetricsProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const dashboardData = await fetchDashboardData(startDate, endDate);
        setData(dashboardData);
        setError(null);
      } catch (err) {
        console.error("Error fetching BigQuery dashboard data:", err);
        setError("Failed to load dashboard data from BigQuery");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, fetchDashboardData]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                <Skeleton className="h-4 w-[200px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-[150px] mb-2" />
              <Skeleton className="h-4 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="shadow-md bg-red-50">
        <CardContent className="pt-6">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  const { transactions, rebate, members } = data.data;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
  };

  const renderChangeIndicator = (change: number) => {
    if (change === 0) return null;

    const Icon = change > 0 ? ArrowUp : ArrowDown;
    const colorClass = change > 0 ? "text-green-600" : "text-red-600";

    return (
      <span className={`flex items-center ${colorClass}`}>
        <Icon className="h-4 w-4 mr-1" />
        {formatPercentage(change)}
      </span>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Total Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {transactions.count.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {renderChangeIndicator(transactions.countChange)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Transaction Volume
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(transactions.totalAmount)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {renderChangeIndicator(transactions.totalAmountChange)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            Average Transaction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(transactions.avgAmount)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {renderChangeIndicator(transactions.avgAmountChange)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Rebates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(rebate.amount)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {renderChangeIndicator(rebate.amountChange)}
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">New Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {members.newCount.toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {renderChangeIndicator(members.newCountChange)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
