"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { lazy } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDateRangePicker } from "./date-range-picker";
import { Overview } from "./overview";
import { RecentSales } from "./recent-sales";
import { TimestampDisplay } from "./timestamp-display";
import { useDynamicConfig } from "@statsig/react-bindings";

// Feature flag - will be replaced with an actual feature flag system later
const new_dashboard_report_enabled = true;

// Lazy loaded iframe component to improve initial page load performance
const LookerReport = lazy(() =>
  Promise.resolve({
    default: ({ src }: { src: string }) => (
      <iframe
        width="100%"
        height="100%"
        src={src}
        style={{ border: 0 }}
        allowFullScreen
        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      />
    ),
  })
);


const DashboardClient: React.FC<{ hasInternalAccess?: boolean }> = ({
  hasInternalAccess = false,
}) => {
  // Add state to track if the iframes have been loaded
  const [legacyIframeLoaded, setLegacyIframeLoaded] = React.useState(true);
  const [platformIframeLoaded, setPlatformIframeLoaded] = React.useState(true);
  // Add state to track current tab value
  const [currentTab, setCurrentTab] = React.useState("customer-view");
  // Add state for timestamp
  const [currentTime, setCurrentTime] = React.useState(new Date());

  // Update timestamp every second
  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format timestamp like "Sun Aug 10 2025 23:15:47"
  const formatTimestamp = (date: Date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    const dayName = days[date.getDay()];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${dayName} ${month} ${day} ${year} ${hours}:${minutes}:${seconds}`;
  };

  // New One
  // <iframe width="600" height="450" src="https://lookerstudio.google.com/embed/reporting/ee447141-e81c-43ec-8748-92cc7ea6749e/page/SVNKF" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>

  // Old One
  // <iframe width="600" height="600" src="https://lookerstudio.google.com/embed/reporting/fee37e78-60d9-48b6-8006-dd8645070bdd/page/p_5p4n2hj64c" frameborder="0" style="border:0" allowfullscreen sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"></iframe>

  const lookerReportUrlConfig = useDynamicConfig("customer_dashboard_report");
  const lookerReportFallbackUrl =
    "https://lookerstudio.google.com/embed/reporting/fee37e78-60d9-48b6-8006-dd8645070bdd/page/p_5p4n2hj64c";

  const reportUrl = React.useMemo(
    () =>
      (lookerReportUrlConfig.get("lookerEmbedUrl") as string) ||
      lookerReportFallbackUrl,
    [lookerReportUrlConfig]
  );

  // Handle tab change to ensure iframes are loaded (only used when feature flag is enabled)
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    if (value === "customer-view" && !legacyIframeLoaded) {
      setLegacyIframeLoaded(true);
    }
    if (value === "cp-internal-view" && !platformIframeLoaded) {
      setPlatformIframeLoaded(true);
    }
  };

  return (
    <>
      <div className="md:hidden">
        <Image
          src="/examples/dashboard-light.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="block dark:hidden"
        />
        <Image
          src="/examples/dashboard-dark.png"
          width={1280}
          height={866}
          alt="Dashboard"
          className="hidden dark:block"
        />
      </div>
      <div className="flex items-center justify-between space-y-2">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
      </div>

      {new_dashboard_report_enabled ? (
        hasInternalAccess ? (
          // Show tabs UI when user has internal access
          <Tabs
            defaultValue="customer-view"
            className="space-y-4"
            onValueChange={handleTabChange}
          >
            <TabsList>
              <TabsTrigger value="customer-view">Customer View</TabsTrigger>
              <TabsTrigger value="cp-internal-view">
                CP Internal View
              </TabsTrigger>
              {/* <TabsTrigger value="overview">New Design WIP 🚧</TabsTrigger> */}
            </TabsList>
               {/* Timestamp display */}
            <TimestampDisplay />


            {/* Timestamp display */}
            <div className="text-base font-bold text-muted-foreground mt-2">
              {formatTimestamp(currentTime)}
            </div>

            {/* Always render all tab contents, but use CSS to hide/show */}
            <div className="relative">
              {/* Customer View iframe */}
              <div
                className={`${legacyIframeLoaded ? "block" : "hidden"} absolute inset-0 z-10 transition-opacity duration-300 ${currentTab === "customer-view" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
              >
                <div className="h-[calc(100vh-12rem)] w-full overflow-hidden">
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        Loading report...
                      </div>
                    }
                  >
                    <LookerReport src="https://lookerstudio.google.com/embed/reporting/fee37e78-60d9-48b6-8006-dd8645070bdd" />
                  </React.Suspense>
                </div>
              </div>

              {/* CP Internal View iframe - only render if user has access */}
              <div
                className={`${platformIframeLoaded ? "block" : "hidden"} absolute inset-0 z-10 transition-opacity duration-300 ${currentTab === "cp-internal-view" ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
              >
                <div className="h-[calc(100vh-12rem)] w-full overflow-hidden">
                  <React.Suspense
                    fallback={
                      <div className="flex items-center justify-center h-full">
                        Loading report...
                      </div>
                    }
                  >
                    <LookerReport src="https://lookerstudio.google.com/embed/reporting/6f7bafab-8179-4067-a580-61d881835cf4" />
                  </React.Suspense>
                </div>
              </div>

              {/* Hidden dashboard components for future use */}
              {/* <TabsContent value="overview" className="space-y-4">
                <div className="flex justify-end mb-4">
                  <CalendarDateRangePicker />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        # Rewards
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">14,649</div>
                      <p className="text-xs text-muted-foreground">
                        +16.5% from previous month
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        $ Avg Reward
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$25.42</div>
                      <p className="text-xs text-muted-foreground">
                        +19.7% increase
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        $ Rewards
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <path d="M2 10h20" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$372,545</div>
                      <p className="text-xs text-muted-foreground">
                        +39.4% increase
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">
                        New Members
                      </CardTitle>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        className="h-4 w-4 text-muted-foreground"
                      >
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                      </svg>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">1,206</div>
                      <p className="text-xs text-muted-foreground">
                        New members this period
                      </p>
                    </CardContent>
                  </Card>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4">
                    <CardHeader>
                      <CardTitle>Transactions by Brand</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                      <Overview />
                    </CardContent>
                  </Card>
                  <Card className="col-span-3">
                    <CardHeader>
                      <CardTitle>Transactions by Client</CardTitle>
                      <CardDescription>
                        Top clients by transaction volume
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <RecentSales />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent> */}

              <TabsContent value="customer-view">
                {/* This is just a placeholder for the TabsContent to work properly */}
                <div className="h-[calc(100vh-12rem)] w-full"></div>
              </TabsContent>
              <TabsContent value="cp-internal-view">
                {/* This is just a placeholder for the TabsContent to work properly */}
                <div className="h-[calc(100vh-12rem)] w-full"></div>
              </TabsContent>
            </div>
          </Tabs>
        ) : (
          // Show only Customer View when user doesn't have internal access
          <div className="space-y-4">
            <div className="h-[calc(100vh-12rem)] w-full overflow-hidden">
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center h-full">
                    Loading report...
                  </div>
                }
              >
                <LookerReport src="https://lookerstudio.google.com/embed/reporting/fee37e78-60d9-48b6-8006-dd8645070bdd" />
              </React.Suspense>
            </div>
          </div>
        )
      ) : (
        // Show only Reports tab when feature flag is disabled
        <div className="space-y-4">
          <div className="h-[calc(100vh-12rem)] w-full overflow-hidden">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center h-full">
                  Loading report...
                </div>
              }
            >
              <LookerReport src={reportUrl} />
            </React.Suspense>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardClient;
