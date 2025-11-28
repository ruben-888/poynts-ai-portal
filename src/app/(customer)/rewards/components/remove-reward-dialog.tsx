"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GroupedReward } from "./columns";

interface RemoveRewardDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reward: GroupedReward | null;
  onConfirm: (reward: GroupedReward) => void;
}

export function RemoveRewardDialog({
  isOpen,
  onOpenChange,
  reward,
  onConfirm,
}: RemoveRewardDialogProps) {
  // Actual catalog list from the system
  const catalogs = [
    "Well Main 2.0",
    "Wyndham 2.0",
    "Oscar Health 2.0",
    "Bio Delivery Sciences 2.0",
    "Meridian 2.0",
    "Penn National Gaming 2.0",
    "Suffolk Construction 2.0",
    "Wayne Health 2.0",
    "Jack Entertainment 2.0",
    "Bank of America 2.0",
    "BofA Validation 2.0",
    "Well FF 2.0",
    "Acme 2.0",
  ];

  const handleConfirm = () => {
    if (reward) {
      onConfirm(reward);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Remove Reward</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this reward? This action is not
            reversible.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm font-medium mb-2 text-amber-600">
            <strong>Warning:</strong> This reward will be removed from these
            catalogs <strong>immediately</strong>:
          </p>
          <ul className="list-disc pl-6 text-sm space-y-1">
            {catalogs.map((catalog, index) => (
              <li key={index}>{catalog}</li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm}>
            Confirm Removal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
