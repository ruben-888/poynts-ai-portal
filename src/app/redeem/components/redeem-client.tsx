"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Copy, ExternalLink } from "lucide-react";

// Mock data - will be replaced with actual data from the redemption UUID
const MOCK_GIFT_CARD = {
  brand: "Amazon",
  amount: 5,
  redemptionCode: "AMZN-1234-5678-90AB-CDEF",
  redemptionUrl: "https://www.amazon.com/gc/redeem",
};

export function RedeemClient() {
  const [isRedeemed, setIsRedeemed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRedeem = () => {
    setIsRedeemed(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(MOCK_GIFT_CARD.redemptionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Congratulations!</CardTitle>
          <CardDescription>
            You&apos;ve been awarded a gift card
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isRedeemed ? (
            <>
              <div className="rounded-lg bg-gradient-to-r from-orange-400 to-orange-600 p-6 text-center text-white shadow-lg">
                <div className="text-sm font-medium opacity-90">{MOCK_GIFT_CARD.brand}</div>
                <div className="mt-2 text-4xl font-bold">${MOCK_GIFT_CARD.amount}</div>
                <div className="mt-1 text-sm opacity-90">Gift Card</div>
              </div>

              <Button
                onClick={handleRedeem}
                className="w-full"
                size="lg"
              >
                Redeem It
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/50 p-4">
                  <div className="mb-2 text-sm font-medium text-muted-foreground">
                    Your Redemption Code
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <code className="flex-1 rounded bg-background px-3 py-2 font-mono text-sm">
                      {MOCK_GIFT_CARD.redemptionCode}
                    </code>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900">
                  <p className="font-medium">Next Steps:</p>
                  <ol className="mt-2 ml-4 list-decimal space-y-1">
                    <li>Copy the redemption code above</li>
                    <li>Click the button below to visit {MOCK_GIFT_CARD.brand}</li>
                    <li>Enter the code to add funds to your account</li>
                  </ol>
                </div>

                <Button
                  asChild
                  className="w-full"
                  size="lg"
                >
                  <a
                    href={MOCK_GIFT_CARD.redemptionUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Redeem on {MOCK_GIFT_CARD.brand}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
