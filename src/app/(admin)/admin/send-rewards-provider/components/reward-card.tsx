"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { NormalizedReward } from "@/types/reward-selection";
import Image from "next/image";

interface RewardCardProps {
  reward: NormalizedReward;
  onSelect: () => void;
  isSelected?: boolean;
}

export function RewardCard({ reward, onSelect, isSelected }: RewardCardProps) {
  const isDisabled = reward.status === "inactive";

  // Determine value display with defensive checks
  const minValue = reward.minValue ?? 0;
  const maxValue = reward.maxValue ?? 0;
  const isSingleValue = minValue === maxValue;
  const valueDisplay = isSingleValue
    ? `$${minValue.toFixed(2)}`
    : `$${minValue.toFixed(0)} - $${maxValue.toFixed(0)}`;

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-200 h-full flex flex-col",
        isSelected && "ring-2 ring-blue-500 shadow-lg",
        !isDisabled && "hover:shadow-md cursor-pointer",
        isDisabled && "opacity-50 cursor-not-allowed"
      )}
      onClick={() => !isDisabled && onSelect()}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center z-10">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Product Image */}
      <div className="h-[180px] relative bg-gray-50 flex items-center justify-center">
        {reward.imageUrl ? (
          <Image
            src={reward.imageUrl}
            alt={reward.productName}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="text-gray-400 text-sm">No image</div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Brand Name */}
        <div className="text-xs text-muted-foreground mb-1">
          {reward.brandName}
        </div>

        {/* Product Name */}
        <div className="font-medium text-base mb-3 line-clamp-2 flex-1">
          {reward.productName}
        </div>

        {/* Value */}
        <div className="text-xl font-bold mb-4">
          {valueDisplay} {reward.currency}
        </div>

        {/* Select Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          disabled={isDisabled}
          variant={isSelected ? "default" : "outline"}
          className="w-full"
          size="sm"
        >
          {isSelected ? "Selected" : "Select"}
        </Button>

        {/* Inactive Badge */}
        {isDisabled && (
          <div className="mt-2 text-center text-xs text-muted-foreground">
            Inactive
          </div>
        )}
      </div>
    </Card>
  );
}
