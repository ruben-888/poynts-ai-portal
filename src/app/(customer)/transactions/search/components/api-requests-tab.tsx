"use client";

/**
 * ApiRequestsTab Component
 *
 * This component fetches and displays API request logs related to a specific transaction.
 * It uses the cp_transaction_reference to filter requests from the request_log table.
 *
 * Features:
 * - Fetches API requests using React Query based on the transaction reference
 * - Displays a table of API requests with timestamp, endpoint, method, direction, status, and duration
 * - Shows loading state with skeletons when data is being fetched
 * - Displays error state when there's an issue with the API request
 * - Shows empty state when no requests are found for the transaction
 * - Displays the raw request and response data for the latest API request
 * - Handles JSON parsing with error handling for both request and response data
 *
 * @param {string | null} cpTransactionReference - The transaction reference to filter API requests
 */

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ApiRequest {
  id: number;
  platform: string;
  direction: string;
  method: string;
  endpoint: string;
  request_date: string;
  response_date: string | null;
  status_code: number | null;
  cp_transaction_reference: string | null;
  request_data: string;
  response_data: string | null;
}

interface ApiRequestsTabProps {
  cpTransactionReference: string | null;
}

export function ApiRequestsTab({
  cpTransactionReference,
}: ApiRequestsTabProps) {
  // Fetch API requests using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ["requestLogs", cpTransactionReference],
    queryFn: async () => {
      if (!cpTransactionReference) {
        return { data: [] };
      }
      const response = await axios.get(
        `/api/legacy/request-log?cp_transaction_reference=${cpTransactionReference}`,
      );
      return response.data;
    },
    enabled: !!cpTransactionReference, // Only run the query if cpTransactionReference is available
  });

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm:ss a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const calculateDuration = (
    requestDate: string,
    responseDate: string | null,
  ) => {
    if (!responseDate) return "N/A";
    try {
      const start = new Date(requestDate).getTime();
      const end = new Date(responseDate).getTime();
      return `${end - start} ms`;
    } catch (e) {
      return "N/A";
    }
  };

  const apiRequests: ApiRequest[] = data?.data || [];
  const latestRequest = apiRequests.length > 0 ? apiRequests[0] : null;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">API Activity Log</h3>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">API Activity Log</h3>
        <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
          Error loading API requests. Please try again later.
        </div>
      </div>
    );
  }

  if (apiRequests.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">API Activity Log</h3>
        <div className="p-4 border rounded-md bg-gray-50 text-gray-500 flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          No API requests found for this transaction.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">API Activity Log</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Duration</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {apiRequests.map((request) => (
            <TableRow key={request.id}>
              <TableCell>{formatDateTime(request.request_date)}</TableCell>
              <TableCell className="font-mono text-xs">
                {request.endpoint}
              </TableCell>
              <TableCell>{request.method}</TableCell>
              <TableCell>{request.direction}</TableCell>
              <TableCell>
                {request.status_code && (
                  <Badge
                    className={cn(
                      request.status_code >= 200 && request.status_code < 300
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-destructive hover:bg-destructive",
                    )}
                  >
                    {request.status_code}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {calculateDuration(request.request_date, request.response_date)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {latestRequest && (
        <div className="space-y-4 pt-4">
          <div>
            <h4 className="text-md font-medium mb-2">Latest Request</h4>
            <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">
              {(() => {
                try {
                  return JSON.stringify(
                    JSON.parse(latestRequest.request_data),
                    null,
                    2,
                  );
                } catch (e) {
                  // If not valid JSON, just return the raw string
                  return latestRequest.request_data;
                }
              })()}
            </pre>
          </div>

          <div>
            <h4 className="text-md font-medium mb-2">Latest Response</h4>
            <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-x-auto">
              {latestRequest.response_data
                ? (() => {
                    try {
                      return JSON.stringify(
                        JSON.parse(latestRequest.response_data),
                        null,
                        2,
                      );
                    } catch (e) {
                      // If not valid JSON, just return the raw string
                      return latestRequest.response_data;
                    }
                  })()
                : "No response data available"}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
