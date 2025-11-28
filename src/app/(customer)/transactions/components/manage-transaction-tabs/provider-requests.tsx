"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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

interface ProviderRequestsProps {
  apiRequests: ApiRequest[];
}

export function ProviderRequests({ apiRequests }: ProviderRequestsProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(new Set());

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm:ss a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const toggleRow = (requestId: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (expandedRows.has(requestId)) {
      newExpandedRows.delete(requestId);
    } else {
      newExpandedRows.add(requestId);
    }
    setExpandedRows(newExpandedRows);
  };

  const safeParseJson = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return jsonString; // Return as string if not valid JSON
    }
  };

  return (
    <div className="space-y-4">
      {apiRequests.length === 0 ? (
        <div>No provider requests found for this transaction.</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Response Code</TableHead>
              <TableHead>Duration (s)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiRequests.map((request) => (
              <React.Fragment key={request.id}>
                <TableRow className="hover:bg-muted/50">
                  <TableCell className="w-8">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => toggleRow(request.id)}
                    >
                      {expandedRows.has(request.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatDateTime(request.request_date)}
                  </TableCell>
                  <TableCell>{request.platform || "Unknown"}</TableCell>
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
                {expandedRows.has(request.id) && (
                  <TableRow>
                    <TableCell colSpan={6} className="p-0">
                      <div className="bg-muted/30 p-4 space-y-4">
                        {/* Endpoint - Full Width */}
                        <div>
                          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            Endpoint
                          </div>
                          <div className="text-xs font-mono">
                            {request.method} {request.endpoint}
                          </div>
                        </div>

                        {/* Request/Response Tabs */}
                        <Tabs defaultValue="request" className="w-full">
                          <TabsList className="grid w-1/2 grid-cols-2">
                            <TabsTrigger value="request">Request Body</TabsTrigger>
                            <TabsTrigger value="response">Response Body</TabsTrigger>
                          </TabsList>
                          <TabsContent value="request" className="mt-4 w-full">
                            {request.body ? (
                              <pre className="text-xs font-mono bg-background p-2 rounded border overflow-auto max-h-64">
                                {JSON.stringify(safeParseJson(request.body), null, 2)}
                              </pre>
                            ) : (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                No request body
                              </div>
                            )}
                          </TabsContent>
                          <TabsContent value="response" className="mt-4 w-full">
                            {request.response_body ? (
                              <pre className="text-xs font-mono bg-background p-2 rounded border overflow-auto max-h-64">
                                {JSON.stringify(safeParseJson(request.response_body), null, 2)}
                              </pre>
                            ) : (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                No response body
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}