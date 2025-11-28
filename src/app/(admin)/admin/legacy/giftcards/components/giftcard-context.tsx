"use client";

import * as React from "react";
import { GiftCard, GiftCardBrand } from "./giftcards-client";

interface GiftCardContextType {
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  selectedGiftCard: GiftCard | null;
  setSelectedGiftCard: (giftCard: GiftCard | null) => void;
  availableBrands: GiftCardBrand[];
}

const GiftCardContext = React.createContext<GiftCardContextType | undefined>(
  undefined,
);

interface GiftCardProviderProps {
  children: React.ReactNode;
  value: GiftCardContextType;
}

export function GiftCardProvider({ children, value }: GiftCardProviderProps) {
  return (
    <GiftCardContext.Provider value={value}>
      {children}
    </GiftCardContext.Provider>
  );
}

export function useGiftCard() {
  const context = React.useContext(GiftCardContext);
  if (context === undefined) {
    throw new Error("useGiftCard must be used within a GiftCardProvider");
  }
  return context;
}
