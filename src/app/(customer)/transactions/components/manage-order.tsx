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
import { Overview } from "./manage-transaction-tabs/overview";
import { RequestResponse } from "./manage-transaction-tabs/request-response";
import { Member } from "./manage-transaction-tabs/member";
import { ProviderRequests } from "./manage-transaction-tabs/provider-requests";

// Navigation items for the order management dialog
const orderSettings = {
  nav: [
    { name: "Overview", icon: Info },
    { name: "Member", icon: User },
  ],
  adminNav: [
    { name: "Request Response", icon: FileText },
    { name: "Provider Requests", icon: Server },
  ],
};

interface ManageOrderProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onTransactionChange?: (transaction: Transaction) => void;
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

// Interface for the transaction details API response from the complete endpoint
interface TransactionDetailsResponse {
  success: boolean;
  data: {
    transaction: TransactionDetail;
    request_logs: ApiRequest[];
  };
  meta: {
    request_logs_meta: {
      total: number;
      limit: number;
      offset: number;
      hasMore: boolean;
    };
    request_logs_count: number;
  };
  timestamp: string;
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


export function ManageOrder({
  isOpen,
  onOpenChange,
  transaction,
  onTransactionChange,
}: ManageOrderProps) {
  const [activeTab, setActiveTab] = React.useState("Overview");

  // Reset to Overview tab when transaction changes
  React.useEffect(() => {
    if (transaction) {
      setActiveTab("Overview");
    }
  }, [transaction?.id]);

  const handleTransactionClick = (transactionId: number) => {
    // Create a new transaction object with the clicked transaction ID
    const newTransaction = { id: transactionId } as Transaction;
    // Update the transaction in the parent component
    onTransactionChange?.(newTransaction);
  };

  // Fetch transaction details using TanStack Query
  const { data: transactionDetails, isLoading } =
    useQuery<TransactionDetailsResponse>({
      queryKey: ["transactionDetails", transaction?.id],
      queryFn: async () => {
        if (!transaction?.id) {
          throw new Error("No transaction ID provided");
        }
        const response = await fetch(
          `/api/transactions/${transaction.id}`,
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
  const apiRequests = transactionDetails?.data?.request_logs || [];

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
        return <Overview displayData={displayData} apiRequests={apiRequests} />;
      case "Member":
        return <Member memberData={transactionDetails?.data?.member} displayData={displayData} onTransactionClick={handleTransactionClick} />;
      case "Provider Requests":
        return <ProviderRequests apiRequests={apiRequests} />;
      case "Request Response":
        return <RequestResponse apiRequests={apiRequests} transactionData={displayData} />;
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
