"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useQueryClient } from "@tanstack/react-query";

import { BaseTabProps } from "./types";
import { generateCpidx } from "./cpidx-utils";

interface DetailsTabProps extends BaseTabProps {
  languageInput: string;
  setLanguageInput: (value: string) => void;
  redemptionUrlInput: string;
  setRedemptionUrlInput: (value: string) => void;
  customIdInput: string;
  setCustomIdInput: (value: string) => void;
  rebateValueInput: string;
  setRebateValueInput: (value: string) => void;
  startDateInput: string;
  setStartDateInput: (value: string) => void;
  endDateInput: string;
  setEndDateInput: (value: string) => void;
  isDirty: boolean;
  brandNameInput: string;
  valueInput: string;
}

export function DetailsTab({
  offerData,
  selectedOffer,
  isCreateMode = false,
  canManageRewards,
  isSaving,
  setIsSaving,
  redemptionId,
  languageInput,
  setLanguageInput,
  redemptionUrlInput,
  setRedemptionUrlInput,
  customIdInput,
  setCustomIdInput,
  rebateValueInput,
  setRebateValueInput,
  startDateInput,
  setStartDateInput,
  endDateInput,
  setEndDateInput,
  isDirty,
  brandNameInput,
  valueInput,
}: DetailsTabProps) {
  const queryClient = useQueryClient();
  const displayOffer = offerData || selectedOffer;

  // Store the random string in a ref so it doesn't change on rerender/language change
  const randomRef = React.useRef<string>("");
  if (!randomRef.current) {
    // Only generate once per mount
    randomRef.current = generateCpidx({
      brandName: "RANDOM", // dummy brand, will be replaced
      language: "EN", // dummy language, will be replaced
      value: 1, // dummy value, will be replaced
    }).split("-").pop() || "";
  }

  // Generate CPIDx using the fixed random string
  const autoCpidx = (() => {
    // Use the helper to get the brand slug and other parts
    const prefix = "OC";
    const brandSlug = (brandNameInput || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const brandPart = brandSlug.length < 5 ? "" : brandSlug.slice(0, 10);
    const lang = (languageInput || "EN").toUpperCase();
    const val = typeof valueInput === "string" ? parseFloat(valueInput) : valueInput;
    const valuePart = isNaN(val) ? "0" : String(Math.round(val));
    const random = randomRef.current;
    if (!brandPart) return "";
    return `${prefix}-${brandPart}-${lang}-${valuePart}-${random}`;
  })();

  return (
    <div className="space-y-6">
      {/* Status and Identifiers Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cpid">CPIDx</Label>
          <Input
            id="cpid"
            value={displayOffer?.cpid || (autoCpidx ? `${autoCpidx} (auto generated)` : "")}
            disabled
            className="bg-muted"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select
            value={languageInput}
            onValueChange={(value) => setLanguageInput(value)}
            disabled={!canManageRewards}
          >
            <SelectTrigger
              className={cn(
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
            >
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EN">English</SelectItem>
              <SelectItem value="ES">Spanish</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="redemption_url">Redemption URL</Label>
          <Input
            id="redemption_url"
            value={redemptionUrlInput}
            onChange={(e) => setRedemptionUrlInput(e.target.value)}
            disabled={!canManageRewards}
            className={cn(
              !canManageRewards && "opacity-60 cursor-not-allowed bg-background"
            )}
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="custom_id">Custom ID (SKU)</Label>
            <Input
              id="custom_id"
              value={customIdInput}
              onChange={(e) => setCustomIdInput(e.target.value)}
              disabled={!canManageRewards}
              className={cn(
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="Enter custom ID or SKU..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rebate_value">Rebate Value (%)</Label>
            <Input
              id="rebate_value"
              type="number"
              step="0.01"
              value={rebateValueInput}
              onChange={(e) => setRebateValueInput(e.target.value)}
              onBlur={(e) => {
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setRebateValueInput(value.toFixed(2));
                } else if (e.target.value === "") {
                  setRebateValueInput("");
                }
              }}
              disabled={!canManageRewards}
              className={cn(
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Dates Section */}
      <div className="space-y-2">
        <h3 className="text-base font-medium">Availability</h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={startDateInput}
              onChange={(e) => setStartDateInput(e.target.value)}
              disabled={!canManageRewards}
              className={cn(
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={endDateInput}
              onChange={(e) => setEndDateInput(e.target.value)}
              disabled={!canManageRewards}
              className={cn(
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
            />
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          NOTE: Offer will not be shown in catalogs past the end date passes
          regardless status.
        </p>
      </div>

      {/* Save Button - only show in edit mode */}
      {!isCreateMode && (
        <div className="flex justify-start pt-4">
          <Button
            variant="default"
            size="default"
            disabled={isSaving || !canManageRewards || !isDirty}
            onClick={async () => {
            try {
              setIsSaving(true);

              if (isCreateMode) {
                // Create mode - details data will be saved with the offer
                console.log("Details data for create mode:", {
                  language: languageInput,
                  redemptionUrl: redemptionUrlInput,
                  customId: customIdInput,
                  rebateValue: rebateValueInput,
                  startDate: startDateInput,
                  endDate: endDateInput,
                });
              } else {
                // Update existing offer details data
                const payload = {
                  language: languageInput,
                  redemptionUrl: redemptionUrlInput,
                  customId: customIdInput,
                  rebateValue: rebateValueInput
                    ? Number(rebateValueInput)
                    : null,
                  startDate: startDateInput || null,
                  endDate: endDateInput || null,
                };

                const response = await fetch(
                  `/api/rewards/offers/${redemptionId}`,
                  {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  }
                );

                if (response.ok) {
                  // Refresh the offer data
                  queryClient.invalidateQueries({
                    queryKey: ["offer", redemptionId],
                  });
                  // Also refresh the rewards list
                  queryClient.invalidateQueries({
                    queryKey: ["rewards"],
                  });
                } else {
                  console.error("Failed to update details information");
                }
              }
            } catch (error) {
              console.error("Error saving details information:", error);
            } finally {
              setIsSaving(false);
            }
          }}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Details"
          )}
          </Button>
        </div>
      )}
    </div>
  );
}
