"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { NormalizedReward } from "@/types/reward-selection";
import type { RecipientFormData } from "@/types/reward-selection";

interface RecipientFormProps {
  selectedReward: NormalizedReward | null;
  formData: RecipientFormData;
  onChange: (data: RecipientFormData) => void;
}

export function RecipientForm({
  selectedReward,
  formData,
  onChange,
}: RecipientFormProps) {
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    amount: false,
  });

  // Validation helpers
  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateAmount = (amount: string): boolean => {
    if (!selectedReward || !amount.trim()) return false;
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount)) return false;
    const minValue = selectedReward.minValue ?? 0;
    const maxValue = selectedReward.maxValue ?? 0;
    return numAmount >= minValue && numAmount <= maxValue;
  };

  // Error messages
  const errors = {
    name:
      touched.name && formData.name.trim().length < 2
        ? "Name must be at least 2 characters"
        : "",
    email:
      touched.email && formData.email.trim() && !validateEmail(formData.email)
        ? "Please enter a valid email address"
        : "",
    amount:
      touched.amount && formData.amount.trim() && !validateAmount(formData.amount)
        ? selectedReward
          ? `Amount must be between $${selectedReward.minValue ?? 0} and $${selectedReward.maxValue ?? 0}`
          : "Invalid amount"
        : "",
  };

  const handleBlur = (field: keyof typeof touched) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleChange = (field: keyof RecipientFormData, value: string) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Recipient Information</h3>
      </div>

      {/* Name Field */}
      <div className="space-y-2">
        <Label htmlFor="recipient-name">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="recipient-name"
          placeholder="Enter recipient's name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && (
          <p className="text-sm text-red-500">{errors.name}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label htmlFor="recipient-email">
          Email <span className="text-red-500">*</span>
        </Label>
        <Input
          id="recipient-email"
          type="email"
          placeholder="recipient@example.com"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          className={errors.email ? "border-red-500" : ""}
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Amount Field */}
      <div className="space-y-2">
        <Label htmlFor="recipient-amount">
          Amount{" "}
          {selectedReward && (
            <span className="text-muted-foreground font-normal">
              ($
              {(selectedReward.minValue ?? 0).toFixed(0)} - $
              {(selectedReward.maxValue ?? 0).toFixed(0)} {selectedReward.currency})
            </span>
          )}{" "}
          <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            $
          </span>
          <Input
            id="recipient-amount"
            type="number"
            step="0.01"
            min={selectedReward?.minValue ?? 0}
            max={selectedReward?.maxValue ?? 0}
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => handleChange("amount", e.target.value)}
            onBlur={() => handleBlur("amount")}
            className={`pl-6 ${errors.amount ? "border-red-500" : ""}`}
          />
        </div>
        {selectedReward && !errors.amount && (
          <p className="text-sm text-muted-foreground">
            Enter amount between $
            {(selectedReward.minValue ?? 0).toFixed(2)} and $
            {(selectedReward.maxValue ?? 0).toFixed(2)}
          </p>
        )}
        {errors.amount && (
          <p className="text-sm text-red-500">{errors.amount}</p>
        )}
      </div>

      {/* Subject Line Field */}
      <div className="space-y-2">
        <Label htmlFor="recipient-subject">
          Subject Line <span className="text-red-500">*</span>
        </Label>
        <Input
          id="recipient-subject"
          placeholder="Your $ reward from Poynts AI"
          value={formData.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          This subject line will be used in the email sent to the recipient
        </p>
      </div>

      {/* Custom Message Field */}
      <div className="space-y-2">
        <Label htmlFor="recipient-message">Custom Message (Optional)</Label>
        <Textarea
          id="recipient-message"
          placeholder="Add a personal message to the recipient..."
          value={formData.message}
          onChange={(e) => handleChange("message", e.target.value)}
          rows={4}
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">
          This message will be included in the email to the recipient
        </p>
      </div>
    </div>
  );
}
