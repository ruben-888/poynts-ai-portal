"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CatalogOffer, SubItem } from "../data/catalogs";

interface SubItemSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: CatalogOffer | null;
  onSelect: (subItem: SubItem) => void;
}

// TODO: Re-enable image loading once charity images are ready
function SubItemImage(_props: { item: SubItem }) {
  return (
    <div className="h-20 bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center p-3">
      <Heart className="h-8 w-8 text-rose-400" />
    </div>
  );
}

export function SubItemSelector({
  open,
  onOpenChange,
  offer,
  onSelect,
}: SubItemSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const subItems = offer?.subItems || [];

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return subItems;
    }

    const query = searchQuery.toLowerCase();
    return subItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );
  }, [subItems, searchQuery]);

  const handleSelectItem = (item: SubItem) => {
    setSelectedItemId(item.id);
    onSelect(item);
    onOpenChange(false);
  };

  // Reset state when modal closes
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSearchQuery("");
      setSelectedItemId(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="!max-w-none w-[900px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{offer?.subItemsTitle || "Select an Option"}</DialogTitle>
          <DialogDescription>
            {offer?.subItemsDescription || "Choose from the available options"}
          </DialogDescription>
        </DialogHeader>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto py-4">
          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No items found matching your search"
                  : "No items available"}
              </p>
            </div>
          )}

          {filteredItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredItems.map((item) => {
                const isSelected = selectedItemId === item.id;

                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "relative overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md hover:border-purple-300",
                      isSelected && "ring-2 ring-purple-500 shadow-lg"
                    )}
                    onClick={() => handleSelectItem(item)}
                  >
                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-10 h-5 w-5 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}

                    {/* Item Image */}
                    <SubItemImage item={item} />

                    {/* Item Details */}
                    <div className="p-3 text-center">
                      <h4 className="font-medium text-sm leading-tight mb-1 line-clamp-2">
                        {item.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.category}
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="border-t pt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search for a ${offer?.name === "Charity on Top" ? "charity" : "option"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" className="w-full" disabled>
            <Search className="mr-2 h-4 w-4" />
            Search for More {offer?.name === "Charity on Top" ? "Charities" : "Options"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
