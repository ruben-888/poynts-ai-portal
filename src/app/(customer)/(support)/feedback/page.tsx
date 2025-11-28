import { Metadata } from "next";
import FilloutFeedback from "../components/fillout-feedback";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help from our support team.",
};

export default async function SupportPage() {
  return <FilloutFeedback />;
}
