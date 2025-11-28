import * as React from "react";
import { ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { GiftCardItem } from "./giftcards-client";

interface AvailableGiftCardsProps {
  giftCards: GiftCardItem[];
  onCardSelect?: (cardId: number) => void;
  className?: string;
}

export function AvailableGiftCards({
  giftCards,
  onCardSelect,
  className = "",
}: AvailableGiftCardsProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>CPID</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Poynts</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {giftCards
              .slice()
              .sort((a, b) => a.value - b.value)
              .map((card) => (
                <TableRow
                  key={card.id}
                  className={
                    onCardSelect ? "cursor-pointer hover:bg-muted/50" : ""
                  }
                  onClick={() => onCardSelect?.(card.id)}
                >
                  <TableCell>{card.cpidx || "N/A"}</TableCell>
                  <TableCell>${card.value}</TableCell>
                  <TableCell>{card.poyntsValue}</TableCell>
                  <TableCell>{card.language || "N/A"}</TableCell>
                  <TableCell>{card.tags.join(", ") || "N/A"}</TableCell>
                  <TableCell>
                    {onCardSelect && <ChevronRight className="h-4 w-4" />}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
