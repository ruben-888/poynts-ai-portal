"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import SendRewardsClient from "@/app/(admin)/admin/send-rewards-provider/components/send-rewards-client";

const queryClient = new QueryClient();

export default function CardSenderPage() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-5xl">
          <SendRewardsClient />
        </div>
      </div>
    </QueryClientProvider>
  );
}
