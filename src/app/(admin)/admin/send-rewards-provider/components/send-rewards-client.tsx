"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, CheckCircle2, ChevronRight, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecipientForm } from "./recipient-form";
import { ProviderSelector } from "./provider-selector";
import { RewardSelectorModal } from "./reward-selector-modal";
import type { NormalizedReward, RecipientFormData } from "@/types/reward-selection";
import Image from "next/image";

// Hardcoded Amazon reward
const AMAZON_REWARD: NormalizedReward = {
  sourceId: "source-amazon",
  sourceIdentifier: "amazon-gift-card",
  brandName: "Amazon",
  productName: "Amazon Gift Card",
  description: "Amazon.com Gift Card",
  imageUrl: "/img/amazon-card.png",
  currency: "USD",
  status: "active",
  minValue: 1,
  maxValue: 2000,
  countries: ["US"],
};

interface RewardSourceBalance {
  available: number;
  currency: string;
  lastUpdated: string | null;
}

interface RewardSource {
  id: string;
  name: string;
  description?: string;
  status: string;
  balance?: RewardSourceBalance | null;
  balanceError?: string;
}

interface RewardSourcesResponse {
  data: RewardSource[];
  registered: string[];
}

export default function SendRewardsClient() {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [selectedReward, setSelectedReward] = useState<NormalizedReward | null>(null);
  const [selectedFromEmail, setSelectedFromEmail] = useState<string>("rewards@poynts.ai");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("balance");
  const [recipientData, setRecipientData] = useState<RecipientFormData>({
    name: "",
    email: "",
    amount: "",
    subject: "Your $ reward from Poynts AI",
    message: "",
  });
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Update subject line when amount changes
  React.useEffect(() => {
    if (recipientData.amount && !isNaN(parseFloat(recipientData.amount))) {
      const amount = parseFloat(recipientData.amount);
      const newSubject = `Your $${amount.toFixed(2)} reward from Poynts AI`;
      if (recipientData.subject !== newSubject) {
        setRecipientData((prev) => ({
          ...prev,
          subject: newSubject,
        }));
      }
    } else if (recipientData.subject.includes("Your $") && recipientData.subject.includes("reward from Poynts AI")) {
      setRecipientData((prev) => ({
        ...prev,
        subject: "Your $ reward from Poynts AI",
      }));
    }
  }, [recipientData.amount, recipientData.subject]);

  // Fetch reward sources with balances
  const { data: rewardSourcesData } = useQuery({
    queryKey: ["reward-sources", "with-balances"],
    queryFn: async () => {
      const response = await axios.get<RewardSourcesResponse>(
        "/api/v1/reward-sources",
        {
          params: {
            include_balances: true,
          },
        }
      );
      return response.data;
    },
  });

  // Get selected provider's balance
  const selectedProviderBalance = React.useMemo(() => {
    if (!selectedProvider || !rewardSourcesData) return null;
    const provider = rewardSourcesData.data.find((s) => s.id === selectedProvider);
    return provider?.balance?.available ?? null;
  }, [selectedProvider, rewardSourcesData]);

  // Auto-select Amazon reward when Amazon provider is selected
  React.useEffect(() => {
    if (selectedProvider === "source-amazon") {
      setSelectedReward(AMAZON_REWARD);
    } else if (selectedReward?.sourceId === "source-amazon") {
      setSelectedReward(null);
    }
  }, [selectedProvider, selectedReward]);

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateAmount = (amount: string, reward: NormalizedReward | null): boolean => {
    if (!reward || !amount.trim()) return false;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return false;
    const minValue = reward.minValue ?? 0;
    const maxValue = reward.maxValue ?? 0;
    return numAmount >= minValue && numAmount <= maxValue;
  };

  // From email options
  const FROM_EMAIL_OPTIONS: Record<string, { label: string; fromName: string }> = {
    "rewards@poynts.ai": { label: "rewards@poynts.ai", fromName: "PoyntsAI Rewards" },
    "tim@carepoynt.com": { label: "tim@carepoynt.com", fromName: "PoyntsAI Rewards" },
  };

  // Step completion checks
  const isProviderComplete = !!selectedProvider;
  const isRewardComplete = !!selectedReward;
  const isRecipientComplete =
    recipientData.name.trim() !== "" &&
    recipientData.email.trim() !== "" &&
    validateEmail(recipientData.email) &&
    recipientData.amount.trim() !== "" &&
    validateAmount(recipientData.amount, selectedReward) &&
    recipientData.subject.trim() !== "";
  const isFromEmailComplete = !!selectedFromEmail;
  const isPaymentComplete = !!selectedPaymentMethod;

  const handleSubmit = async () => {
    if (!isProviderComplete || !isRewardComplete || !isRecipientComplete || !isFromEmailComplete || !isPaymentComplete) {
      return;
    }

    if (!selectedReward) {
      alert("Please select a reward");
      return;
    }

    setIsSubmitting(true);
    try {
      // Direct send: create gift card via provider + send email
      await axios.post("/api/v1/internal/emails/send-gift-card", {
        source_id: selectedProvider,
        source_identifier: selectedReward.sourceIdentifier,
        amount: parseFloat(recipientData.amount),
        currency: selectedReward.currency,
        recipient_email: recipientData.email,
        recipient_name: recipientData.name,
        from_email: selectedFromEmail,
        from_name: FROM_EMAIL_OPTIONS[selectedFromEmail]?.fromName || "PoyntsAI Rewards",
        subject: recipientData.subject,
        custom_message: recipientData.message,
        card_image_url: selectedReward.imageUrl?.startsWith("http") ? selectedReward.imageUrl : undefined,
      });

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
    // Reset form and hide success screen
    setSelectedProvider("");
    setSelectedReward(null);
    setRecipientData({
      name: "",
      email: "",
      amount: "",
      subject: "Your $ reward from Poynts AI",
      message: "",
    });
    setShowSuccess(false);
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
              The gift card has been created and the email has been sent to the recipient.
            </p>
            <Button onClick={handleSendAnother} size="lg">
              Send Another Reward
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Main wizard
  return (
    <div className="max-w-full">
      <Card className="p-6">
        {/* Step 1: Provider Selection */}
        <div className="flex flex-col py-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isProviderComplete
                  ? "bg-green-500 text-white"
                  : "bg-blue-500 text-white"
              )}
            >
              {isProviderComplete ? <Check className="h-5 w-5" /> : "1"}
            </div>
            <div>
              <div className="font-semibold">Reward Provider</div>
              <div className="text-sm text-muted-foreground">
                Choose your reward fulfillment provider
              </div>
            </div>
          </div>

          <ProviderSelector
            selectedProvider={selectedProvider}
            onSelect={setSelectedProvider}
          />
        </div>

        {/* Step 2: Select Reward */}
        <div className="flex flex-col py-4 border-b">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isRewardComplete
                  ? "bg-green-500 text-white"
                  : isProviderComplete
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isRewardComplete ? <Check className="h-5 w-5" /> : "2"}
            </div>
            <div>
              <div className="font-semibold">Select Reward</div>
              <div className="text-sm text-muted-foreground">
                Choose a specific gift card or reward
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => setIsRewardModalOpen(true)}
              disabled={!isProviderComplete || selectedProvider === "source-amazon"}
              className="min-w-48"
            >
              <Gift className="mr-2 h-4 w-4" />
              {selectedProvider === "source-amazon"
                ? "Amazon Gift Card (Auto-selected)"
                : selectedReward
                ? "Change Reward"
                : "Select Reward"}
            </Button>

            {selectedReward && (
              <div className="flex items-center gap-3">
                <Image
                  src={selectedReward.imageUrl}
                  alt={selectedReward.productName}
                  width={48}
                  height={48}
                  className="object-contain rounded border"
                />
                <div>
                  <div className="font-medium">{selectedReward.productName}</div>
                  <div className="text-sm text-muted-foreground">
                    $
                    {(selectedReward.minValue ?? 0).toFixed(0)} - $
                    {(selectedReward.maxValue ?? 0).toFixed(0)} {selectedReward.currency}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Reward Selector Modal */}
        <RewardSelectorModal
          open={isRewardModalOpen}
          onOpenChange={setIsRewardModalOpen}
          providerId={selectedProvider}
          onSelect={(reward) => {
            setSelectedReward(reward);
            setIsRewardModalOpen(false);
          }}
        />

        {/* Step 3: Recipient Details */}
        <div className="flex items-start justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isRecipientComplete
                  ? "bg-green-500 text-white"
                  : isRewardComplete
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isRecipientComplete ? <Check className="h-5 w-5" /> : "3"}
            </div>
            <div>
              <div className="font-semibold">Recipient Details</div>
              <div className="text-sm text-muted-foreground">
                Enter recipient information and reward amount
              </div>
            </div>
          </div>
          {!isRewardComplete && (
            <div className="text-sm text-muted-foreground italic">
              Select a reward first
            </div>
          )}
        </div>

        {isRewardComplete && (
          <div className="py-4 border-b">
            <RecipientForm
              selectedReward={selectedReward}
              formData={recipientData}
              onChange={setRecipientData}
            />
          </div>
        )}

        {/* Step 4: From Email */}
        <div className="flex items-center justify-between py-4 border-b">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isFromEmailComplete
                  ? "bg-green-500 text-white"
                  : isRecipientComplete
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isFromEmailComplete ? <Check className="h-5 w-5" /> : "4"}
            </div>
            <div>
              <div className="font-semibold">From Email</div>
              <div className="text-sm text-muted-foreground">
                Choose the sender email address
              </div>
            </div>
          </div>
          <div className="w-64">
            <Select
              value={selectedFromEmail}
              onValueChange={setSelectedFromEmail}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FROM_EMAIL_OPTIONS).map(([email, config]) => (
                  <SelectItem key={email} value={email}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Step 5: Payment Method */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold",
                isPaymentComplete
                  ? "bg-green-500 text-white"
                  : isFromEmailComplete
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-600"
              )}
            >
              {isPaymentComplete ? <Check className="h-5 w-5" /> : "5"}
            </div>
            <div>
              <div className="font-semibold">Payment method</div>
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
                <SelectItem value="balance">
                  Balance
                  {selectedProviderBalance !== null
                    ? ` ($${selectedProviderBalance.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })} USD)`
                    : selectedProvider === "source-blackhawk"
                    ? " ($??? USD)"
                    : ""}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex items-center justify-between border-t pt-4">
          <div className="text-sm text-muted-foreground">
            {recipientData.amount && !isNaN(parseFloat(recipientData.amount))
              ? `Amount: $${parseFloat(recipientData.amount).toFixed(2)} ${selectedReward?.currency || "USD"}`
              : "No amount specified"}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={
              !isProviderComplete ||
              !isRewardComplete ||
              !isRecipientComplete ||
              !isFromEmailComplete ||
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
