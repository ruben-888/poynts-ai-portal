"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, X } from "lucide-react";

interface OrdersSearchFormProps {
  onSearch: (filters: { custTransactionReference?: string }) => void;
  isLoading?: boolean;
}

export function OrdersSearchForm({ onSearch, isLoading }: OrdersSearchFormProps) {
  const [custTransactionReference, setCustTransactionReference] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      custTransactionReference: custTransactionReference.trim() || undefined,
    });
  };

  const handleClear = () => {
    setCustTransactionReference("");
    onSearch({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Search Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Customer Transaction Reference"
              value={custTransactionReference}
              onChange={(e) => setCustTransactionReference(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="px-6"
            >
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              type="button" 
              variant="outline"
              onClick={handleClear}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}