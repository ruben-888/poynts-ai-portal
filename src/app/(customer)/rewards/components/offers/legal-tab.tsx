"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

import { BaseTabProps } from "./types";

interface LegalTabProps extends BaseTabProps {
  termsInput: string;
  setTermsInput: (value: string) => void;
  disclaimerInput: string;
  setDisclaimerInput: (value: string) => void;
  isDirty: boolean;
  initialData: any;
  setInitialData: (data: any) => void;
}

export function LegalTab({
  offerData,
  selectedOffer,
  isCreateMode = false,
  canManageRewards,
  isSaving,
  setIsSaving,
  redemptionId,
  termsInput,
  setTermsInput,
  disclaimerInput,
  setDisclaimerInput,
  isDirty,
  initialData,
  setInitialData,
}: LegalTabProps) {
  const queryClient = useQueryClient();

  return (
    <div className="space-y-6">
      {/* Legal Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold border-b pb-2">
          Legal Information
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="terms">Terms</Label>
              <span className="text-xs text-muted-foreground">
                {termsInput.length}/8000 characters
              </span>
            </div>
            <textarea
              id="terms"
              value={termsInput}
              onChange={(e) => {
                if (e.target.value.length <= 8000) {
                  setTermsInput(e.target.value);
                }
              }}
              maxLength={8000}
              disabled={!canManageRewards}
              className={cn(
                "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                !canManageRewards &&
                "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="Terms and conditions..."
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="disclaimer">Disclaimer</Label>
              <span className="text-xs text-muted-foreground">
                {disclaimerInput.length}/8000 characters
              </span>
            </div>
            <textarea
              id="disclaimer"
              value={disclaimerInput}
              onChange={(e) => {
                if (e.target.value.length <= 8000) {
                  setDisclaimerInput(e.target.value);
                }
              }}
              maxLength={8000}
              disabled={!canManageRewards}
              className={cn(
                "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                !canManageRewards &&
                "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="Legal disclaimers..."
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

                if (isCreateMode) {
                  // Create mode - legal data will be saved with the offer
                  console.log("Legal data for create mode:", {
                    terms: termsInput,
                    disclaimer: disclaimerInput,
                  });
                } else {
                  // Update existing offer legal data
                  const payload = {
                    terms: encodeURIComponent(termsInput),
                    disclaimer: encodeURIComponent(disclaimerInput),
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
                      terms: termsInput,
                      disclaimer: disclaimerInput,
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
                    console.error("Failed to update legal information");
                  }
                }
              } catch (error) {
                console.error("Error saving legal information:", error);
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
              "Save Legal Information"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
