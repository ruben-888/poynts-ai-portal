"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GiftCard {
  id: number;
  value: number;
  redemptionValue: number;
  language: string;
  tags: string[];
  cpid: string;
  rewardName: string;
}

interface GiftCardDetailProps {
  cardId: string;
  giftCardId: string;
}

export function GiftCardDetail({ cardId, giftCardId }: GiftCardDetailProps) {
  const router = useRouter();
  const [card, setCard] = React.useState<GiftCard | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchGiftCard() {
      try {
        const response = await fetch(
          `/api/legacy/giftcards/${giftCardId}/cards/${cardId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch gift card");
        const data = await response.json();
        setCard(data);
      } catch (error) {
        console.error("Error fetching gift card:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchGiftCard();
  }, [cardId, giftCardId]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!card) {
    return <div>Gift card not found</div>;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const updatedCard = {
      value: Number(formData.get("value")),
      redemptionValue: Number(formData.get("points")),
      language: formData.get("language"),
      tags:
        formData
          .get("tags")
          ?.toString()
          .split(",")
          .map((tag) => tag.trim()) || [],
    };

    try {
      const response = await fetch(
        `/api/legacy/giftcards/${giftCardId}/cards/${cardId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedCard),
        },
      );

      if (!response.ok) throw new Error("Failed to update gift card");
      router.back();
    } catch (error) {
      console.error("Error updating gift card:", error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin/legacy/giftcards">
              Gift Cards
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/admin/legacy/giftcards/${giftCardId}`}>
              {card.rewardName}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{card.cpid}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mt-6">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Edit Gift Card</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="value">$ Value</Label>
                    <Input
                      id="value"
                      name="value"
                      type="number"
                      defaultValue={card.value}
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Poynts</Label>
                    <Input
                      id="points"
                      name="points"
                      type="number"
                      defaultValue={card.redemptionValue}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    name="language"
                    defaultValue={card.language}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    name="tags"
                    defaultValue={card.tags.join(", ")}
                  />
                </div>

                <div className="pt-4 flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
