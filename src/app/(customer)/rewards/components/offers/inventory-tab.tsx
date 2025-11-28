"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";

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

import { BaseTabProps } from "./types";

interface InventoryTabProps extends BaseTabProps {
  inventoryTypeInput: string;
  setInventoryTypeInput: (value: string) => void;
  limitTypeInput: string;
  setLimitTypeInput: (value: string) => void;
  usageLimitInput: string;
  setUsageLimitInput: (value: string) => void;
  singleCodeInput: string;
  setSingleCodeInput: (value: string) => void;
  multipleCodesInput: string;
  setMultipleCodesInput: (value: string) => void;
  isDirty: boolean;
  initialData?: {
    inventoryType: string;
    limitType: string;
    usageLimit: string;
    singleCode: string;
    multipleCodes: string;
  } | null;
  setInitialData?: (data: {
    inventoryType: string;
    limitType: string;
    usageLimit: string;
    singleCode: string;
    multipleCodes: string;
  }) => void;
}

export function InventoryTab({
  offerData,
  selectedOffer,
  isCreateMode = false,
  canManageRewards,
  isSaving,
  setIsSaving,
  redemptionId,
  inventoryTypeInput,
  setInventoryTypeInput,
  limitTypeInput,
  setLimitTypeInput,
  usageLimitInput,
  setUsageLimitInput,
  singleCodeInput,
  setSingleCodeInput,
  multipleCodesInput,
  setMultipleCodesInput,
  isDirty,
  initialData,
  setInitialData,
}: InventoryTabProps) {
  const queryClient = useQueryClient();

  // Ensure default selection is "single" if no inventoryTypeInput is set yet
  React.useEffect(() => {
    if (!inventoryTypeInput) {
      setInventoryTypeInput("single");
    }
  }, [inventoryTypeInput, setInventoryTypeInput]);

  // Save function for inventory data
  const handleSave = async () => {
    try {
      setIsSaving(true);

      const payload = {
        inventoryType: inventoryTypeInput,
        limitType: limitTypeInput,
        usageLimit: usageLimitInput ? Number(usageLimitInput) : undefined,
        singleCode: singleCodeInput,
        multipleCodes: multipleCodesInput,
      };

      const response = await fetch(`/api/rewards/offers/${redemptionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Update the snapshot so the Save button disables again
        if (setInitialData) {
          setInitialData({
            inventoryType: inventoryTypeInput,
            limitType: limitTypeInput,
            usageLimit: usageLimitInput,
            singleCode: singleCodeInput,
            multipleCodes: multipleCodesInput,
          });
        }

        // Refresh the offer data
        queryClient.invalidateQueries({
          queryKey: ["offer", redemptionId],
        });
        queryClient.invalidateQueries({
          queryKey: ["rewards"],
        });
      } else {
        console.error("Failed to update inventory");
      }
    } catch (error) {
      console.error("Error updating inventory:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Inventory Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Offer Inventory</h3>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-4">
              <label className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="inventory_type"
                  value="single"
                  checked={
                    inventoryTypeInput === "single" || !inventoryTypeInput
                  }
                  onChange={(e) => setInventoryTypeInput(e.target.value)}
                  disabled={!canManageRewards}
                  className="h-4 w-4 mt-0.5"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    Single Redemption Code
                  </span>

                  <div className="mt-3 space-y-3">
                    <div>
                      <Input
                        placeholder="Enter redemption code..."
                        value={singleCodeInput}
                        onChange={(e) => setSingleCodeInput(e.target.value)}
                        disabled={!canManageRewards || inventoryTypeInput !== "single"}
                        className={cn(
                          "w-full",
                          (!canManageRewards || inventoryTypeInput !== "single") &&
                            "opacity-60 cursor-not-allowed bg-background"
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Select
                          value={limitTypeInput}
                          onValueChange={(value) => setLimitTypeInput(value)}
                          disabled={!canManageRewards || inventoryTypeInput !== "single"}
                        >
                          <SelectTrigger
                            className={cn(
                              (!canManageRewards || inventoryTypeInput !== "single") &&
                                "opacity-60 cursor-not-allowed bg-background"
                            )}
                          >
                            <SelectValue placeholder="Select limit type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unlimited">Unlimited</SelectItem>
                            <SelectItem value="limited">Limited</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="usage_limit_single" className="sr-only">
                          Usage Limit
                        </Label>
                        <Input
                          id="usage_limit_single"
                          type="number"
                          value={usageLimitInput}
                          onChange={(e) => setUsageLimitInput(e.target.value)}
                          disabled={
                            !canManageRewards || limitTypeInput === "unlimited" || inventoryTypeInput !== "single"
                          }
                          className={cn(
                            (!canManageRewards || inventoryTypeInput !== "single") &&
                              "opacity-60 cursor-not-allowed bg-background",
                            limitTypeInput === "unlimited" &&
                              "opacity-60 cursor-not-allowed bg-muted"
                          )}
                          placeholder="Usage Limit"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3">
                <input
                  type="radio"
                  name="inventory_type"
                  value="multiple"
                  checked={inventoryTypeInput === "multiple"}
                  onChange={(e) => setInventoryTypeInput(e.target.value)}
                  disabled={!canManageRewards}
                  className="h-4 w-4 mt-0.5"
                />
                <div className="flex-1">
                  <span className="text-sm font-medium">
                    Multiple Redemption Codes
                    <br />
                    <span className="text-xs text-muted-foreground">
                      (one per line)
                    </span>
                  </span>

                  <div className="mt-3">
                    <textarea
                      value={multipleCodesInput}
                      onChange={(e) => setMultipleCodesInput(e.target.value)}
                      disabled={
                        !canManageRewards || inventoryTypeInput !== "multiple"
                      }
                      className={cn(
                        "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                        (!canManageRewards || inventoryTypeInput !== "multiple") &&
                          "opacity-60 cursor-not-allowed bg-background"
                      )}
                      placeholder="Enter redemption codes, one per line..."
                    />
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button - only show in edit mode */}
      {!isCreateMode && (
        <div className="flex justify-end pt-4">
          <Button
            variant="default"
            size="default"
            disabled={isSaving || !canManageRewards || !isDirty}
            onClick={handleSave}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Inventory"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
