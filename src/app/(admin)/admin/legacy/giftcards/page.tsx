import React from "react";
import GiftCardsClient from "./components/giftcards-client";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function GiftCardsPage() {
  return (
    <div className="p-6">

      <GiftCardsClient />
    </div>
  );
}
