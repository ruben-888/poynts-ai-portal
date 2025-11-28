"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemberTransaction {
  id: number;
  date: string;
  result: string;
  amount: string;
  poynts: number;
  reference_id: string;
  reward_name?: string;
  cpid: string;
}

interface MemberRole {
  member_roleid: number;
  roleid: number;
  roleStatus: number;
  entid: number;
  skill?: string;
  enterprise: {
    ent_id: number;
    ent_name: string;
    ent_desc: string;
    ent_type: string;
    ent_status: string;
    ent_phone?: string;
    ent_address?: string;
    ent_city?: string;
    ent_state?: string;
    ent_zip?: string;
  };
}

interface MemberData {
  memberid: number;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  gender?: string;
  status?: string;
  mode?: string;
  dateCreated?: string;
  dateUpdated?: string;
  dateOfBirth?: string;
  memberRoles?: MemberRole[];
  recentTransactions?: MemberTransaction[];
}

interface MemberProps {
  memberData?: MemberData;
  displayData?: any; // fallback for existing transaction data
  onTransactionClick?: (transactionId: number) => void;
}

export function Member({ memberData, displayData, onTransactionClick }: MemberProps) {
  // Use memberData if available, otherwise fall back to displayData
  const member = memberData || displayData;
  const transactions = memberData?.recentTransactions || [];

  const formatMemberName = () => {
    if (member?.name) {
      return member.name;
    }
    return "N/A";
  };

  const truncateCPID = (cpid: string) => {
    if (!cpid || cpid === "N/A") return cpid;
    const parts = cpid.split('-');
    return parts.length >= 4 ? parts.slice(0, 4).join('-') : cpid;
  };

  const getPrimaryEnterprise = () => {
    if (member?.memberRoles && member.memberRoles.length > 0) {
      // Get the first active role's enterprise
      const activeRole = member.memberRoles.find(role => role.roleStatus === 1);
      return activeRole?.enterprise || member.memberRoles[0]?.enterprise;
    }
    return null;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Three columns layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Column 1: Member ID, Client */}
        <div className="space-y-5">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Member ID
            </div>
            <div className="mt-1 text-base">
              {member?.memberid?.toString() || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Client
            </div>
            <div className="mt-1 text-base">
              {getPrimaryEnterprise() ? 
                `${getPrimaryEnterprise()?.ent_name} (${getPrimaryEnterprise()?.ent_id})` : 
                "N/A"
              }
            </div>
          </div>
        </div>

        {/* Column 2: Name, Status */}
        <div className="space-y-5">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Name
            </div>
            <div className="mt-1 text-base">{formatMemberName()}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Status
            </div>
            <div className="mt-1 text-base">
              <Badge
                variant="outline"
                className={cn(
                  member?.status === "active"
                    ? "bg-green-50 text-green-700 hover:bg-green-50 border-green-200"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-50 border-gray-200"
                )}
              >
                {member?.status || "Unknown"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Column 3: Created, Mode */}
        <div className="space-y-5">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Created
            </div>
            <div className="mt-1 text-base">{formatDate(member?.dateCreated)}</div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Mode
            </div>
            <div className="mt-1 text-base">
              <Badge
                variant="outline"
                className={cn(
                  member?.mode === "live"
                    ? "bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200"
                    : "bg-orange-50 text-orange-700 hover:bg-orange-50 border-orange-200"
                )}
              >
                {member?.mode || "N/A"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Email row above Recent Transactions */}
      <div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
          Email
        </div>
        <div className="mt-1 text-base">{member?.email || "N/A"}</div>
      </div>

      <div>
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
          Recent Transactions
        </div>
        {transactions.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-8">
            No recent transactions found for this member.
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>CPID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.slice(0, 10).map((tx) => (
                  <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onTransactionClick?.(tx.id)}>
                    <TableCell>{tx.date}</TableCell>
                    <TableCell className="font-mono text-sm">{truncateCPID(tx.cpid)}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {tx.reference_id}
                    </TableCell>
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
                    <TableCell className="w-8">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onTransactionClick?.(tx.id);
                        }}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
          <div>Showing {Math.min(transactions.length, 10)} transaction(s)</div>
        </div>
      </div>
    </div>
  );
}