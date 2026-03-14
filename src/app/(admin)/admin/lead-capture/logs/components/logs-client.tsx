"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { DataTable } from "@/components/data-table/data-table";
import { fetchLogs } from "../../lib/api";
import type { LeadCaptureLog } from "../../lib/schemas";
import { createLogsColumns } from "./logs-columns";
import { LogDetailDialog } from "./log-detail-dialog";

export default function LogsClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<LeadCaptureLog | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["lead-capture-logs"],
    queryFn: () => fetchLogs({ limit: 200 }),
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const handleViewLog = (log: LeadCaptureLog) => {
    setSelectedLog(log);
    setDetailOpen(true);
  };

  const handleRowDoubleClick = (row: { original: LeadCaptureLog }) => {
    handleViewLog(row.original);
  };

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : "Failed to load logs"}
        </AlertDescription>
      </Alert>
    );
  }

  const logs = data?.data ?? [];

  return (
    <div className="container mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Lead Capture Logs</h1>
        <p className="text-muted-foreground">View pipeline execution logs. Double-click a row for details.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <DataTable
          columns={createLogsColumns(handleViewLog)}
          data={logs}
          searchColumn={{
            id: "email",
            placeholder: "Search logs by email...",
          }}
          searchableColumns={[
            { id: "email", displayName: "Email" },
            { id: "first_name", displayName: "Name" },
          ]}
          filters={[
            {
              id: "status",
              title: "Status",
              options: [
                { value: "pending", label: "Pending" },
                { value: "ai_complete", label: "AI Complete" },
                { value: "reward_sent", label: "Reward Sent" },
                { value: "failed", label: "Failed" },
                { value: "test", label: "Test" },
              ],
            },
          ]}
          enableRowSelection={false}
          enableRefresh={true}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing || isLoading}
          onRowDoubleClick={handleRowDoubleClick}
          initialPageSize={25}
        />
      )}

      <LogDetailDialog
        log={selectedLog}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </div>
  );
}
