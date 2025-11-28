"use client";

import * as React from "react";
import { Info, Gift, Server, Clock, User, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Transaction } from "./columns";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Navigation items for the order management dialog
const orderSettings = {
  nav: [
    { name: "Overview", icon: Info },
    { name: "Member", icon: User },
  ],
  adminNav: [
    { name: "Provider Requests", icon: Server },
    { name: "Request Response", icon: FileText },
    { name: "Claim Status", icon: Clock },
  ],
};

interface ManageOrderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
}

// Extend the Transaction interface with optional properties from TransactionDetail
// to make them compatible for our displayData variable
interface ExtendedTransaction extends Transaction {
  // Original snake_case fields
  cp_transaction_reference?: string;
  cust_transaction_reference?: string;
  reward_name?: string;
  order_amount?: string | number;
  reward_id?: number;
  provider_reward_id?: string;
  provider_reference_id?: string;
  rebate_customer_amount?: string | number;
  clientName?: string;

  // Note: These properties already exist in Transaction with different types
  // We're not redefining them here, just using aliases for compatibility
}

// Interface for the transaction details API response
interface TransactionDetailsResponse {
  success: boolean;
  data: {
    transaction: TransactionDetail;
    related_requests: ApiRequest[];
  };
}

interface TransactionDetail {
  id: number;
  result: string;

  // Support both formats
  promo_id?: string | null;
  offerId?: string | null;

  reward_id?: number;
  giftcardId?: number;

  cpid: string;

  reward_type?: string | null;
  rewardType?: string | null;

  mode: string;

  fielo_transName?: string | null;
  fieloTransName?: string | null;

  entity_type?: string;
  entityType?: string;

  date: string;
  entid: number;
  memberid: number;
  metadata: string;
  poynts: number;
  ip: string;

  device_info?: string | null;
  deviceInfo?: string | null;

  provider_id?: number;
  providerId?: number;

  // Order amount can be string or number
  order_amount?: string | number;
  orderAmount?: number;

  order_provider_amount?: string | number;
  orderProviderAmount?: number;

  provider_balance?: string | number;
  providerBalance?: number | string;

  provider_balance_customer?: string | number;
  providerBalanceCustomer?: number | string;

  provider_reference_id?: string;
  providerReferenceId?: string;

  reward_name?: string;
  rewardName?: string;

  provider_reward_id?: string;
  providerRewardId?: string;

  // Rebate fields - both string and number formats
  rebate_provider_percentage?: string | number;
  rebateProviderPercentage?: number;

  rebate_provider_amount?: string | number;
  rebateProviderAmount?: number;

  rebate_base_percentage?: string | number;
  rebateBasePercentage?: number;

  rebate_base_amount?: string | number;
  rebateBaseAmount?: number;

  rebate_customer_percentage?: string | number;
  rebateCustomerPercentage?: number;

  rebate_customer_amount?: string | number;
  rebateCustomerAmount?: number;

  rebate_cp_percentage?: string | number;
  rebateCpPercentage?: number;

  rebate_cp_amount?: string | number;
  rebateCpAmount?: number;

  cp_transaction_reference?: string;
  cpTransactionReference?: string;

  cust_transaction_reference?: string;
  custTransactionReference?: string;

  message: string;
  customer_request?: string;
  customerRequest?: string;

  customer_response?: string;
  customerResponse?: string;

  reconciled: number;
  notes: string | null;

  // New fields
  cpidx?: string;
  source?: string;
  clientName?: string;
}

interface ApiRequest {
  id: number;
  request_date: string;
  direction: string;
  platform: string;
  method: string;
  endpoint: string;
  headers: string;
  body: string;
  response_code: string;
  response_headers: string;
  response_body: string;
  duration: number;
  info: string;
  reward_id: string;
  cp_transaction_reference: string;
}

// Add this interface before the sample transaction data
interface MemberTransaction {
  id: number;
  date: string;
  result: string;
  amount: string;
  poynts: number;
  reference_id: string;
}

