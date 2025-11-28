import { GiftCardsClient } from "../components/giftcards-client";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Cards Management - Admin",
  description:
    "Manage and monitor all gift card operations across the platform.",
};

export default function GiftCardsPage() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-4">
        <GiftCardsClient isAdmin={true} />
      </div>
    </div>
  );
}
