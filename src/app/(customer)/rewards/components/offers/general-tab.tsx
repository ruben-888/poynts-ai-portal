"use client";

import * as React from "react";
import { Loader2, ImageIcon } from "lucide-react";
import Image from "next/image";
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
import { TagInput } from "./tag-input";

interface GeneralTabProps extends BaseTabProps {
  selectedTags: string[];
  onTagRemove: (tag: string) => void;
  onTagAdd: (tag: string) => void;
  poyntsInput: string;
  setPoyntsInput: (value: string) => void;
  titleInput: string;
  setTitleInput: (value: string) => void;
  valueInput: string;
  setValueInput: (value: string) => void;
  brandNameInput: string;
  setBrandNameInput: (value: string) => void;
  statusInput: string;
  setStatusInput: (value: string) => void;
  imageUrlInput: string;
  setImageUrlInput: (value: string) => void;
  isDirty: boolean;
  initialData: any;
  setInitialData: (data: any) => void;
  areRequiredFieldsFilled: boolean;
}

// Utility function to validate URLs - only allow remote HTTP/HTTPS URLs
function isValidUrl(url: string) {
  if (!url) return false;
  try {
    const urlObj = new URL(url);
    // Only allow http and https protocols (no file://, data:, etc.)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

export function GeneralTab({
  offerData,
  selectedOffer,
  isCreateMode = false,
  canManageRewards,
  isSaving,
  setIsSaving,
  redemptionId,
  onClose,
  selectedTags,
  onTagRemove,
  onTagAdd,
  poyntsInput,
  setPoyntsInput,
  titleInput,
  setTitleInput,
  valueInput,
  setValueInput,
  brandNameInput,
  setBrandNameInput,
  statusInput,
  setStatusInput,
  imageUrlInput,
  setImageUrlInput,
  isDirty,
  initialData,
  setInitialData,
  areRequiredFieldsFilled,
}: GeneralTabProps) {
  const queryClient = useQueryClient();

  // Determine if the current image URL input is valid
  const isImageUrlValid = imageUrlInput === '' || isValidUrl(imageUrlInput);

  // Determine which image URL to use for preview
  let previewImageUrl = '';
  if (imageUrlInput) {
    previewImageUrl = imageUrlInput;
  } else if (offerData?.imageUrl) {
    previewImageUrl = offerData.imageUrl;
  } else if (selectedOffer?.items?.[0]?.reward_image) {
    previewImageUrl = selectedOffer.items[0].reward_image;
  }

  // Only show preview if the input is empty and fallback is valid, or if the input is non-empty and valid
  const showImagePreview =
    (imageUrlInput && isValidUrl(imageUrlInput)) ||
    (!imageUrlInput && isValidUrl(previewImageUrl));

  return (
    <div className="space-y-4">
      <div className="flex gap-8">
        <div className="flex-1 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand">
              Brand <span className="text-red-500">*</span>
            </Label>
            <Input
              id="brand"
              value={brandNameInput}
              onChange={(e) => setBrandNameInput(e.target.value)}
              disabled={!canManageRewards}
              required
              className={cn(
                !canManageRewards &&
                "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="Enter brand name..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              disabled={!canManageRewards}
              required
              className={cn(
                !canManageRewards &&
                "opacity-60 cursor-not-allowed bg-background"
              )}
              placeholder="Enter offer title..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poynts">
                Poynts <span className="text-red-500">*</span>
              </Label>
              <Input
                id="poynts"
                type="number"
                value={poyntsInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers and decimal point (no scientific notation)
                  if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                    setPoyntsInput(value);
                  }
                }}
                disabled={!canManageRewards}
                required
                className={cn(
                  !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
                )}
                placeholder="Enter poynts value..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">
                $ Value <span className="text-red-500">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                value={valueInput}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers and decimal point (no scientific notation)
                  if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
                    setValueInput(value);
                  }
                }}
                disabled={!canManageRewards}
                required
                className={cn(
                  !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
                )}
                placeholder="Enter offer value..."
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground ml-2 -mt-2">
            Note: poynts can be overridden at the catalog level
          </p>

          <div className="space-y-2">
            <Label htmlFor="image_url">Image URL</Label>
            <Input
              id="image_url"
              value={imageUrlInput}
              onChange={(e) => setImageUrlInput(e.target.value)}
              disabled={!canManageRewards}
              className={cn(
                !canManageRewards &&
                "opacity-60 cursor-not-allowed bg-background",
                !!imageUrlInput && !isImageUrlValid && "border-red-500 focus-visible:ring-red-500"
              )}
              placeholder="https://..."
            />
            {!isImageUrlValid && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid HTTP/HTTPS URL</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={statusInput}
              onValueChange={(value) => setStatusInput(value)}
              disabled={!canManageRewards}
            >
              <SelectTrigger
                className={cn(
                  !canManageRewards &&
                  "opacity-60 cursor-not-allowed bg-background"
                )}
              >
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                {!isCreateMode && (
                  <SelectItem value="suspended">Suspended</SelectItem>
                )}
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <TagInput
              selectedTags={selectedTags}
              onTagRemove={onTagRemove}
              onTagAdd={onTagAdd}
            />
          </div>
        </div>
        <div className="w-72 shrink-0">
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              {showImagePreview ? (
                <img
                  src={previewImageUrl}
                  alt={`${offerData?.title || selectedOffer?.title || titleInput || "Offer"} Preview`}
                  width={300}
                  height={200}
                  className="w-full rounded-lg"
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-full h-[200px] rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/10 flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="h-24 w-24 mb-2 text-muted-foreground/60 mx-auto" />
                    <p className="text-sm text-muted-foreground font-medium">
                      No image available
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Enter an image URL
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground text-center">
                Offer Preview
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isCreateMode && (
        <div className="flex justify-start pt-4">
          <Button
            variant="default"
            size="default"
            disabled={
              isSaving ||
              !canManageRewards ||
              !isDirty ||
              (!!imageUrlInput && !isImageUrlValid)
            }
            onClick={async () => {
              try {
                setIsSaving(true);

                // Validate required fields before attempting save using native browser validation
                const brandEl = document.getElementById(
                  "brand"
                ) as HTMLInputElement | null;
                const titleEl = document.getElementById(
                  "title"
                ) as HTMLInputElement | null;
                const poyntsEl = document.getElementById(
                  "poynts"
                ) as HTMLInputElement | null;
                const valueEl = document.getElementById(
                  "value"
                ) as HTMLInputElement | null;

                if (
                  !brandEl?.value.trim() ||
                  !titleEl?.value.trim() ||
                  !poyntsEl?.value.trim() ||
                  !valueEl?.value.trim()
                ) {
                  brandEl?.reportValidity();
                  titleEl?.reportValidity();
                  poyntsEl?.reportValidity();
                  valueEl?.reportValidity();
                  setIsSaving(false);
                  return;
                }

                // Validate image URL if provided
                if (imageUrlInput && !isImageUrlValid) {
                  const imageEl = document.getElementById(
                    "image_url"
                  ) as HTMLInputElement | null;
                  imageEl?.focus();
                  setIsSaving(false);
                  return;
                }

                if (isCreateMode) {
                  // Create new offer
                  const payload = {
                    type: "offer",
                    title: titleInput,
                    value: valueInput ? Number(valueInput) : 0,
                    poynts: poyntsInput ? Number(poyntsInput) : 0,
                    tags: selectedTags,
                    reward_status: statusInput,
                    reward_availability: "available",
                    is_enabled: true,
                    brand_name: brandNameInput,
                    imageUrl: imageUrlInput,
                  };

                  const response = await fetch("/api/rewards", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });

                  if (response.ok) {
                    // Close the dialog and refresh the rewards list
                    onClose?.();
                    queryClient.invalidateQueries({
                      queryKey: ["rewards"],
                    });

                    // Reset form
                    setTitleInput("");
                    setValueInput("");
                    setPoyntsInput("");
                  } else {
                    console.error("Failed to create offer");
                  }
                } else {
                  // Update existing offer
                  const payload = {
                    poynts: poyntsInput
                      ? Number(poyntsInput)
                      : offerData?.redem_value ||
                      (selectedOffer && "poynts" in selectedOffer
                        ? selectedOffer.poynts
                        : 0),
                    tags: selectedTags,
                    title: titleInput || offerData?.title || selectedOffer?.title,
                    value: valueInput
                      ? Number(valueInput)
                      : Number(offerData?.value) || selectedOffer?.value,
                    reward_status: statusInput,
                    brand_name:
                      brandNameInput ||
                      offerData?.brand_name ||
                      selectedOffer?.brand_name,
                    imageUrl: imageUrlInput,
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
                      poynts: poyntsInput,
                      tags: selectedTags,
                      title: titleInput,
                      value: valueInput,
                      brand_name: brandNameInput,
                      status: statusInput,
                      imageUrl: imageUrlInput,
                    });

                    // Refresh the offer data
                    queryClient.invalidateQueries({
                      queryKey: ["offer", redemptionId],
                    });
                    // Also refresh the rewards list so the table reflects the changes
                    queryClient.invalidateQueries({
                      queryKey: ["rewards"],
                    });
                  } else {
                    console.error("Failed to update offer");
                  }
                }
              } catch (error) {
                console.error("Error saving offer:", error);
              } finally {
                setIsSaving(false);
              }
            }}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isCreateMode ? "Creating..." : "Saving..."}
              </>
            ) : isCreateMode ? (
              "Create Offer"
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
