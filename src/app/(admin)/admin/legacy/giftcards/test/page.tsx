"use client";

import React from "react";
import { TestGiftCardClient } from "./components/test-gift-card-client";

export default function TestGiftCardPage() {
  return (
    <div className="p-6">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold">Test Gift Card</h1>
          <p className="text-muted-foreground">
            Test gift card redemption with different dollar values
          </p>
        </div>
        <TestGiftCardClient />
      </div>
    </div>
  );
}