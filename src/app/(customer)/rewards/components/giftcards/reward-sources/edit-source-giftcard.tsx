"use client";

import * as React from "react";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGateValue } from "@statsig/react-bindings";
import { RewardDetail } from "../../manage-reward";
import { GiftCardSource } from "../../types/gift-card-source";

interface FormData {
  cpidx: string;
  language: string;
  value: string;
  poynts: string;
  reward_status: string;
  provider_percentage: string;
  base_percentage: string;
  customer_percentage: string;
  cp_percentage: string;
}

interface EditGiftCardSourceProps {
  displayReward: RewardDetail | null;
  onCancel: () => void;
  onDataUpdated?: () => void;
  selectedSource?: GiftCardSource; // Using imported GiftCardSource interface
  onSave?: (sourceId: number, formData: FormData) => void; // Updated to use number for sourceId
}

export function EditGiftCardSource({
  displayReward,
  onCancel,
  onDataUpdated,
  selectedSource,
  onSave,
}: EditGiftCardSourceProps) {
  const [formData, setFormData] = React.useState<FormData>({
    cpidx: selectedSource?.cpidx || displayReward?.cpid || "",
    language: displayReward?.language?.toLowerCase() || "en",
    value: displayReward?.value?.toString() || "",
    poynts: displayReward?.poynts?.toString() || "",
    reward_status:
      selectedSource?.cardStatus || displayReward?.reward_status || "active",
    // Convert decimal values to percentages for display (multiply by 100)
    provider_percentage: selectedSource?.rebate_provider_percentage ? (selectedSource.rebate_provider_percentage * 100).toFixed(2) : "",
    base_percentage: selectedSource?.rebate_base_percentage ? (selectedSource.rebate_base_percentage * 100).toFixed(2) : "",
    customer_percentage: selectedSource?.rebate_customer_percentage ? (selectedSource.rebate_customer_percentage * 100).toFixed(2) : "",
    cp_percentage: selectedSource?.rebate_cp_percentage ? (selectedSource.rebate_cp_percentage * 100).toFixed(2) : "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  // Keep a snapshot of the original data so we can determine if the form is "dirty"
  const [initialData, setInitialData] = React.useState<FormData | null>(null);
  // Track field-level validation errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const debugMode = false;

  // Update form data when props change
  React.useEffect(() => {
    const startValues: FormData = {
      cpidx: selectedSource?.cpidx || displayReward?.cpid || "",
      language: displayReward?.language?.toLowerCase() || "en",
      value: displayReward?.value?.toString() || "",
      poynts: displayReward?.poynts?.toString() || "",
      reward_status:
        selectedSource?.cardStatus || displayReward?.reward_status || "active",
      // Convert decimal values to percentages for display (multiply by 100)
      provider_percentage: selectedSource?.rebate_provider_percentage ? (selectedSource.rebate_provider_percentage * 100).toFixed(2) : "",
      base_percentage: selectedSource?.rebate_base_percentage ? (selectedSource.rebate_base_percentage * 100).toFixed(2) : "",
      customer_percentage: selectedSource?.rebate_customer_percentage ? (selectedSource.rebate_customer_percentage * 100).toFixed(2) : "",
      cp_percentage: selectedSource?.rebate_cp_percentage ? (selectedSource.rebate_cp_percentage * 100).toFixed(2) : "",
    };

    // Set both the live form data and the immutable initial snapshot
    setFormData(startValues);
    setInitialData(startValues);
  }, [displayReward, selectedSource]);

  // Determine if any field has changed compared to the initial snapshot
  const isDirty = React.useMemo(() => {
    if (!initialData) return false;
    return (
      formData.cpidx !== initialData.cpidx ||
      formData.language !== initialData.language ||
      formData.value !== initialData.value ||
      formData.poynts !== initialData.poynts ||
      formData.reward_status !== initialData.reward_status ||
      formData.provider_percentage !== initialData.provider_percentage ||
      formData.base_percentage !== initialData.base_percentage ||
      formData.customer_percentage !== initialData.customer_percentage ||
      formData.cp_percentage !== initialData.cp_percentage
    );
  }, [formData, initialData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));

    // Clear error for this field as user types
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[id];
      return newErrors;
    });
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, language: value }));
  };

  const handleSave = async () => {
    console.log("[EditGiftCardSource] Save button clicked", { formData });
    console.log("[EditGiftCardSource] Selected source:", selectedSource);

    // Add a debug check to view the component props
    console.log("[EditGiftCardSource] Component props:", {
      displayReward,
      selectedSource,
      onCancel,
      onDataUpdated,
      onSave,
    });

    // Basic front-end validation
    const newErrors: Record<string, string> = {};

    if (!formData.cpidx.trim()) newErrors.cpidx = "CPIDx is required";
    if (!formData.language.trim()) newErrors.language = "Language is required";
    if (!formData.value.trim()) newErrors.value = "Reward value is required";
    if (!formData.poynts.trim()) newErrors.poynts = "Poynts is required";
    if (!formData.reward_status.trim())
      newErrors.reward_status = "Reward status is required";

    // Ensure numeric fields are valid numbers
    if (formData.value && isNaN(Number(formData.value))) {
      newErrors.value = "Reward value must be a number";
    }
    if (formData.poynts && isNaN(Number(formData.poynts))) {
      newErrors.poynts = "Poynts must be a number";
    }

    // Validate percentage fields
    const validatePercentage = (value: string, fieldName: string) => {
      if (value && value.trim() !== "") {
        const num = parseFloat(value);
        if (isNaN(num)) {
          newErrors[fieldName] = "Must be a valid number";
        } else if (num < 0) {
          newErrors[fieldName] = "Cannot be negative";
        } else if (num > 100) {
          newErrors[fieldName] = "Cannot exceed 100%";
        } else {
          // Check for more than 2 decimal places
          const decimalParts = value.split('.');
          if (decimalParts.length > 1 && decimalParts[1].length > 2) {
            newErrors[fieldName] = "Maximum 2 decimal places allowed";
          }
        }
      }
    };

    validatePercentage(formData.provider_percentage, "provider_percentage");
    validatePercentage(formData.base_percentage, "base_percentage");
    validatePercentage(formData.customer_percentage, "customer_percentage");
    validatePercentage(formData.cp_percentage, "cp_percentage");

    if (Object.keys(newErrors).length) {
      console.log("[EditGiftCardSource] Validation errors", newErrors);
      setErrors(newErrors);
      return; // Stop here—don't hit API
    }

    // Check if we have a selectedSource with an ID
    if (!selectedSource || typeof selectedSource.id !== "number") {
      console.log(
        "[EditGiftCardSource] Missing source ID or invalid ID type. Cannot save changes.",
        { selectedSource }
      );
      return;
    }

    setIsLoading(true);

    try {
      // Important: This ID must be the database ID (giftcard_id), not redemption_registries_id
      // Ensure we're using a number for the ID
      const targetId = selectedSource.id;

      // Prepare the data for API
      const payload = {
        cpidx: formData.cpidx, // This will be mapped to 'cpid' in the API
        language: formData.language,
        value: parseFloat(formData.value),
        poynts: parseInt(formData.poynts),
        reward_status: formData.reward_status,
        // Convert percentage values back to decimals (divide by 100)
        provider_percentage: formData.provider_percentage ? parseFloat(formData.provider_percentage) / 100 : undefined,
        base_percentage: formData.base_percentage ? parseFloat(formData.base_percentage) / 100 : undefined,
        customer_percentage: formData.customer_percentage ? parseFloat(formData.customer_percentage) / 100 : undefined,
        cp_percentage: formData.cp_percentage ? parseFloat(formData.cp_percentage) / 100 : undefined,
      };

      console.log("[EditGiftCardSource] API payload:", payload);
      console.log("[EditGiftCardSource] Target ID for API:", targetId);

      // Call the API to update the gift card
      const response = await fetch(`/api/rewards/giftcards/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("[EditGiftCardSource] API error", errorData);
        throw new Error(errorData.error || "Failed to update gift card");
      }

      console.log("[EditGiftCardSource] Gift card updated successfully");

      // Trigger data refresh if handler provided
      if (onDataUpdated) {
        onDataUpdated();
      }

      // Trigger save if handler provided
      if (onSave) {
        // Ensure targetId is treated as a number
        onSave(Number(targetId), formData);
      }
    } catch (error) {
      console.log("[EditGiftCardSource] Error saving gift card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSource || typeof selectedSource.id !== "number") {
      console.log(
        "[EditGiftCardSource] Missing source ID or invalid ID type. Cannot delete.",
        { selectedSource }
      );
      return;
    }

    setIsDeleting(true);

    try {
      const targetId = selectedSource.id;

      // Prepare the data for API - set reward_status to "deleted"
      const payload = {
        cpidx: formData.cpidx,
        language: formData.language,
        value: parseFloat(formData.value),
        poynts: parseInt(formData.poynts),
        reward_status: "deleted",
        // Convert percentage values back to decimals (divide by 100)
        provider_percentage: formData.provider_percentage ? parseFloat(formData.provider_percentage) / 100 : undefined,
        base_percentage: formData.base_percentage ? parseFloat(formData.base_percentage) / 100 : undefined,
        customer_percentage: formData.customer_percentage ? parseFloat(formData.customer_percentage) / 100 : undefined,
        cp_percentage: formData.cp_percentage ? parseFloat(formData.cp_percentage) / 100 : undefined,
      };

      console.log("[EditGiftCardSource] Delete API payload:", payload);
      console.log("[EditGiftCardSource] Target ID for delete:", targetId);

      // Call the API to update the gift card with deleted status
      const response = await fetch(`/api/rewards/giftcards/${targetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("[EditGiftCardSource] Delete API error", errorData);
        throw new Error(errorData.error || "Failed to delete gift card");
      }

      console.log("[EditGiftCardSource] Gift card deleted successfully");

      // Close the dialog
      setShowDeleteDialog(false);

      // Trigger data refresh if handler provided
      if (onDataUpdated) {
        onDataUpdated();
      }

      // Optionally go back to the main view after deletion
      onCancel();
    } catch (error) {
      console.log("[EditGiftCardSource] Error deleting gift card:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" className="mr-2" onClick={onCancel}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Reward Sources
        </Button>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gift Card Source</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gift card source? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-2">
            <div className="rounded-lg border p-3 bg-muted/50">
              <div className="font-medium mb-1">Source Details:</div>
              <div className="text-sm space-y-1">
                <div>
                  <strong>Name:</strong> {selectedSource?.name || "N/A"}
                </div>
                <div>
                  <strong>CP ID:</strong>{" "}
                  {selectedSource?.cpidx || formData.cpidx || "N/A"}
                </div>
                <div>
                  <strong>Brand:</strong> {displayReward?.brand_name || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Source"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <div>
          <Label className="block mb-1">Brand Name</Label>
          <div className="text-base">{displayReward?.brand_name || ""}</div>
        </div>
        <div>
          <Label className="block mb-1">Type</Label>
          <div className="text-base">{displayReward?.type || ""}</div>
        </div>
        <div>
          <Label className="block mb-1">Rebate %</Label>
          <div className="text-base">1.25%</div>
        </div>
      </div>

      {selectedSource && debugMode && (
        <div className="rounded-lg border p-3 bg-muted/50">
          <div className="font-medium mb-1">
            Editing Source {selectedSource.name}
          </div>
          <div className="text-sm text-muted-foreground">
            Source ID: {selectedSource.id}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cpidx">
          CPIDx<span className="text-red-500">*</span>
        </Label>
        <Input
          id="cpidx"
          value={formData.cpidx}
          onChange={handleInputChange}
          className="font-mono text-sm"
          aria-invalid={!!errors.cpidx}
        />
        {errors.cpidx && (
          <p className="mt-1 text-xs text-destructive">{errors.cpidx}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="language">
          Language<span className="text-red-500">*</span>
        </Label>
        <Select value={formData.language} onValueChange={handleSelectChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="es">Spanish</SelectItem>
          </SelectContent>
        </Select>
        {errors.language && (
          <p className="mt-1 text-xs text-destructive">{errors.language}</p>
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="value">
            Reward Value (in $)<span className="text-red-500">*</span>
          </Label>
          <Input
            id="value"
            type="number"
            value={formData.value}
            onChange={handleInputChange}
            aria-invalid={!!errors.value}
          />
          {errors.value && (
            <p className="mt-1 text-xs text-destructive">{errors.value}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="poynts">
            Poynts<span className="text-red-500">*</span>
          </Label>
          <Input
            id="poynts"
            type="number"
            value={formData.poynts}
            onChange={handleInputChange}
            aria-invalid={!!errors.poynts}
          />
          {errors.poynts && (
            <p className="mt-1 text-xs text-destructive">{errors.poynts}</p>
          )}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="provider_percentage">
            Provider %
          </Label>
          <Input
            id="provider_percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.provider_percentage}
            onChange={handleInputChange}
            placeholder="0.00"
            aria-invalid={!!errors.provider_percentage}
          />
          {errors.provider_percentage && (
            <p className="mt-1 text-xs text-destructive">{errors.provider_percentage}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="base_percentage">
            Base %
          </Label>
          <Input
            id="base_percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.base_percentage}
            onChange={handleInputChange}
            placeholder="0.00"
            aria-invalid={!!errors.base_percentage}
          />
          {errors.base_percentage && (
            <p className="mt-1 text-xs text-destructive">{errors.base_percentage}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_percentage">
            Customer %
          </Label>
          <Input
            id="customer_percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.customer_percentage}
            onChange={handleInputChange}
            placeholder="0.00"
            aria-invalid={!!errors.customer_percentage}
          />
          {errors.customer_percentage && (
            <p className="mt-1 text-xs text-destructive">{errors.customer_percentage}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="cp_percentage">
            CP %
          </Label>
          <Input
            id="cp_percentage"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={formData.cp_percentage}
            onChange={handleInputChange}
            placeholder="0.00"
            aria-invalid={!!errors.cp_percentage}
          />
          {errors.cp_percentage && (
            <p className="mt-1 text-xs text-destructive">{errors.cp_percentage}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reward_status">
          Reward Status<span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.reward_status}
          onValueChange={(value) =>
            setFormData((prev) => ({ ...prev, reward_status: value }))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select reward status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {errors.reward_status && (
          <p className="mt-1 text-xs text-destructive">
            {errors.reward_status}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button
          variant="default"
          size="default"
          onClick={handleSave}
          disabled={isLoading || !isDirty}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>

        <Button
          variant="ghost"
          size="default"
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => setShowDeleteDialog(true)}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete Gift Card Source
        </Button>
      </div>
    </div>
  );
}
