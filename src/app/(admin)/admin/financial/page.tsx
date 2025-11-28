"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarIcon, Download, FilterIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// Mock data for demonstration purposes
const mockSourceSummary = {
  numRewards: 40024,
  rewardsAmount: 1040500,
  rebateAmount: 13270.11,
};

const mockInternalSummary = {
  numRewards: 49945,
  rewardsAmount: 1299575,
  rebateAmount: 16704.22,
};

const mockSourceTransactions = [
  {
    created_at: "Mar 31, 2023, 11:16:32 PM",
    source: "B",
    cpid: "GC-SEPHORA-EN-25-B-2EAD67",
    transaction_id: "RA250331-3362490-94",
  },
  // Additional transactions would be added here
];

const mockInternalTransactions = [
  {
    date: "Mar 31, 2023, 11:58:53 PM",
    src: "A",
    cpid: "GC-AMAZON-EN-10-A-70EG",
    provider_id: "Cace267e...",
    transaction_id: "1157396",
  },
  // Additional transactions would be added here
];

const mockUnreconciledProvider = [
  {
    date: "Mar 31, 2023, 11:56:51 PM",
    source: "B",
    reward: "Google Play Gift Code",
    value: 5,
    transaction_id: "RA250331-3362552-73",
    cpid: "GC-GOOGL...",
  },
  // Additional transactions would be added here
];

// Map of provider values to display names
const providerNames: Record<ProviderType, string> = {
  all: "All Providers",
  a: "Amazon (A)",
  b: "Tango Card (B)",
  c: "Source C",
};

// Define provider type
type ProviderType = "all" | "a" | "b" | "c";

export default function FinancialPage() {
  const [selectedProvider, setSelectedProvider] = useState<ProviderType>("all");

  const getProviderBadge = (provider: ProviderType) => {
    const badgeVariants: Record<ProviderType, string> = {
      all: "bg-gray-100 text-gray-800 border border-gray-200",
      a: "bg-blue-100 text-blue-800",
      b: "bg-green-100 text-green-800",
      c: "bg-purple-100 text-purple-800",
    };

    return (
      <Badge className={`ml-2 ${badgeVariants[provider]}`}>
        {providerNames[provider]}
      </Badge>
    );
  };

  return (
    <div className="p-8 max-w-[1600px]">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Transaction Reconciliation
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Select
              defaultValue="all"
              onValueChange={(value) =>
                setSelectedProvider(value as ProviderType)
              }
            >
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Filter by Provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Providers</SelectItem>
                <SelectItem value="a">Amazon (A)</SelectItem>
                <SelectItem value="b">Tango Card (B)</SelectItem>
                <SelectItem value="c">Blackhawk (C)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 bg-muted p-2 rounded-md">
            <CalendarIcon className="h-4 w-4" />
            <DateRangePicker />
          </div>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Source Provider Summary</CardTitle>
              {getProviderBadge(selectedProvider)}
            </div>
            <CardDescription>
              Transaction data from gift card providers
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground"># Rewards</p>
              <p className="text-2xl font-bold">
                {mockSourceSummary.numRewards.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">$ Rewards</p>
              <p className="text-2xl font-bold">
                ${(mockSourceSummary.rewardsAmount / 100).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">$ Rebate</p>
              <p className="text-2xl font-bold">
                ${mockSourceSummary.rebateAmount.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Internal Summary</CardTitle>
              {getProviderBadge(selectedProvider)}
            </div>
            <CardDescription>
              Transaction data from our internal systems
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground"># Rewards</p>
              <p className="text-2xl font-bold">
                {mockInternalSummary.numRewards.toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">$ Rewards</p>
              <p className="text-2xl font-bold">
                ${(mockInternalSummary.rewardsAmount / 100).toLocaleString()}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">$ Rebate</p>
              <p className="text-2xl font-bold">
                ${mockInternalSummary.rebateAmount.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="unreconciled" className="w-full">
        <TabsList className="grid grid-cols-2 w-[400px] mb-6">
          <TabsTrigger value="unreconciled">Unreconciled Items</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="unreconciled" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Unreconciled Provider Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Unreconciled (in provider data, not internal)
                  </CardTitle>
                  {getProviderBadge(selectedProvider)}
                </div>
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold">
                        {mockSourceSummary.numRewards}
                      </span>{" "}
                      records,
                      <span className="font-semibold ml-1">
                        $
                        {(
                          mockSourceSummary.rewardsAmount / 100
                        ).toLocaleString()}
                      </span>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      Action Required
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Date (UTC)</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Reward</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>CPID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockUnreconciledProvider.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {transaction.date}
                          </TableCell>
                          <TableCell>{transaction.source}</TableCell>
                          <TableCell>{transaction.reward}</TableCell>
                          <TableCell>${transaction.value}</TableCell>
                          <TableCell>{transaction.transaction_id}</TableCell>
                          <TableCell>{transaction.cpid}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Showing all unreconciled provider records
                </div>
                <Button variant="destructive" size="sm">
                  Resolve All
                </Button>
              </CardFooter>
            </Card>

            {/* Unreconciled Internal Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Unreconciled (in internal data, not at provider)
                  </CardTitle>
                  {getProviderBadge(selectedProvider)}
                </div>
                <CardDescription>
                  <div className="flex items-center justify-between">
                    <div>No unreconciled internal records found</div>
                    <Badge
                      variant="outline"
                      className="ml-2 bg-green-50 text-green-700"
                    >
                      All Clear
                    </Badge>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                  <RefreshCw className="w-12 h-12 text-muted-foreground" />
                  <p className="text-muted-foreground max-w-md">
                    All internal transactions have been reconciled with provider
                    data.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-end border-t px-6 py-3">
                <Button variant="outline" size="sm">
                  Check Again
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Source Transaction Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Source Transaction Data</CardTitle>
                  {getProviderBadge(selectedProvider)}
                </div>
                <div className="mt-2">
                  <Input className="max-w-[250px]" placeholder="Search..." />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Created At</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>CPID</TableHead>
                        <TableHead>Transaction ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockSourceTransactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {transaction.created_at}
                          </TableCell>
                          <TableCell>{transaction.source}</TableCell>
                          <TableCell>{transaction.cpid}</TableCell>
                          <TableCell>{transaction.transaction_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Showing 1-10 of {mockSourceSummary.numRewards}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {/* Internal Transaction Data */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Internal Transaction Data</CardTitle>
                  {getProviderBadge(selectedProvider)}
                </div>
                <div className="mt-2">
                  <Input className="max-w-[250px]" placeholder="Search..." />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] w-full">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Date (UTC)</TableHead>
                        <TableHead>Src</TableHead>
                        <TableHead>CPID</TableHead>
                        <TableHead>Provider ID</TableHead>
                        <TableHead>Transaction ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockInternalTransactions.map((transaction, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {transaction.date}
                          </TableCell>
                          <TableCell>{transaction.src}</TableCell>
                          <TableCell>{transaction.cpid}</TableCell>
                          <TableCell>{transaction.provider_id}</TableCell>
                          <TableCell>{transaction.transaction_id}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
              <CardFooter className="flex items-center justify-between border-t px-6 py-3">
                <div className="text-xs text-muted-foreground">
                  Showing 1-10 of {mockInternalSummary.numRewards}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
