"use client";

import * as React from "react";
import { ArrowLeft, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@clerk/nextjs";
import { DetailedOfferData } from "../types";

// Define the offer source interface
interface OfferSource {
  id: number;
  name: string;
  status: string;
  cpid: string;
  cpidx: string;
  latency: number | null;
  providerStatus: string;
  cardStatus: string;
}

interface EditOfferSourceProps {
  selectedSource: OfferSource | undefined;
  displayOffer: DetailedOfferData | null;
  onCancel: () => void;
  onDataUpdated: () => void;
  onSave: (sourceId: number, formData: any) => void;
}

export function EditOfferSource({
  selectedSource,
  displayOffer,
  onCancel,
  onDataUpdated,
  onSave,
}: EditOfferSourceProps) {
  const { has } = useAuth();
  const queryClient = useQueryClient();

  const canManageRewards =
    has?.({
      permission: "org:rewards:manage",
    }) ?? false;

  // Form state
  const [cpidxInput, setCpidxInput] = React.useState(
    selectedSource?.cpidx || ""
  );
  const [isSaving, setIsSaving] = React.useState(false);

  // Track if form has changes
  const hasChanges = cpidxInput !== (selectedSource?.cpidx || "");

  // Initialize form when source changes
  React.useEffect(() => {
    if (selectedSource) {
      setCpidxInput(selectedSource.cpidx || "");
    }
  }, [selectedSource]);

  const handleSave = async () => {
    if (!selectedSource || !hasChanges || !displayOffer) return;

    setIsSaving(true);
    try {
      const payload = {
        cpidx: cpidxInput,
      };

      // Call the API to update the offer source
      const response = await fetch(`/api/rewards/offers/${displayOffer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to update offer source");
      }

      // Call the onSave callback
      onSave(selectedSource.id, payload);

      // Trigger data refresh
      onDataUpdated();
    } catch (error) {
      console.error("Error updating offer source:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedSource) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No source selected</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Sources
        </Button>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="space-y-4">
          <h4 className="font-medium">Editable Fields</h4>

          <div className="space-y-2">
            <Label htmlFor="cpidx">CPIDx</Label>
            <Input
              id="cpidx"
              value={cpidxInput}
              onChange={(e) => setCpidxInput(e.target.value)}
              disabled={!canManageRewards}
              className={cn(
                !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="Enter CPIDx..."
            />
            <p className="text-xs text-muted-foreground">
              The unique identifier for this offer source
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-start pt-4">
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving || !canManageRewards || !hasChanges}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
