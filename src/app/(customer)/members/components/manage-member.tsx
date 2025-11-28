"use client";

import * as React from "react";
import {
  Info,
  CreditCard,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  Activity,
  FileText,
} from "lucide-react";
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
import { Member } from "./columns";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Navigation items for the member management dialog
const memberSettings = {
  nav: [
    { name: "Overview", icon: Info },
    { name: "Details", icon: FileText },
    { name: "Transactions", icon: CreditCard },
    { name: "Activity", icon: Clock },
  ],
};

interface ManageMemberProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  member: Member | null;
}

// Sample transaction data for the member
const sampleTransactions = [
  {
    id: 1172032,
    date: "4/9/2023",
    type: "Gift Card",
    rewardName: "Amazon Gift Card",
    amount: "$50.00",
    poynts: 5000,
    result: "success",
    reference_id: "RA230409-3378321-39",
  },
  {
    id: 1166975,
    date: "4/6/2023",
    type: "Gift Card",
    rewardName: "Walmart Gift Card",
    amount: "$25.00",
    poynts: 2500,
    result: "success",
    reference_id: "RA230406-3372848-60",
  },
  {
    id: 1146591,
    date: "3/25/2023",
    type: "Offer",
    rewardName: "10% Cash Back Offer",
    amount: "$15.00",
    poynts: 1500,
    result: "pending",
    reference_id: "RA230325-3352145-22",
  },
  {
    id: 1136482,
    date: "3/12/2023",
    type: "Gift Card",
    rewardName: "Target Gift Card",
    amount: "$100.00",
    poynts: 10000,
    result: "success",
    reference_id: "RA230312-3342982-14",
  },
  {
    id: 1126371,
    date: "2/28/2023",
    type: "Offer",
    rewardName: "5% Cash Back Offer",
    amount: "$7.50",
    poynts: 750,
    result: "failed",
    reference_id: "RA230228-3332871-55",
  },
];

// Sample activity data for the member
const sampleActivities = [
  {
    id: 1,
    date: "5/15/2023",
    time: "9:32 AM",
    type: "Account",
    activity: "Member created",
    description: "Account was created via web portal",
  },
  {
    id: 2,
    date: "5/15/2023",
    time: "9:45 AM",
    type: "Login",
    activity: "First login",
    description: "Member logged in for the first time",
  },
  {
    id: 3,
    date: "5/16/2023",
    time: "2:15 PM",
    type: "Rewards",
    activity: "Catalog viewed",
    description: "Member browsed the rewards catalog",
  },
  {
    id: 4,
    date: "5/18/2023",
    time: "11:03 AM",
    type: "Points",
    activity: "Points earned",
    description: "Earned 500 points from purchase at Store A",
  },
  {
    id: 5,
    date: "5/20/2023",
    time: "3:47 PM",
    type: "Profile",
    activity: "Profile updated",
    description: "Member updated their address information",
  },
  {
    id: 6,
    date: "5/22/2023",
    time: "10:28 AM",
    type: "Rewards",
    activity: "Reward redeemed",
    description: "Amazon Gift Card redemption",
  },
  {
    id: 7,
    date: "5/25/2023",
    time: "1:15 PM",
    type: "Login",
    activity: "Mobile login",
    description: "Member logged in via mobile app",
  },
  {
    id: 8,
    date: "5/28/2023",
    time: "4:32 PM",
    type: "Points",
    activity: "Points redeemed",
    description: "Redeemed 5000 points for a reward",
  },
];

// Sample rewards summary data
const rewardsSummary = {
  totalRewards: 15,
  redeemedRewards: 12,
  activeRewards: 3,
  totalPoints: 35000,
  pointsSpent: 27500,
  pointsAvailable: 7500,
  favoriteGiftCards: [
    { name: "Amazon", count: 5, totalValue: "$250" },
    { name: "Starbucks", count: 3, totalValue: "$75" },
    { name: "Target", count: 2, totalValue: "$100" },
  ],
  favoriteOffers: [
    { name: "Cash Back Offer", count: 4, type: "Rebate" },
    { name: "Exclusive Event Access", count: 2, type: "Experience" },
    { name: "Premium Subscription", count: 1, type: "Service" },
  ],
  mostRecentReward: "Amazon Gift Card ($50)",
  mostRecentDate: "4/9/2023",
};

