"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";

interface FormData {
  brand_id: string;
  cpid: string;
  language: string;
  value: string;
  poynts: string;
  reward_status: string;
  provider_percentage: string;
  base_percentage: string;
  customer_percentage: string;
  cp_percentage: string;
}

interface Brand {
  brand_id: number;
  brandKey: string;
  brandName: string;
  description: string | null;
  imageUrl: string | null;
  status: string;
}

interface CreateGiftCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateGiftCardDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateGiftCardDialogProps) {
  const [formData, setFormData] = React.useState<FormData>({
    brand_id: "",
    cpid: "",
    language: "en",
    value: "",
    poynts: "",
    reward_status: "active",
    provider_percentage: "",
    base_percentage: "",
    customer_percentage: "",
    cp_percentage: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Fetch brands for the select dropdown
  const { data: brands, isLoading: brandsLoading } = useQuery<Brand[]>({
    queryKey: ["brands", "active"],
    queryFn: async () => {
      const response = await fetch("/api/rewards/brands?status=active");
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      return response.json();
    },
    enabled: open,
  });

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

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.brand_id) newErrors.brand_id = "Brand is required";
    if (!formData.cpid.trim()) newErrors.cpid = "CPID is required";
    if (!formData.language.trim()) newErrors.language = "Language is required";
    if (!formData.value.trim()) newErrors.value = "Reward value is required";
    if (!formData.poynts.trim()) newErrors.poynts = "Poynts is required";
    if (!formData.reward_status.trim()) newErrors.reward_status = "Reward status is required";

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Prepare the data for API
      const payload = {
        brand_id: parseInt(formData.brand_id),
        cpid: formData.cpid,
        language: formData.language,
        value: parseFloat(formData.value),
        poynts: parseInt(formData.poynts),
        reward_status: formData.reward_status,
        // Convert percentage values to decimals (divide by 100)
        provider_percentage: formData.provider_percentage ? parseFloat(formData.provider_percentage) / 100 : 0,
        base_percentage: formData.base_percentage ? parseFloat(formData.base_percentage) / 100 : 0,
        customer_percentage: formData.customer_percentage ? parseFloat(formData.customer_percentage) / 100 : 0,
        cp_percentage: formData.cp_percentage ? parseFloat(formData.cp_percentage) / 100 : 0,
      };

      // TODO: Replace with actual API endpoint once created
      const response = await fetch("/api/rewards/giftcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create gift card");
      }

      // Reset form
      setFormData({
        brand_id: "",
        cpid: "",
        language: "en",
        value: "",
        poynts: "",
        reward_status: "active",
        provider_percentage: "",
        base_percentage: "",
        customer_percentage: "",
        cp_percentage: "",
      });

      // Close dialog
      onOpenChange(false);

      // Trigger success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating gift card:", error);
      // TODO: Show error toast or message
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBrand = Array.isArray(brands) ? brands.find(b => b.brand_id.toString() === formData.brand_id) : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Gift Card</DialogTitle>
          <DialogDescription>
            Add a new gift card configuration to the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Brand Selection */}
          <div className="space-y-2">
            <Label htmlFor="brand_id">
              Brand<span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.brand_id}
              onValueChange={(value) => handleSelectChange("brand_id", value)}
              disabled={brandsLoading}
            >
              <SelectTrigger aria-invalid={!!errors.brand_id}>
                <SelectValue placeholder={brandsLoading ? "Loading brands..." : "Select a brand"} />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(brands) && brands.map((brand) => (
                  <SelectItem key={brand.brand_id} value={brand.brand_id.toString()}>
                    {brand.brandName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.brand_id && (
              <p className="mt-1 text-xs text-destructive">{errors.brand_id}</p>
            )}
            {selectedBrand && selectedBrand.description && (
              <p className="text-sm text-muted-foreground">{selectedBrand.description}</p>
            )}
          </div>

          {/* CPID */}
          <div className="space-y-2">
            <Label htmlFor="cpid">
              CPID<span className="text-red-500">*</span>
            </Label>
            <Input
              id="cpid"
              value={formData.cpid}
              onChange={handleInputChange}
              className="font-mono text-sm"
              placeholder="e.g., GC-AMAZON-EN-50-B-A71FA1"
              aria-invalid={!!errors.cpid}
            />
            {errors.cpid && (
              <p className="mt-1 text-xs text-destructive">{errors.cpid}</p>
            )}
          </div>

          {/* Language */}
          <div className="space-y-2">
            <Label htmlFor="language">
              Language<span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.language}
              onValueChange={(value) => handleSelectChange("language", value)}
            >
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

          {/* Value and Poynts */}
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
                placeholder="25"
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
                placeholder="2500"
                aria-invalid={!!errors.poynts}
              />
              {errors.poynts && (
                <p className="mt-1 text-xs text-destructive">{errors.poynts}</p>
              )}
            </div>
          </div>

          {/* Rebate Percentages */}
          <div className="space-y-2">
            <Label>Rebate Percentages</Label>
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider_percentage" className="text-sm">
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
                <Label htmlFor="base_percentage" className="text-sm">
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
                <Label htmlFor="customer_percentage" className="text-sm">
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
                <Label htmlFor="cp_percentage" className="text-sm">
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
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="reward_status">
              Reward Status<span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.reward_status}
              onValueChange={(value) => handleSelectChange("reward_status", value)}
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
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Gift Card"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}