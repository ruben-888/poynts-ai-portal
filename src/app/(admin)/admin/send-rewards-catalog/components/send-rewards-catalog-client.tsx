"use client";

import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, CheckCircle2, ChevronRight, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { OfferSelector } from "./catalog-selector";
import { SubItemSelector } from "./catalog-item-selector";
import { CATALOG_OFFERS, type CatalogOffer, type SubItem } from "../data/catalogs";

interface RecipientFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function SendRewardsCatalogClient() {
  const [selectedOffer, setSelectedOffer] = useState<CatalogOffer | null>(null);
  const [selectedSubItem, setSelectedSubItem] = useState<SubItem | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("inventory");
  const [recipientData, setRecipientData] = useState<RecipientFormData>({
    name: "",
    email: "",
    subject: "Your reward from Poynts AI",
    message: "",
  });
  const [isSubItemModalOpen, setIsSubItemModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subItemImageError, setSubItemImageError] = useState(false);

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Step completion checks
  const isOfferComplete = !!selectedOffer && (!selectedOffer.hasSubItems || !!selectedSubItem);
  const isRecipientComplete =
    recipientData.name.trim() !== "" &&
    recipientData.email.trim() !== "" &&
    validateEmail(recipientData.email) &&
    recipientData.subject.trim() !== "";
  const isPaymentComplete = !!selectedPaymentMethod;

  const handleOfferSelect = (offer: CatalogOffer) => {
    setSelectedOffer(offer);
    setSelectedSubItem(null);
    setSubItemImageError(false);

    // If offer has sub-items, open the modal
    if (offer.hasSubItems) {
      setIsSubItemModalOpen(true);
    }
  };

  const handleSubItemSelect = (subItem: SubItem) => {
    setSelectedSubItem(subItem);
    setSubItemImageError(false);
  };

  const handleSubmit = async () => {
    if (!isOfferComplete || !isRecipientComplete || !isPaymentComplete) {
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement catalog reward sending API
      console.log("Sending catalog reward:", {
        offerId: selectedOffer?.id,
        subItemId: selectedSubItem?.id,
        recipient: recipientData,
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Show success screen
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to send reward:", error);
      alert("Failed to send reward. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendAnother = () => {
    setSelectedOffer(null);
    setSelectedSubItem(null);
    setRecipientData({
      name: "",
      email: "",
      subject: "Your reward from Poynts AI",
      message: "",
    });
    setShowSuccess(false);
  };

  const handleChange = (field: keyof RecipientFormData, value: string) => {
    setRecipientData((prev) => ({ ...prev, [field]: value }));
  };

  // Success screen
  if (showSuccess) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Reward Sent Successfully!</h2>
            <p className="text-muted-foreground mb-8">
              The reward has been sent to the recipient.
            </p>
            <Button onClick={handleSendAnother} size="lg">
              Send Another Reward
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Get display name for selected reward
  const getSelectedRewardDisplay = () => {
    if (!selectedOffer) return null;
    if (selectedOffer.hasSubItems && selectedSubItem) {
      return `${selectedOffer.name} - ${selectedSubItem.name}`;
    }
    return selectedOffer.name;
  };

  // Main wizard
  return (
    <div className="max-w-full">
      <Card className="p-6">
        {/* Step 1: Select Offer */}
        <div className="flex flex-col py-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isOfferComplete
                  ? "bg-green-500 text-white"
                  : "bg-purple-500 text-white"
              )}
            >
              {isOfferComplete ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <div>
              <div className="font-semibold">Select Reward</div>
              <div className="text-sm text-muted-foreground">
                Choose a reward from the catalog
              </div>
            </div>
          </div>

          <OfferSelector
            selectedOffer={selectedOffer?.id}
            onSelect={handleOfferSelect}
          />

          {/* Show selected sub-item if applicable */}
          {selectedOffer?.hasSubItems && selectedSubItem && (
            <div className="mt-4 p-4 bg-purple-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* TODO: Re-enable image loading once charity images are ready */}
                <div className="h-12 w-12 relative bg-rose-100 rounded border flex items-center justify-center overflow-hidden">
                  <Heart className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <div className="font-medium">{selectedSubItem.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedSubItem.category}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSubItemModalOpen(true)}
              >
                Change
              </Button>
            </div>
          )}
        </div>

        {/* Sub-Item Selector Modal */}
        <SubItemSelector
          open={isSubItemModalOpen}
          onOpenChange={setIsSubItemModalOpen}
          offer={selectedOffer}
          onSelect={handleSubItemSelect}
        />

        {/* Step 2: Recipient Details */}
        <div className="flex items-start justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isRecipientComplete
                  ? "bg-green-500 text-white"
                  : isOfferComplete
                  ? "bg-purple-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isRecipientComplete ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <div>
              <div className="font-semibold">Recipient Details</div>
              <div className="text-sm text-muted-foreground">
                Enter recipient information
              </div>
            </div>
          </div>
          {!isOfferComplete && (
            <div className="text-sm text-muted-foreground italic">
              Select a reward first
            </div>
          )}
        </div>

        {isOfferComplete && (
          <div className="py-4 border-b space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter recipient's name"
                  value={recipientData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="recipient@example.com"
                  value={recipientData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subject Line <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                placeholder="Your reward from Poynts AI"
                value={recipientData.subject}
                onChange={(e) => handleChange("subject", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Custom Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Add a personal message to the recipient..."
                rows={3}
                value={recipientData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                className="resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 3: Fulfillment Method */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isPaymentComplete
                  ? "bg-green-500 text-white"
                  : isRecipientComplete
                  ? "bg-purple-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isPaymentComplete ? <Check className="h-5 w-5" /> : "3"}
            </div>
            <div>
              <div className="font-semibold">Fulfillment</div>
            </div>
          </div>
          <div className="w-64">
            <Select
              value={selectedPaymentMethod}
              onValueChange={setSelectedPaymentMethod}
              disabled={!isRecipientComplete}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inventory">From Inventory</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {selectedOffer ? (
              <span>
                Sending: <strong>{getSelectedRewardDisplay()}</strong>
                {" · "}
                <span className="text-purple-600 font-medium">
                  {selectedOffer.pointsCost.toLocaleString()} ANGL
                </span>
                {" · "}${selectedOffer.dollarValue}
              </span>
            ) : (
              "No reward selected"
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={
              !isOfferComplete ||
              !isRecipientComplete ||
              !isPaymentComplete ||
              isSubmitting
            }
            className="min-w-32"
          >
            {isSubmitting ? (
              "Submitting..."
            ) : (
              <>
                Submit Order <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
