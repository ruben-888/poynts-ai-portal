"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

import { BaseTabProps } from "./types";

interface ContentTabProps extends BaseTabProps {
  shortDescriptionInput: string;
  setShortDescriptionInput: (value: string) => void;
  longDescriptionInput: string;
  setLongDescriptionInput: (value: string) => void;
  instructionsInput: string;
  setInstructionsInput: (value: string) => void;
  isDirty: boolean;
  initialData: any;
  setInitialData: (data: any) => void;
  areRequiredFieldsFilled: boolean;
}

export function ContentTab({
  offerData,
  selectedOffer,
  isCreateMode = false,
  canManageRewards,
  isSaving,
  setIsSaving,
  redemptionId,
  shortDescriptionInput,
  setShortDescriptionInput,
  longDescriptionInput,
  setLongDescriptionInput,
  instructionsInput,
  setInstructionsInput,
  isDirty,
  initialData,
  setInitialData,
  areRequiredFieldsFilled,
}: ContentTabProps) {
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      {/* Content Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Content & Instructions</h3>

        <div className="space-y-6">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="short_description">
                Short Description
              </Label>
              <span className="text-xs text-muted-foreground">
                {shortDescriptionInput.length}/255 characters
              </span>
            </div>
            <textarea
              id="short_description"
              value={shortDescriptionInput}
              onChange={(e) => {
                if (e.target.value.length <= 255) {
                  setShortDescriptionInput(e.target.value);
                }
              }}
              maxLength={255}
              disabled={!canManageRewards}
              className={cn(
                "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="Brief description of the offer..."
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="long_description">
                Description <span className="text-red-500">*</span>
              </Label>
              <span className="text-xs text-muted-foreground">
                {longDescriptionInput.length}/8000 characters
              </span>
            </div>
            <textarea
              id="long_description"
              value={longDescriptionInput}
              onChange={(e) => {
                if (e.target.value.length <= 8000) {
                  setLongDescriptionInput(e.target.value);
                }
              }}
              maxLength={8000}
              disabled={!canManageRewards}
              required
              className={cn(
                "flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="Detailed description of the offer..."
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="instructions">Instructions</Label>
              <span className="text-xs text-muted-foreground">
                {instructionsInput.length}/255 characters
              </span>
            </div>
            <textarea
              id="instructions"
              value={instructionsInput}
              onChange={(e) => {
                if (e.target.value.length <= 255) {
                  setInstructionsInput(e.target.value);
                }
              }}
              maxLength={255}
              disabled={!canManageRewards}
              className={cn(
                "flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="How to redeem this offer..."
            />
          </div>
        </div>
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

              // Validate required fields before attempting save
              const longEl = document.getElementById(
                "long_description"
              ) as HTMLTextAreaElement | null;

              if (!longEl?.value.trim()) {
                // Trigger native browser validation UI for missing required fields
                longEl?.reportValidity();
                setIsSaving(false);
                return;
              }

              if (isCreateMode) {
                // Create mode - content data will be saved with the offer
                console.log("Content data for create mode:", {
                  shortDescription: shortDescriptionInput,
                  longDescription: longDescriptionInput,
                  instructions: instructionsInput,
                });
              } else {
                // Update existing offer content data
                const payload = {
                  shortDescription: encodeURIComponent(shortDescriptionInput),
                  longDescription: encodeURIComponent(longDescriptionInput),
                  instructions: encodeURIComponent(instructionsInput),
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
                  // Update the snapshot so the Save button disables again
                  setInitialData({
                    shortDescription: shortDescriptionInput,
                    longDescription: longDescriptionInput,
                    instructions: instructionsInput,
                  });

                  // Refresh the offer data
                  queryClient.invalidateQueries({
                    queryKey: ["offer", redemptionId],
                  });
                  // Also refresh the rewards list
                  queryClient.invalidateQueries({
                    queryKey: ["rewards"],
                  });
                } else {
                  console.error("Failed to update content information");
                }
              }
            } catch (error) {
              console.error("Error saving content information:", error);
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
            "Save Content"
          )}
          </Button>
        </div>
      )}
    </div>
  );
}
