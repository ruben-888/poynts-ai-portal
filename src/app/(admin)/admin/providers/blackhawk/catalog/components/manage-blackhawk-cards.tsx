"use client";

import * as React from "react";
import { ChevronRight, Loader2, Pause, Play } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogHeader,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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

interface ManageBlackhawkCardsProps {
  cards: GiftCard[];
  onEditCard: (cardId: string) => void;
  canEditCards?: boolean;
  canSuspendCards?: boolean;
  canActivateCards?: boolean;
}

// Utility function to format currency
const formatCurrency = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) return "N/A";
  
  // If the amount is a whole number, don't show decimals
  if (amount % 1 === 0) {
    return `$${amount}`;
  }
  
  // Otherwise, show with 2 decimal places
  return `$${amount.toFixed(2)}`;
};

export function ManageBlackhawkCards({
  cards,
  onEditCard,
  canEditCards = true,
  canSuspendCards = true,
  canActivateCards = true,
}: ManageBlackhawkCardsProps) {
  const [suspendedCards, setSuspendedCards] = React.useState<Set<string>>(
    new Set(
      cards
        .filter((c) => c.reward_status === "suspended")
        .map((c) => c.giftcard_id)
    )
  );
  const [processingCards, setProcessingCards] = React.useState<Set<string>>(
    new Set()
  );
  const [showSuspendConfirm, setShowSuspendConfirm] = React.useState(false);
  const [cardToSuspend, setCardToSuspend] = React.useState<string | null>(null);

  // Update suspended cards when props change
  React.useEffect(() => {
    setSuspendedCards(
      new Set(
        cards
          .filter((c) => c.reward_status === "suspended")
          .map((c) => c.giftcard_id)
      )
    );
  }, [cards]);

  const toggleCardSuspension = async (cardId: string) => {
    // If already suspended, just activate it
    if (suspendedCards.has(cardId)) {
      if (!canActivateCards) return;
      
      setProcessingCards((prev) => new Set(prev).add(cardId));

      try {
        // Simulate API call - in real implementation, this would call the actual API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update local state after successful API call
        setSuspendedCards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
      } catch (error) {
        console.error("Error activating card:", error);
      } finally {
        setProcessingCards((prev) => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
      }
    } else {
      // For suspend, show confirm dialog
      if (!canSuspendCards) return;
      setCardToSuspend(cardId);
      setShowSuspendConfirm(true);
    }
  };

  const handleSuspendConfirm = async () => {
    if (!cardToSuspend) return;

    setShowSuspendConfirm(false);
    setProcessingCards((prev) => new Set(prev).add(cardToSuspend));

    try {
      // Simulate API call - in real implementation, this would call the actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state after successful API call
      setSuspendedCards((prev) => {
        const newSet = new Set(prev);
        newSet.add(cardToSuspend);
        return newSet;
      });
    } catch (error) {
      console.error("Error suspending card:", error);
    } finally {
      setProcessingCards((prev) => {
        const newSet = new Set(prev);
        newSet.delete(cardToSuspend);
        return newSet;
      });
      setCardToSuspend(null);
    }
  };

  const getCardToSuspend = () => {
    return cards.find(c => c.giftcard_id === cardToSuspend);
  };

  return (
    <TooltipProvider>
      <div className="space-y-4">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CPIDX</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cards.map((card) => {
                const isSuspended = suspendedCards.has(card.giftcard_id);
                const isProcessing = processingCards.has(card.giftcard_id);
                const isInactive = card.reward_status === "deleted" || card.reward_status === "inactive";
                
                return (
                  <TableRow key={card.giftcard_id}>
                    <TableCell className="font-mono text-sm">{card.cpidx}</TableCell>
                    <TableCell className="text-right">{formatCurrency(card.value)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          card.reward_status === "active" && !isSuspended
                            ? "default" 
                            : card.reward_status === "suspended" || isSuspended
                              ? "secondary"
                              : "outline"
                        }
                        className={cn(
                          "text-xs",
                          card.reward_status === "active" && !isSuspended && "bg-green-100 text-green-800 hover:bg-green-100"
                        )}
                      >
                        {isSuspended ? "suspended" : card.reward_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleCardSuspension(card.giftcard_id)}
                              className="flex items-center gap-1"
                              disabled={isProcessing || isInactive || (!isSuspended && !canSuspendCards) || (isSuspended && !canActivateCards)}
                            >
                              {isProcessing ? (
                                <>
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                  <span className="text-xs">Processing...</span>
                                </>
                              ) : isSuspended ? (
                                <>
                                  <Play className="h-4 w-4 text-green-600" />
                                  <span className="text-xs">Activate</span>
                                </>
                              ) : (
                                <>
                                  <Pause className="h-4 w-4 text-amber-600" />
                                  <span className="text-xs">Suspend</span>
                                </>
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {isProcessing
                              ? "Processing request..."
                              : isInactive
                                ? "Cannot suspend/activate inactive cards"
                                : isSuspended
                                  ? `Activate this card${!canActivateCards ? " (no permission)" : ""}`
                                  : `Suspend this card${!canSuspendCards ? " (no permission)" : ""}`}
                          </TooltipContent>
                        </Tooltip>

                        {canEditCards && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditCard(card.giftcard_id)}
                                className="flex items-center gap-1"
                              >
                                <span className="text-xs">Edit</span>
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Edit card details
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Confirmation Dialog for Suspending Card */}
        <Dialog
          open={showSuspendConfirm}
          onOpenChange={setShowSuspendConfirm}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Suspend Gift Card</DialogTitle>
              <DialogDescription>
                Are you sure you want to suspend this gift card?
              </DialogDescription>
            </DialogHeader>

            {cardToSuspend && (
              <div className="py-2">
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="font-medium">Card:</span> {getCardToSuspend()?.reward_name}
                  </p>
                  <p className="text-sm">
                    <span className="font-medium">Value:</span> {formatCurrency(getCardToSuspend()?.value)}
                  </p>
                  <p className="text-sm font-mono">
                    {getCardToSuspend()?.cpidx}
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="flex space-x-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuspendConfirm(false);
                  setCardToSuspend(null);
                }}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleSuspendConfirm}>
                Yes, Suspend Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}