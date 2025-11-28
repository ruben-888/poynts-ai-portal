"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CreditCard, TestTube, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { GiftCard, GiftCardItem } from "../../../components/giftcards-client";

// Mock data for available gift cards with different value ranges
const mockGiftCards: GiftCard[] = [
  {
    id: 1,
    rewardName: "Amazon Gift Card",
    valueType: "VARIABLE_VALUE",
    minValue: 5,
    maxValue: 500,
    status: "active",
    rewardStatus: "active",
    rewardAvailability: "available",
    rewardType: "gift_card",
    providerRewardId: "AMZ001",
    rebateInfo: {
      providerPercentage: 0.02,
      basePercentage: 0.015,
      customerPercentage: 0.01,
      cpPercentage: 0.005,
    },
    brand: {
      id: 1,
      key: "amazon",
      name: "Amazon",
      imageUrls: {
        "300w-326ppi": "/api/placeholder/300/200",
        "200w-326ppi": "/api/placeholder/200/133",
        "130w-326ppi": "/api/placeholder/130/87",
        "80w-326ppi": "/api/placeholder/80/53",
        "278w-326ppi": "/api/placeholder/278/186",
        "1200w-326ppi": "/api/placeholder/1200/800",
      },
    },
    provider: {
      id: 1,
      name: "TangoCard",
      code: "TANGO",
      enabled: true,
      status: "active",
    },
    giftCards: {
      count: 5,
      lowestValue: 5,
      highestValue: 500,
      valuesList: "5, 10, 25, 50, 100",
      items: [
        { id: 1, value: 5, poyntsValue: 500, inventoryType: "digital", inventoryRemaining: 100, language: "EN", tags: ["shopping"], customTitle: "", cpidx: "" },
        { id: 2, value: 10, poyntsValue: 1000, inventoryType: "digital", inventoryRemaining: 100, language: "EN", tags: ["shopping"], customTitle: "", cpidx: "" },
        { id: 3, value: 25, poyntsValue: 2500, inventoryType: "digital", inventoryRemaining: 100, language: "EN", tags: ["shopping"], customTitle: "", cpidx: "" },
        { id: 4, value: 50, poyntsValue: 5000, inventoryType: "digital", inventoryRemaining: 100, language: "EN", tags: ["shopping"], customTitle: "", cpidx: "" },
        { id: 5, value: 100, poyntsValue: 10000, inventoryType: "digital", inventoryRemaining: 100, language: "EN", tags: ["shopping"], customTitle: "", cpidx: "" },
      ],
    },
  },
  {
    id: 2,
    rewardName: "Starbucks Gift Card",
    valueType: "FIXED_VALUE",
    minValue: 10,
    maxValue: 100,
    status: "active",
    rewardStatus: "active",
    rewardAvailability: "available",
    rewardType: "gift_card",
    providerRewardId: "SBX001",
    rebateInfo: {
      providerPercentage: 0.03,
      basePercentage: 0.025,
      customerPercentage: 0.015,
      cpPercentage: 0.01,
    },
    brand: {
      id: 2,
      key: "starbucks",
      name: "Starbucks",
      imageUrls: {
        "300w-326ppi": "/api/placeholder/300/200",
        "200w-326ppi": "/api/placeholder/200/133",
        "130w-326ppi": "/api/placeholder/130/87",
        "80w-326ppi": "/api/placeholder/80/53",
        "278w-326ppi": "/api/placeholder/278/186",
        "1200w-326ppi": "/api/placeholder/1200/800",
      },
    },
    provider: {
      id: 2,
      name: "Blackhawk",
      code: "BLACKHAWK",
      enabled: true,
      status: "active",
    },
    giftCards: {
      count: 3,
      lowestValue: 10,
      highestValue: 100,
      valuesList: "10, 25, 100",
      items: [
        { id: 6, value: 10, poyntsValue: 1000, inventoryType: "digital", inventoryRemaining: 50, language: "EN", tags: ["food", "coffee"], customTitle: "", cpidx: "" },
        { id: 7, value: 25, poyntsValue: 2500, inventoryType: "digital", inventoryRemaining: 50, language: "EN", tags: ["food", "coffee"], customTitle: "", cpidx: "" },
        { id: 8, value: 100, poyntsValue: 10000, inventoryType: "digital", inventoryRemaining: 25, language: "EN", tags: ["food", "coffee"], customTitle: "", cpidx: "" },
      ],
    },
  },
  {
    id: 3,
    rewardName: "Target Gift Card",
    valueType: "VARIABLE_VALUE",
    minValue: 15,
    maxValue: 300,
    status: "active",
    rewardStatus: "active",
    rewardAvailability: "available",
    rewardType: "gift_card",
    providerRewardId: "TGT001",
    rebateInfo: {
      providerPercentage: 0.025,
      basePercentage: 0.02,
      customerPercentage: 0.012,
      cpPercentage: 0.008,
    },
    brand: {
      id: 3,
      key: "target",
      name: "Target",
      imageUrls: {
        "300w-326ppi": "/api/placeholder/300/200",
        "200w-326ppi": "/api/placeholder/200/133",
        "130w-326ppi": "/api/placeholder/130/87",
        "80w-326ppi": "/api/placeholder/80/53",
        "278w-326ppi": "/api/placeholder/278/186",
        "1200w-326ppi": "/api/placeholder/1200/800",
      },
    },
    provider: {
      id: 3,
      name: "Tremendous",
      code: "TREMENDOUS",
      enabled: true,
      status: "active",
    },
    giftCards: {
      count: 4,
      lowestValue: 15,
      highestValue: 300,
      valuesList: "15, 30, 75, 150",
      items: [
        { id: 9, value: 15, poyntsValue: 1500, inventoryType: "digital", inventoryRemaining: 75, language: "EN", tags: ["retail", "shopping"], customTitle: "", cpidx: "" },
        { id: 10, value: 30, poyntsValue: 3000, inventoryType: "digital", inventoryRemaining: 75, language: "EN", tags: ["retail", "shopping"], customTitle: "", cpidx: "" },
        { id: 11, value: 75, poyntsValue: 7500, inventoryType: "digital", inventoryRemaining: 50, language: "EN", tags: ["retail", "shopping"], customTitle: "", cpidx: "" },
        { id: 12, value: 150, poyntsValue: 15000, inventoryType: "digital", inventoryRemaining: 25, language: "EN", tags: ["retail", "shopping"], customTitle: "", cpidx: "" },
      ],
    },
  },
];

