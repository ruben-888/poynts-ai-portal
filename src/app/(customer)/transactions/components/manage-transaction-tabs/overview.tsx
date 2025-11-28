import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Pencil, Save, X } from "lucide-react";
import { useState } from "react";

interface OverviewProps {
  displayData: any;
  apiRequests: any[];
}

export function Overview({ displayData, apiRequests }: OverviewProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(displayData.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy h:mm:ss a");
    } catch (e) {
      return "Invalid date";
    }
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/transactions/${displayData.id}/notes`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes: notesValue }),
      });

      if (response.ok) {
        setIsEditingNotes(false);
        // Update the displayData with new notes value
        displayData.notes = notesValue;
      } else {
        console.error("Failed to save notes");
      }
    } catch (error) {
      console.error("Error saving notes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setNotesValue(displayData.notes || "");
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-8">
      {/* Order Information */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-5">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Date & Time
              </div>
              <div className="mt-1 text-base font-mono text-sm">
                {formatDateTime(displayData.date)}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Order Amount
              </div>
              <div className="mt-1 text-base">
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
          </div>
          <div className="space-y-5">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Reward Name
              </div>
              <div className="mt-1 text-base font-mono text-sm">
                {displayData.reward_name ||
                  displayData.rewardName ||
                  "N/A"}
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
          </div>
          <div className="space-y-5">
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                CPID
              </div>
              <div className="mt-1 text-base font-mono text-sm">
                {(() => {
                  const cpidValue = displayData.cpidx || displayData.cpid || displayData.CPIDX || displayData.CPID;
                  if (!cpidValue) return "N/A";
                  const parts = cpidValue.split('-');
                  return parts.length >= 4 ? parts.slice(0, 4).join('-') : cpidValue;
                })()}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Client
              </div>
              <div className="mt-1 text-base">
                {displayData.clientName || "Bank of America"} ({displayData.entid || "N/A"})
              </div>
            </div>
          </div>
        </div>
        
        {/* Order ID and Customer Reference ID row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-5">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Order ID
            </div>
            <div className="mt-1 text-base font-mono text-sm">
              {displayData.cp_transaction_reference || displayData.cpTransactionReference || "N/A"}
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              External ID
            </div>
            <div className="mt-1 text-base font-mono text-sm break-all">
              {displayData.cust_transaction_reference || displayData.custTransactionReference || "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Separator before Reward Delivered */}
      <Separator className="my-2" />

      {/* Reward Delivered */}
      <div>
        <h3 className="text-lg font-medium mb-4">Reward Delivered</h3>
        
        {/* Row 1: CPIDX, Source, Request Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-5">
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              CPIDX
            </div>
            <div className="mt-1 text-base font-mono text-sm">
              {displayData.cpidx || displayData.cpid || displayData.CPIDX || displayData.CPID || "N/A"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Source
            </div>
            <div className="mt-1 text-base">
              {displayData.source === "tango" ? "B" : "A"}
            </div>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Duration
            </div>
            <div className="mt-1 text-base">
              {apiRequests && apiRequests.length > 0
                ? `${apiRequests[0].duration.toFixed(3)}s`
                : "N/A"}
            </div>
          </div>
        </div>
        
        {/* Row 2: Provider Reward ID, Provider Ref ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              Provider Ref ID
            </div>
            <div className="mt-1 text-base font-mono text-sm break-all">
              {displayData.provider_reference_id ||
                displayData.providerReferenceId ||
                "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Separator before Notes */}
      <Separator className="my-2" />

      {/* Notes Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Notes</h3>
          {isEditingNotes ? (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="h-8 w-8 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNotes(true)}
              className="h-8 w-8 p-0"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
        </div>
        {isEditingNotes ? (
          <Textarea
            value={notesValue}
            onChange={(e) => setNotesValue(e.target.value)}
            placeholder="Enter notes..."
            className="min-h-[100px]"
            disabled={isSaving}
          />
        ) : (
          <div className="text-base">
            {displayData.notes || "-"}
          </div>
        )}
      </div>
    </div>
  );
}