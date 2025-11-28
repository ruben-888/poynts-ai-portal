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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface GiftCard {
  giftcard_id: string;
  reward_name: string;
  brand_name: string;
  cpidx: string;
  value: number;
  reward_status: string;
  rebate_provider_percentage?: number;
  rebate_base_percentage?: number;
  rebate_customer_percentage?: number;
  rebate_cp_percentage?: number;
}

interface FormData {
  reward_name: string;
  brand_name: string;
  cpidx: string;
  value: string;
  reward_status: string;
  priority: string;
  rebate_provider_percentage: string;
  rebate_base_percentage: string;
  rebate_customer_percentage: string;
  rebate_cp_percentage: string;
}

interface EditBlackhawkCardProps {
  card: GiftCard | null;
  onCancel: () => void;
  onSave?: (cardId: string, formData: FormData) => void;
  onDelete?: (cardId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

// Utility function to format currency
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return "N/A";
  
  if (amount % 1 === 0) {
    return `$${amount}`;
  }
  
  return `$${amount.toFixed(2)}`;
};

export function EditBlackhawkCard({
  card,
  onCancel,
  onSave,
  onDelete,
  canEdit = true,
  canDelete = false,
}: EditBlackhawkCardProps) {
  const [formData, setFormData] = React.useState<FormData>({
    reward_name: card?.reward_name || "",
    brand_name: card?.brand_name || "",
    cpidx: card?.cpidx || "",
    value: card?.value?.toString() || "",
    reward_status: card?.reward_status || "active",
    priority: "0",
    // Convert decimal values to percentages for display (multiply by 100)
    rebate_provider_percentage: card?.rebate_provider_percentage ? (card.rebate_provider_percentage * 100).toFixed(2) : "",
    rebate_base_percentage: card?.rebate_base_percentage ? (card.rebate_base_percentage * 100).toFixed(2) : "",
    rebate_customer_percentage: card?.rebate_customer_percentage ? (card.rebate_customer_percentage * 100).toFixed(2) : "",
    rebate_cp_percentage: card?.rebate_cp_percentage ? (card.rebate_cp_percentage * 100).toFixed(2) : "",
  });
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [initialData, setInitialData] = React.useState<FormData | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Update form data when card prop changes
  React.useEffect(() => {
    if (card) {
      const startValues: FormData = {
        reward_name: card.reward_name,
        brand_name: card.brand_name,
        cpidx: card.cpidx,
        value: card.value.toString(),
        reward_status: card.reward_status,
        priority: "0",
        // Convert decimal values to percentages for display (multiply by 100)
        rebate_provider_percentage: card.rebate_provider_percentage ? (card.rebate_provider_percentage * 100).toFixed(2) : "",
        rebate_base_percentage: card.rebate_base_percentage ? (card.rebate_base_percentage * 100).toFixed(2) : "",
        rebate_customer_percentage: card.rebate_customer_percentage ? (card.rebate_customer_percentage * 100).toFixed(2) : "",
        rebate_cp_percentage: card.rebate_cp_percentage ? (card.rebate_cp_percentage * 100).toFixed(2) : "",
      };

      setFormData(startValues);
      setInitialData(startValues);
    }
  }, [card]);

  // Determine if any field has changed
  const isDirty = React.useMemo(() => {
    if (!initialData) return false;
    return (
      formData.reward_name !== initialData.reward_name ||
      formData.brand_name !== initialData.brand_name ||
      formData.cpidx !== initialData.cpidx ||
      formData.value !== initialData.value ||
      formData.reward_status !== initialData.reward_status ||
      formData.priority !== initialData.priority ||
      formData.rebate_provider_percentage !== initialData.rebate_provider_percentage ||
      formData.rebate_base_percentage !== initialData.rebate_base_percentage ||
      formData.rebate_customer_percentage !== initialData.rebate_customer_percentage ||
      formData.rebate_cp_percentage !== initialData.rebate_cp_percentage
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
    setFormData((prev) => ({ ...prev, reward_status: value }));
  };

  const handleSave = async () => {
    if (!canEdit) return;

    // Basic validation
    const newErrors: Record<string, string> = {};

    if (!formData.reward_name.trim()) newErrors.reward_name = "Name is required";
    if (!formData.brand_name.trim()) newErrors.brand_name = "Brand is required";
    if (!formData.cpidx.trim()) newErrors.cpidx = "CPIDX is required";
    if (!formData.value.trim()) newErrors.value = "Value is required";
    if (!formData.reward_status.trim()) newErrors.reward_status = "Status is required";

    // Validate numeric fields
    if (formData.value && isNaN(Number(formData.value))) {
      newErrors.value = "Value must be a number";
    }
    if (formData.priority && isNaN(Number(formData.priority))) {
      newErrors.priority = "Priority must be a number";
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

    validatePercentage(formData.rebate_provider_percentage, "rebate_provider_percentage");
    validatePercentage(formData.rebate_base_percentage, "rebate_base_percentage");
    validatePercentage(formData.rebate_customer_percentage, "rebate_customer_percentage");
    validatePercentage(formData.rebate_cp_percentage, "rebate_cp_percentage");

    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSave && card) {
        onSave(card.giftcard_id, formData);
      }
      
      onCancel(); // Close the form after successful save
    } catch (error) {
      console.error("Error saving card:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete || !card) return;

    setIsDeleting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onDelete) {
        onDelete(card.giftcard_id);
      }
      
      setShowDeleteDialog(false);
      onCancel(); // Close the form after successful delete
    } catch (error) {
      console.error("Error deleting card:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!card) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="text-lg font-medium">Edit Gift Card</h3>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={
              card.reward_status === "active" 
                ? "default" 
                : card.reward_status === "suspended"
                  ? "secondary"
                  : "outline"
            }
            className={
              card.reward_status === "active"
                ? "bg-green-100 text-green-800"
                : ""
            }
          >
            {card.reward_status}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Form */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reward_name">Reward Name</Label>
              <Input
                id="reward_name"
                value={formData.reward_name}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={errors.reward_name ? "border-red-500" : ""}
              />
              {errors.reward_name && (
                <p className="text-sm text-red-500">{errors.reward_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="brand_name">Brand Name</Label>
              <Input
                id="brand_name"
                value={formData.brand_name}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={errors.brand_name ? "border-red-500" : ""}
              />
              {errors.brand_name && (
                <p className="text-sm text-red-500">{errors.brand_name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpidx">CPIDX</Label>
              <Input
                id="cpidx"
                value={formData.cpidx}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={`font-mono ${errors.cpidx ? "border-red-500" : ""}`}
              />
              {errors.cpidx && (
                <p className="text-sm text-red-500">{errors.cpidx}</p>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reward_status">Status</Label>
              <Select
                value={formData.reward_status}
                onValueChange={handleSelectChange}
                disabled={!canEdit}
              >
                <SelectTrigger className={errors.reward_status ? "border-red-500" : ""}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="deleted">Deleted</SelectItem>
                </SelectContent>
              </Select>
              {errors.reward_status && (
                <p className="text-sm text-red-500">{errors.reward_status}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                value={formData.value}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-sm text-red-500">{errors.value}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Input
                id="priority"
                type="number"
                value={formData.priority}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={errors.priority ? "border-red-500" : ""}
              />
              {errors.priority && (
                <p className="text-sm text-red-500">{errors.priority}</p>
              )}
            </div>
          </div>
        </div>

        {/* Rebate Percentages Section */}
        <div className="space-y-4">
          <h4 className="text-base font-medium">Rebate Percentages</h4>
          <p className="text-sm text-muted-foreground">
            Enter percentages as numbers (e.g., 5.25 for 5.25%)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rebate_provider_percentage">Provider Percentage (%)</Label>
              <Input
                id="rebate_provider_percentage"
                type="number"
                step="0.01"
                value={formData.rebate_provider_percentage}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={errors.rebate_provider_percentage ? "border-red-500" : ""}
                placeholder="0.00"
              />
              {errors.rebate_provider_percentage && (
                <p className="text-sm text-red-500">{errors.rebate_provider_percentage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rebate_base_percentage">Base Percentage (%)</Label>
              <Input
                id="rebate_base_percentage"
                type="number"
                step="0.01"
                value={formData.rebate_base_percentage}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={errors.rebate_base_percentage ? "border-red-500" : ""}
                placeholder="0.00"
              />
              {errors.rebate_base_percentage && (
                <p className="text-sm text-red-500">{errors.rebate_base_percentage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rebate_customer_percentage">Customer Percentage (%)</Label>
              <Input
                id="rebate_customer_percentage"
                type="number"
                step="0.01"
                value={formData.rebate_customer_percentage}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={errors.rebate_customer_percentage ? "border-red-500" : ""}
                placeholder="0.00"
              />
              {errors.rebate_customer_percentage && (
                <p className="text-sm text-red-500">{errors.rebate_customer_percentage}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rebate_cp_percentage">CP Percentage (%)</Label>
              <Input
                id="rebate_cp_percentage"
                type="number"
                step="0.01"
                value={formData.rebate_cp_percentage}
                onChange={handleInputChange}
                disabled={!canEdit}
                className={errors.rebate_cp_percentage ? "border-red-500" : ""}
                placeholder="0.00"
              />
              {errors.rebate_cp_percentage && (
                <p className="text-sm text-red-500">{errors.rebate_cp_percentage}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div>
            {canDelete && (
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Card
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            {canEdit && (
              <Button
                onClick={handleSave}
                disabled={!isDirty || isLoading}
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
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Gift Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this gift card? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Card:</span> {card.reward_name}
              </p>
              <p className="text-sm">
                <span className="font-medium">Value:</span> {formatCurrency(card.value)}
              </p>
              <p className="text-sm font-mono">
                {card.cpidx}
              </p>
            </div>
          </div>

          <DialogFooter className="flex space-x-2 sm:justify-end">
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
                "Delete Card"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}