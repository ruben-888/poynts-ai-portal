import * as React from "react";
import { GiftCardItem } from "./giftcards-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

interface GiftCardDenominationsProps {
  giftCards: GiftCardItem[];
  onCardSelect: (cardId: number) => void;
  onViewDetails: () => void;
}

export function GiftCardDenominations({
  giftCards,
  onCardSelect,
  onViewDetails,
}: GiftCardDenominationsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Gift Card Denominations</h3>
        <Button
          variant="link"
          className="text-sm flex items-center gap-1"
          onClick={onViewDetails}
        >
          View cards
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {giftCards
          .sort((a, b) => a.value - b.value)
          .map((card) => (
            <div
              key={card.id}
              className="flex flex-col justify-center rounded-lg border p-2.5 bg-muted/5 text-center hover:bg-blue-50/50 hover:border-blue-200 cursor-pointer transition-all duration-150"
              onClick={() => onCardSelect(card.id)}
            >
              <div className="text-base font-medium mb-0.5">${card.value}</div>
              <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                <span>{card.poyntsValue} Poynts</span>
                {card.language && (
                  <Badge
                    variant="secondary"
                    className="uppercase text-[10px] px-1 py-0 h-4"
                  >
                    {card.language}
                  </Badge>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