// Sample transaction data for the member view
const memberTransactions: MemberTransaction[] = [
  {
    id: 1172032,
    date: "4/9/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250409-3378321-39",
  },
  {
    id: 1166975,
    date: "4/6/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250406-3372848-60",
  },
  {
    id: 1146591,
    date: "3/25/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250325-3348960-72",
  },
  {
    id: 1123323,
    date: "3/11/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250311-3322911-44",
  },
  {
    id: 1107980,
    date: "3/1/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250301-3304306-25",
  },
  {
    id: 1107316,
    date: "2/28/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250228-3303417-44",
  },
  {
    id: 1092317,
    date: "2/18/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250218-3285382-92",
  },
  {
    id: 1091333,
    date: "2/18/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250218-3284326-24",
  },
  {
    id: 1091332,
    date: "2/18/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250218-3284326-14",
  },
  {
    id: 1085065,
    date: "2/13/2025",
    result: "success",
    amount: "$50.00",
    poynts: 5000,
    reference_id: "RA250214-3277230-78",
  },
];

export function ManageOrder({
  isOpen,
  onOpenChange,
  transaction,
}: ManageOrderProps) {
  const [activeTab, setActiveTab] = React.useState("Overview");
  const [requestResponseTab, setRequestResponseTab] = React.useState("request");

  // Fetch transaction details using TanStack Query
  const { data: transactionDetails, isLoading } =
    useQuery<TransactionDetailsResponse>({
      queryKey: ["transactionDetails", transaction?.id],
      queryFn: async () => {
        if (!transaction?.id) {
          throw new Error("No transaction ID provided");
        }
        const response = await fetch(
          `/api/legacy/transactions/${transaction.id}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch transaction details");
        }
        return response.json();
      },
      enabled: !!transaction?.id && isOpen, // Only fetch when dialog is open and we have a transaction ID
    });

  // Extract transaction data and API requests from the response
  const transactionData = transactionDetails?.data?.transaction;
  const apiRequests = transactionDetails?.data?.related_requests || [];

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm:ss a");
    } catch (e) {
      return "Invalid date";
    }
  };

  // Function to parse JSON string safely
  const safeParseJson = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return null;
    }
  };

  // Parse metadata for gift card information
  const metadataObj = transactionData?.metadata
    ? safeParseJson(transactionData.metadata)
    : null;

  const renderContent = () => {
    if (isLoading)
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
        </div>
      );

    if (!transaction) return <div>No transaction selected</div>;

    // Use the detailed transaction data if available, otherwise fallback to the basic transaction data
    const displayData =
      transactionData || (transaction as unknown as ExtendedTransaction);

    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-8">
            {/* Order Information */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Reward Name
                    </div>
                    <div className="mt-1 text-base">
                      {displayData.reward_name ||
                        displayData.rewardName ||
                        "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Order ID
                    </div>
                    <div className="mt-1 text-base">
                      {displayData.id.toString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Client ID
                    </div>
                    <div className="mt-1 text-base font-medium">
                      {displayData.clientName || "Bank of America"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date & Time
                    </div>
                    <div className="mt-1 text-base">
                      {formatDateTime(displayData.date)}
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Order Amount
                    </div>
                    <div className="mt-1 text-base font-medium">
                      $
                      {parseFloat(
                        String(
                          displayData.order_amount ||
                            displayData.orderAmount ||
                            0,
                        ),
                      ).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </div>
                    <div className="mt-1">
                      <Badge
                        className={cn(
                          "capitalize",
                          displayData.result.toLowerCase() === "success" &&
                            "bg-green-600 hover:bg-green-700 text-white",
                          displayData.result.toLowerCase() === "failed" &&
                            "bg-destructive hover:bg-destructive",
                          displayData.result.toLowerCase() === "pending" &&
                            "border-yellow-500 text-yellow-700",
                        )}
                      >
                        {displayData.result.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      CPID
                    </div>
                    <div className="mt-1 text-base font-mono text-sm">
                      {displayData.cpid}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Member ID
                    </div>
                    <div className="mt-1 text-base">
                      {displayData.memberid.toString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Request Time
                    </div>
                    <div className="mt-1 text-base">
                      {apiRequests && apiRequests.length > 0
                        ? `${apiRequests[0].duration.toFixed(3)}s`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator before Reward Delivered */}
            <Separator className="my-2" />

            {/* Reward Delivered */}
            <div>
              <h3 className="text-lg font-medium mb-4">Reward Delivered</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      CPIDX (Extended)
                    </div>
                    <div className="mt-1 text-base font-mono text-sm">
                      {displayData.cpidx || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Provider
                    </div>
                    <div className="mt-1 text-base">
                      {displayData.source === "tango"
                        ? "Source B"
                        : displayData.source || "Source A"}
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Provider Reward ID
                    </div>
                    <div className="mt-1 text-base font-mono text-sm break-all">
                      {displayData.provider_reward_id ||
                        displayData.providerRewardId ||
                        "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Provider Reference ID
                    </div>
                    <div className="mt-1 text-base font-mono text-sm break-all">
                      {displayData.provider_reference_id ||
                        displayData.providerReferenceId ||
                        "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "Member":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member ID
                  </div>
                  <div className="mt-1 text-base font-medium">
                    {displayData.memberid.toString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Name
                  </div>
                  <div className="mt-1 text-base">John Smith</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member Status
                  </div>
                  <div className="mt-1 text-base">
                    <Badge
                      variant="outline"
                      className="bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                    >
                      Active
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </div>
                  <div className="mt-1 text-base">johnsmith@example.com</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Total Points
                  </div>
                  <div className="mt-1 text-base font-medium">25,000</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Account Created
                  </div>
                  <div className="mt-1 text-base">January 15, 2023</div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <div className="text-lg font-medium mb-4">
                Recent Transactions
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberTransactions.slice(0, 5).map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>Gift Card Reward</TableCell>
                        <TableCell>{tx.amount}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "capitalize",
                              tx.result.toLowerCase() === "success" &&
                                "bg-green-600 hover:bg-green-700 text-white",
                              tx.result.toLowerCase() === "failed" &&
                                "bg-destructive hover:bg-destructive",
                              tx.result.toLowerCase() === "pending" &&
                                "border-yellow-500 text-yellow-700",
                            )}
                          >
                            {tx.result.toLowerCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {tx.reference_id}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <div>Showing 5 transaction(s)</div>
              </div>
            </div>
          </div>
        );
      case "Provider Requests":
        return (
          <div className="space-y-4">
            {apiRequests.length === 0 ? (
              <div>No provider requests found for this transaction.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Response Code</TableHead>
                    <TableHead>Duration (s)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {apiRequests.map((request) => (
                    <TableRow
                      key={request.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium">
                        {formatDateTime(request.request_date)}
                      </TableCell>
                      <TableCell>Source B</TableCell>
                      <TableCell>{request.method}</TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            request.response_code.startsWith("2")
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-destructive hover:bg-destructive",
                          )}
                        >
                          {request.response_code}
                        </Badge>
                      </TableCell>
                      <TableCell>{request.duration.toFixed(3)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        );
      case "Request Response":
        return (
          <div className="space-y-6">
            {apiRequests.length === 0 ? (
              <div>No API requests found for this transaction.</div>
            ) : (
              <div className="space-y-4">
                <div className="mb-4 border-b">
                  <h3 className="text-lg font-medium mb-2">
                    Customer API Communication
                  </h3>
                  <Tabs
                    defaultValue="request"
                    className="w-full"
                    onValueChange={setRequestResponseTab}
                    value={requestResponseTab}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="request">
                        Customer API Request
                      </TabsTrigger>
                      <TabsTrigger value="response">
                        Customer API Response
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="request" className="mt-4 space-y-6">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-3 border-b font-medium">
                          Request Details
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Method
                              </div>
                              <div className="font-mono text-sm bg-muted p-2 rounded">
                                {apiRequests[0].method}
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Endpoint
                              </div>
                              <div className="font-mono text-sm bg-muted p-2 rounded overflow-auto">
                                -
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Request Headers
                            </div>
                            <div className="border rounded p-3 text-sm bg-gray-50 overflow-auto max-h-48 font-mono">
                              <pre className="whitespace-pre-wrap">
                                {(() => {
                                  try {
                                    const headers = JSON.parse(
                                      apiRequests[0].headers,
                                    );
                                    return JSON.stringify(headers, null, 2);
                                  } catch (e) {
                                    return apiRequests[0].headers;
                                  }
                                })()}
                              </pre>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Request Body
                            </div>
                            <div className="border rounded p-3 text-sm bg-gray-50 overflow-auto max-h-48 font-mono">
                              <pre className="whitespace-pre-wrap">
                                {(() => {
                                  try {
                                    const body = JSON.parse(
                                      apiRequests[0].body,
                                    );
                                    return JSON.stringify(body, null, 2);
                                  } catch (e) {
                                    return apiRequests[0].body;
                                  }
                                })()}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="response" className="mt-4 space-y-6">
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-muted p-3 border-b font-medium">
                          Response Details
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Status Code
                              </div>
                              <div className="font-mono text-sm">
                                <Badge
                                  className={cn(
                                    apiRequests[0].response_code.startsWith("2")
                                      ? "bg-green-600 hover:bg-green-700 text-white"
                                      : "bg-destructive hover:bg-destructive",
                                  )}
                                >
                                  {apiRequests[0].response_code}
                                </Badge>
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                Response Time
                              </div>
                              <div className="font-mono text-sm">
                                {apiRequests[0].duration.toFixed(3)}s
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Response Headers
                            </div>
                            <div className="border rounded p-3 text-sm bg-gray-50 overflow-auto max-h-48 font-mono">
                              <pre className="whitespace-pre-wrap">
                                {(() => {
                                  try {
                                    const headers = JSON.parse(
                                      apiRequests[0].response_headers,
                                    );
                                    return JSON.stringify(headers, null, 2);
                                  } catch (e) {
                                    return apiRequests[0].response_headers;
                                  }
                                })()}
                              </pre>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                              Response Body
                            </div>
                            <div className="border rounded p-3 text-sm bg-gray-50 overflow-auto max-h-48 font-mono">
                              <pre className="whitespace-pre-wrap">
                                {(() => {
                                  try {
                                    const body = JSON.parse(
                                      apiRequests[0].response_body,
                                    );
                                    return JSON.stringify(body, null, 2);
                                  } catch (e) {
                                    return apiRequests[0].response_body;
                                  }
                                })()}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>
        );
      case "Claim Status":
        return (
          <div className="space-y-4">
            {!metadataObj ? (
              <div>No gift card information available.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {metadataObj.gcClaimCode && (
                  <div className="border rounded p-4 space-y-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Claim Code
                    </div>
                    <div className="font-mono text-sm break-all">
                      {metadataObj.gcClaimCode}
                    </div>
                  </div>
                )}
                {metadataObj.gcId && (
                  <div className="border rounded p-4 space-y-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      GC ID
                    </div>
                    <div className="font-mono text-sm break-all">
                      {metadataObj.gcId}
                    </div>
                  </div>
                )}
                {metadataObj.cardInfo?.cardStatus && (
                  <div className="border rounded p-4 space-y-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Card Status
                    </div>
                    <div className="capitalize">
                      {metadataObj.cardInfo.cardStatus.toLowerCase()}
                    </div>
                  </div>
                )}
                {metadataObj.cardInfo?.value && (
                  <div className="border rounded p-4 space-y-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Value
                    </div>
                    <div>
                      {metadataObj.cardInfo.value.amount}{" "}
                      {metadataObj.cardInfo.value.currencyCode}
                    </div>
                  </div>
                )}
                {metadataObj.status && (
                  <div className="border rounded p-4 space-y-2">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </div>
                    <div className="capitalize">
                      {metadataObj.status.toLowerCase()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">Order Details</DialogTitle>
        <DialogDescription className="sr-only">
          View detailed information about this order.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent className="pt-7">
                  <SidebarMenu>
                    {orderSettings.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === activeTab}
                          onClick={() => setActiveTab(item.name)}
                        >
                          <button className="w-full">
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <Separator className="my-4 w-4/5 mx-auto" />
              <div className="px-4 py-1">
                <span className="text-xs font-medium text-muted-foreground">
                  CP Admin Only
                </span>
              </div>

              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {orderSettings.adminNav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          isActive={item.name === activeTab}
                          onClick={() => setActiveTab(item.name)}
                        >
                          <button className="w-full">
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </button>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[680px] flex-1 flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Transactions</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {transaction
                        ? `Order #${transaction.id} - ${transaction.rewardName}`
                        : "Order Details"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <div className="flex-1 overflow-y-auto p-6">{renderContent()}</div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
