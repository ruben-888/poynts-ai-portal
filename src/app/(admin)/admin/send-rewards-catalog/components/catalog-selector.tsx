"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { CATALOG_OFFERS, type CatalogOffer } from "../data/catalogs";

interface OfferSelectorProps {
  selectedOffer?: string;
  onSelect: (offer: CatalogOffer) => void;
}

// Color map for fallback backgrounds
const OFFER_COLORS: Record<string, string> = {
  "offer-amazon": "bg-gradient-to-br from-orange-400 to-yellow-500",
  "offer-starbucks": "bg-gradient-to-br from-green-500 to-green-700",
  "offer-tripgift": "bg-gradient-to-br from-cyan-400 to-blue-500",
  "offer-visa": "bg-gradient-to-br from-blue-600 to-blue-800",
  "offer-charity": "bg-gradient-to-br from-pink-400 to-rose-500",
  "offer-credit-boost": "bg-gradient-to-br from-indigo-400 to-purple-500",
  "offer-financial-planning": "bg-gradient-to-br from-emerald-400 to-teal-500",
  "offer-life-insurance": "bg-gradient-to-br from-sky-400 to-blue-500",
};

function OfferImage({ offer }: { offer: CatalogOffer }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div
        className={cn(
          "h-32 flex items-center justify-center p-4",
          OFFER_COLORS[offer.id] || "bg-gradient-to-br from-gray-400 to-gray-600"
        )}
      >
        <span className="text-white font-bold text-lg text-center drop-shadow-md">
          {offer.name}
        </span>
      </div>
    );
  }

  return (
    <div className="h-32 relative bg-white flex items-center justify-center p-4">
      <div className="relative w-full h-full">
        <Image
          src={offer.imageUrl}
          alt={offer.name}
          fill
          className="object-contain"
          onError={() => setHasError(true)}
        />
      </div>
    </div>
  );
}

export function OfferSelector({ selectedOffer, onSelect }: OfferSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {CATALOG_OFFERS.map((offer) => {
        const isSelected = selectedOffer === offer.id;

        return (
          <Card
            key={offer.id}
            className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg bg-white",
              isSelected && "ring-2 ring-purple-500 shadow-lg"
            )}
            onClick={() => onSelect(offer)}
          >
            {/* Selected Indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 z-10 h-6 w-6 bg-purple-500 rounded-full flex items-center justify-center">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}

            {/* Offer Image/Logo */}
            <OfferImage offer={offer} />

            {/* Offer Details */}
            <div className="p-4">
              <h3 className="font-semibold text-base mb-1">{offer.name}</h3>
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2 min-h-[2.5rem]">
                {offer.description}
              </p>

              {/* Points and Dollar Value */}
              <div className="flex items-center justify-between">
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-purple-600">
                    {offer.pointsCost.toLocaleString()}
                  </span>
                  <span className="text-sm text-muted-foreground">ANGL</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ${offer.dollarValue}
                </span>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
