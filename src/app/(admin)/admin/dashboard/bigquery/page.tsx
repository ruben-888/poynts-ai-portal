"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import BigQueryMetrics from "@/components/dashboard/BigQueryMetrics";
import { DashboardData } from "@/services/reports";

// Create a client-side wrapper function for the server action
async function fetchDashboardData(
  startDate: Date,
  endDate: Date,
): Promise<DashboardData> {
  try {
    const response = await fetch("/api/dashboard/bigquery", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ startDate, endDate }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
}

/**
 * BigQuery Dashboard Page
 */
export default function BigQueryDashboardPage() {
  // Default date range: last 30 days
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [date, setDate] = useState<DateRange | undefined>({
    from: thirtyDaysAgo,
    to: today,
  });

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">BigQuery Dashboard</h1>
          <p className="text-muted-foreground">
            View analytics data from BigQuery for your business metrics
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="grid gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    "w-[300px] justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, "LLL dd, y")} -{" "}
                        {format(date.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(date.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {date?.from && date?.to && (
          <BigQueryMetrics
            startDate={date.from}
            endDate={date.to}
            fetchDashboardData={fetchDashboardData}
          />
        )}
      </div>
    </div>
  );
}
