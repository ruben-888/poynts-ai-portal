"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Building2,
  ArrowRightLeft,
} from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { StatementsTab } from "./statements-tab";
import { LedgerTab } from "./ledger-tab";
import { AccountingReportTab } from "./accounting-report-tab";
import { useState } from "react";

export function FinancialDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Tabs
      defaultValue="overview"
      className="space-y-4"
      onValueChange={setActiveTab}
    >
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="rebates">Rebates</TabsTrigger>
        <TabsTrigger value="transactions">Transactions</TabsTrigger>
        <TabsTrigger value="statements">Statements</TabsTrigger>
        <TabsTrigger value="accounting-report">Accounting Report</TabsTrigger>
        <TabsTrigger value="ledger">Ledger</TabsTrigger>
      </TabsList>

      {/* Overview Tab - Looker Studio Embed */}
      <TabsContent value="overview" className="space-y-4" forceMount>
        <div
          className="h-[calc(100vh-14rem)] w-full overflow-hidden"
          style={{ display: activeTab === "overview" ? "block" : "none" }}
        >
          <iframe
            width="100%"
            height="100%"
            src="https://lookerstudio.google.com/embed/reporting/5d634c16-b69d-4419-9250-6d17fd183610/page/87RGF"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </TabsContent>

      {/* Rebates Tab - Looker Studio Embed */}
      <TabsContent value="rebates" className="space-y-4" forceMount>
        <div
          className="h-[calc(100vh-14rem)] w-full overflow-hidden"
          style={{ display: activeTab === "rebates" ? "block" : "none" }}
        >
          <iframe
            width="100%"
            height="100%"
            src="https://lookerstudio.google.com/embed/reporting/f5d3127b-c591-4a9b-85ac-44867c153674/page/VkRGF"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </TabsContent>

      {/* Transactions Tab - Looker Studio Embed */}
      <TabsContent value="transactions" className="space-y-4" forceMount>
        <div
          className="h-[calc(100vh-14rem)] w-full overflow-hidden"
          style={{ display: activeTab === "transactions" ? "block" : "none" }}
        >
          <iframe
            width="100%"
            height="100%"
            src="https://lookerstudio.google.com/embed/reporting/6a26d487-2a2d-4c64-9edb-c030f4cc0da2/page/iuRGF"
            style={{ border: 0 }}
            allowFullScreen
            sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </TabsContent>

      {/* Statements Tab */}
      <TabsContent value="statements" className="space-y-4">
        <StatementsTab />
      </TabsContent>

      {/* Accounting Report Tab */}
      <TabsContent value="accounting-report" className="space-y-4">
        <AccountingReportTab />
      </TabsContent>

      {/* Ledger Tab */}
      <TabsContent value="ledger" className="space-y-4">
        <LedgerTab />
      </TabsContent>
    </Tabs>
  );
}
