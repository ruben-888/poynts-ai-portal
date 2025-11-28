import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import type { GiftCard, GiftCardItem } from "../components/giftcards-client";

export type GiftCardAction = 
  | { type: 'create'; data: CreateGiftCardResponse }
  | { type: 'update'; id: number; data: any }
  | { type: 'delete'; id: number };

interface ApiResponse {
  success: boolean;
  data: GiftCard[];
  error?: string;
}

interface CreateGiftCardResponse {
  giftcard_id: number;
  item_id: number;
  cpid: string;
  value: number;
  redem_value: number;
  language: string;
  inventory_type: string;
  inventory_remaining: number;
  tags: string;
  priority: number;
  brand: {
    id: number;
    name: string;
    key: string;
  } | null;
  provider: {
    id: number;
    name: string;
    code: string;
  } | null;
  item: {
    item_id: number;
    utid: string;
    rewardName: string;
    reward_status: string;
    reward_availability: string;
  };
}

export function useGiftCards() {
  const [data, setData] = useState<GiftCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchGiftCards = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(
        "/api/legacy/giftcard-items",
      );
      if (response.data.success) {
        setData(response.data.data);
      } else {
        throw new Error(response.data.error || "Failed to fetch gift cards");
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
  }, []);

  // Handle all gift card changes with a single unified callback
  const handleGiftCardChange = useCallback((action: GiftCardAction) => {
    setData(prevData => {
      switch (action.type) {
        case 'create': {
          const newCardData = action.data;
          // Find the gift card item that this new instance belongs to
          const targetGiftCard = prevData.find(gc => gc.id === newCardData.item_id);
          
          if (!targetGiftCard) {
            // If we can't find the parent gift card, just refresh the data
            setRefreshTrigger(prev => prev + 1);
            return prevData;
          }

          // Create the new gift card item instance
          const newGiftCardItem: GiftCardItem = {
            id: newCardData.giftcard_id,
            value: newCardData.value,
            poyntsValue: newCardData.redem_value,
            inventoryType: newCardData.inventory_type,
            inventoryRemaining: newCardData.inventory_remaining,
            language: newCardData.language,
            tags: newCardData.tags ? newCardData.tags.split(',').filter(Boolean) : [],
            customTitle: "",
            cpidx: newCardData.cpid,
          };

          // Update the gift card data by adding the new item to the correct gift card
          return prevData.map(giftCard => {
            if (giftCard.id === newCardData.item_id) {
              return {
                ...giftCard,
                giftCards: {
                  ...giftCard.giftCards,
                  count: giftCard.giftCards.count + 1,
                  items: [...giftCard.giftCards.items, newGiftCardItem],
                },
              };
            }
            return giftCard;
          });
        }

        case 'delete': {
          return prevData.map(giftCard => {
            // Find and remove the deleted card from the items array
            const updatedItems = giftCard.giftCards.items.filter(item => item.id !== action.id);
            
            // If the number of items changed, update the count
            if (updatedItems.length !== giftCard.giftCards.items.length) {
              return {
                ...giftCard,
                giftCards: {
                  ...giftCard.giftCards,
                  count: giftCard.giftCards.count - 1,
                  items: updatedItems,
                },
              };
            }
            
            // Return unchanged if this gift card wasn't affected
            return giftCard;
          });
        }

        case 'update': {
          return prevData.map(giftCard => {
            // Check if this is a parent gift card item update (status, brand, etc.)
            if (giftCard.id === action.id && (action.data.status !== undefined || action.data.brand !== undefined)) {
              return {
                ...giftCard,
                ...(action.data.status !== undefined && { status: action.data.status }),
                ...(action.data.brand !== undefined && { brand: action.data.brand }),
              };
            }

            // Find and update the nested gift card item instance
            const updatedItems = giftCard.giftCards.items.map(item => {
              if (item.id === action.id) {
                return {
                  ...item,
                  value: action.data.value || item.value,
                  poyntsValue: action.data.poyntsValue || item.poyntsValue,
                  language: action.data.language || item.language,
                  cpidx: action.data.cpidx || item.cpidx,
                  tags: action.data.tags || item.tags,
                };
              }
              return item;
            });

            // Return updated gift card if any items were modified
            if (updatedItems.some((item, index) => item !== giftCard.giftCards.items[index])) {
              return {
                ...giftCard,
                giftCards: {
                  ...giftCard.giftCards,
                  items: updatedItems,
                },
              };
            }

            // Return unchanged if this gift card wasn't affected
            return giftCard;
          });
        }

        default:
          return prevData;
      }
    });
  }, []);

  useEffect(() => {
    fetchGiftCards();
  }, [fetchGiftCards, refreshTrigger]);

  return {
    data,
    isLoading,
    error,
    refresh,
    handleGiftCardChange,
  };
}