export function ManageMember({
  isOpen,
  onOpenChange,
  member,
}: ManageMemberProps) {
  const [activeTab, setActiveTab] = React.useState("Overview");

  // Format date function
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };

  const renderContent = () => {
    if (!member) return <div>No member selected</div>;

    switch (activeTab) {
      case "Overview":
        return (
          <div className="space-y-8">
            {/* Member Information */}
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Member Name
                    </div>
                    <div className="mt-1 text-base font-medium">
                      {member.name || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Member ID
                    </div>
                    <div className="mt-1 text-base">{member.id.toString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Customer ID
                    </div>
                    <div className="mt-1 text-base">
                      {member.customerMemberId}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Client
                    </div>
                    <div className="mt-1 text-base">
                      {member.clientName || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Email
                    </div>
                    <div className="mt-1 text-base">
                      {member.email || "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Phone
                    </div>
                    <div className="mt-1 text-base">
                      {member.mPhone || "N/A"}
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
                          member.status.toLowerCase() === "active" &&
                            "bg-green-600 hover:bg-green-700 text-white",
                          member.status.toLowerCase() === "suspended" &&
                            "bg-destructive hover:bg-destructive",
                          member.status.toLowerCase() === "pending" &&
                            "border-yellow-500 text-yellow-700"
                        )}
                      >
                        {member.status.toLowerCase()}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Date Created
                    </div>
                    <div className="mt-1 text-base">
                      {formatDateTime(member.createDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Rewards & Behavior Summary */}
            <Separator className="my-2" />
            <div>
              <h3 className="text-lg font-medium mb-4">
                Rewards & Behavior Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rewards Stats */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Rewards Stats
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-3xl font-bold">
                        {rewardsSummary.totalRewards}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Total Rewards
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-3xl font-bold">
                        {rewardsSummary.redeemedRewards}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Redeemed
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-3xl font-bold">
                        {rewardsSummary.pointsAvailable.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Available Points
                      </div>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg">
                      <div className="text-3xl font-bold">
                        {rewardsSummary.pointsSpent.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Points Spent
                      </div>
                    </div>
                  </div>
                </div>

                {/* Favorite Gift Cards */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Favorite Gift Cards
                  </h4>
                  <div className="space-y-2">
                    {rewardsSummary.favoriteGiftCards.map((card, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <div>
                          <div className="font-medium">{card.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Total: {card.totalValue}
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {card.count} × redeemed
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="text-xs text-right text-muted-foreground">
                    Last redeemed: {rewardsSummary.mostRecentReward} on{" "}
                    {rewardsSummary.mostRecentDate}
                  </div>
                </div>

                {/* Favorite Offers */}
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Favorite Offers
                  </h4>
                  <div className="space-y-2">
                    {rewardsSummary.favoriteOffers.map((offer, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <div>
                          <div className="font-medium">{offer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Type: {offer.type}
                          </div>
                        </div>
                        <Badge variant="outline">
                          {offer.count} × redeemed
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="bg-muted/30 p-3 rounded-lg mt-3">
                    <div className="text-sm font-medium">Spending Pattern</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Primarily redeems gift cards (70%) with occasional special
                      offers (30%)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Details":
        return (
          <div className="space-y-8">
            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Address
                    </div>
                    <div className="mt-1 text-base">N/A</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      City
                    </div>
                    <div className="mt-1 text-base">N/A</div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      State
                    </div>
                    <div className="mt-1 text-base">N/A</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      ZIP
                    </div>
                    <div className="mt-1 text-base">{member.zip || "N/A"}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Separator before Account Information */}
            <Separator className="my-2" />

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Account Number
                    </div>
                    <div className="mt-1 text-base">N/A</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Username
                    </div>
                    <div className="mt-1 text-base">N/A</div>
                  </div>
                </div>
                <div className="space-y-5">
                  <div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Mode
                    </div>
                    <div className="mt-1">
                      <Badge
                        variant={member.mode === "live" ? "default" : "outline"}
                        className="capitalize"
                      >
                        {member.mode}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "Transactions":
        return (
          <div className="space-y-6">
            <div className="pt-2">
              <div className="text-lg font-medium mb-4">
                Recent Transactions
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reward</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell>{tx.type}</TableCell>
                        <TableCell>{tx.rewardName}</TableCell>
                        <TableCell>{tx.amount}</TableCell>
                        <TableCell>{tx.poynts}</TableCell>
                        <TableCell>
                          <Badge
                            className={cn(
                              "capitalize",
                              tx.result.toLowerCase() === "success" &&
                                "bg-green-600 hover:bg-green-700 text-white",
                              tx.result.toLowerCase() === "failed" &&
                                "bg-destructive hover:bg-destructive",
                              tx.result.toLowerCase() === "pending" &&
                                "border-yellow-500 text-yellow-700"
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
                <div>Showing {sampleTransactions.length} transaction(s)</div>
              </div>
            </div>
          </div>
        );
      case "Activity":
        return (
          <div className="space-y-6">
            <div className="pt-2">
              <div className="text-lg font-medium mb-4">
                Member Activity History
              </div>
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sampleActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell>{activity.date}</TableCell>
                        <TableCell>{activity.time}</TableCell>
                        <TableCell className="font-medium">
                          {activity.activity}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {activity.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {activity.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                <div>Showing {sampleActivities.length} activities</div>
                <div className="text-primary hover:underline cursor-pointer">
                  View all activities
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[700px] md:max-w-[900px] lg:max-w-[1000px]">
        <DialogTitle className="sr-only">Member Details</DialogTitle>
        <DialogDescription className="sr-only">
          View detailed information about this member.
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent className="pt-7">
                  <SidebarMenu>
                    {memberSettings.nav.map((item) => (
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
                    <BreadcrumbLink href="#">Members</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>
                      {member
                        ? `Member #${member.id} - ${member.name}`
                        : "Member Details"}
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