interface TestResult {
  success: boolean;
  giftCardNumber?: string;
  securityCode?: string;
  expirationDate?: string;
  message?: string;
  transactionId?: string;
  error?: string;
}

export function TestGiftCardClient() {
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCard | null>(null);
  const [customValue, setCustomValue] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Set default to lowest value when a gift card is selected
  useEffect(() => {
    if (selectedGiftCard) {
      const lowestValue = selectedGiftCard.giftCards.lowestValue;
      setSelectedValue(lowestValue);
      setCustomValue(lowestValue.toString());
      setTestResult(null);
    }
  }, [selectedGiftCard]);

  // Mock API call to test gift card
  const mockTestGiftCard = async (value: number): Promise<TestResult> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different success/failure scenarios
        const rand = Math.random();
        
        if (rand < 0.8) { // 80% success rate
          resolve({
            success: true,
            giftCardNumber: `****-****-****-${Math.random().toString().slice(2, 6)}`,
            securityCode: Math.random().toString().slice(2, 5),
            expirationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
            transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
            message: `Successfully issued $${value} gift card`,
          });
        } else { // 20% failure rate
          const errors = [
            "Insufficient inventory for this denomination",
            "Provider API temporarily unavailable",
            "Invalid value for selected gift card",
            "Rate limit exceeded, please try again later",
          ];
          resolve({
            success: false,
            error: errors[Math.floor(Math.random() * errors.length)],
          });
        }
      }, Math.random() * 2000 + 1000); // 1-3 second delay
    });
  };

  const handleTestGiftCard = async () => {
    if (!selectedGiftCard || !selectedValue) return;

    setIsLoading(true);
    setTestResult(null);

    try {
      const result = await mockTestGiftCard(selectedValue);
      setTestResult(result);
    } catch (error) {
      setTestResult({
        success: false,
        error: "An unexpected error occurred during testing",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValueChange = (value: string) => {
    if (value === "custom") {
      setSelectedValue(null);
      setCustomValue("");
      return;
    }
    const numValue = parseFloat(value);
    setSelectedValue(numValue);
    setCustomValue(numValue.toString());
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomValue(value);
    
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && selectedGiftCard) {
      const minValue = selectedGiftCard.minValue ?? 0;
      const maxValue = selectedGiftCard.maxValue ?? Infinity;
      
      if (numValue >= minValue && numValue <= maxValue) {
        setSelectedValue(numValue);
      } else {
        setSelectedValue(null);
      }
    } else {
      setSelectedValue(null);
    }
  };

  const getValueError = (): string | null => {
    if (!selectedGiftCard || customValue === "") return null;
    
    const numValue = parseFloat(customValue);
    if (isNaN(numValue)) return "Please enter a valid number";
    
    const minValue = selectedGiftCard.minValue ?? 0;
    const maxValue = selectedGiftCard.maxValue ?? Infinity;
    
    if (numValue < minValue) return `Minimum value is $${minValue}`;
    if (numValue > maxValue) return `Maximum value is $${maxValue}`;
    
    return null;
  };

  const valueError = getValueError();
  const canTest = selectedGiftCard && selectedValue && !valueError && !isLoading;

  return (
    <div className="space-y-6">
      {/* Gift Card Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Select Gift Card
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="giftcard-select">Available Gift Cards</Label>
            <Select onValueChange={(value) => {
              const card = mockGiftCards.find(c => c.id.toString() === value);
              setSelectedGiftCard(card || null);
            }}>
              <SelectTrigger id="giftcard-select">
                <SelectValue placeholder="Select a gift card to test" />
              </SelectTrigger>
              <SelectContent>
                {mockGiftCards.map((card) => (
                  <SelectItem key={card.id} value={card.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{card.rewardName}</span>
                      <div className="flex items-center gap-2 ml-4">
                        <Badge variant="outline">{card.provider?.name}</Badge>
                        <span className="text-sm text-muted-foreground">
                          ${card.minValue} - ${card.maxValue || "∞"}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedGiftCard && (
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-medium">{selectedGiftCard.rewardName}</h4>
                  <p className="text-sm text-muted-foreground">
                    Provider: {selectedGiftCard.provider?.name} ({selectedGiftCard.provider?.code})
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Type: {selectedGiftCard.valueType === "VARIABLE_VALUE" ? "Variable Value" : "Fixed Value"}
                  </p>
                </div>
                <Badge variant={selectedGiftCard.status === "active" ? "default" : "secondary"}>
                  {selectedGiftCard.status}
                </Badge>
              </div>
              
              <Separator />
              
              <div>
                <h5 className="font-medium text-sm mb-2">Available Denominations:</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedGiftCard.giftCards.items.map((item) => (
                    <Badge key={item.id} variant="outline">
                      ${item.value} ({item.inventoryRemaining} in stock)
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Value Selection */}
      {selectedGiftCard && (
        <Card>
          <CardHeader>
            <CardTitle>Select Test Value</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="value-select">Dollar Amount</Label>
              <Select onValueChange={handleValueChange} value={selectedValue?.toString() || ""}>
                <SelectTrigger id="value-select">
                  <SelectValue placeholder="Select or enter a value" />
                </SelectTrigger>
                <SelectContent>
                  {selectedGiftCard.giftCards.items.map((item) => (
                    <SelectItem key={item.id} value={item.value.toString()}>
                      ${item.value} (Stock: {item.inventoryRemaining})
                    </SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Amount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-value">Custom Value (Optional)</Label>
              <div className="relative">
                <Input
                  id="custom-value"
                  type="number"
                  value={customValue}
                  onChange={handleCustomValueChange}
                  placeholder="Enter custom amount"
                  step="0.01"
                  min={selectedGiftCard.minValue ?? 0}
                  max={selectedGiftCard.maxValue ?? undefined}
                  className={valueError ? "border-red-500" : ""}
                />
                {valueError && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  </div>
                )}
              </div>
              {valueError && (
                <p className="text-sm text-red-500">{valueError}</p>
              )}
              {selectedGiftCard.minValue !== null && selectedGiftCard.maxValue !== null && (
                <p className="text-sm text-muted-foreground">
                  Valid range: ${selectedGiftCard.minValue} - ${selectedGiftCard.maxValue}
                </p>
              )}
            </div>

            <Button
              onClick={handleTestGiftCard}
              disabled={!canTest}
              className="w-full"
              size="lg"
            >
              <TestTube className="h-4 w-4 mr-2" />
              {isLoading ? "Testing..." : `Test $${selectedValue || 0} Gift Card`}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      {testResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              Test Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {testResult.success ? (
              <div className="space-y-3">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    {testResult.message}
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Gift Card Number</Label>
                    <p className="font-mono">{testResult.giftCardNumber}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Security Code</Label>
                    <p className="font-mono">{testResult.securityCode}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Expiration Date</Label>
                    <p>{testResult.expirationDate}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Transaction ID</Label>
                    <p className="font-mono text-sm">{testResult.transactionId}</p>
                  </div>
                </div>
              </div>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Test Failed:</strong> {testResult.error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}