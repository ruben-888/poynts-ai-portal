import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Building2, ShoppingBag, ChevronRight } from "lucide-react";

export default function SendRewardsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Send Rewards</h1>
        <p className="text-muted-foreground mt-2">
          Choose how you want to send rewards to recipients
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <Link href="/admin/send-rewards-provider">
          <Card className="p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer group h-full">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-4 group-hover:bg-blue-200 transition-colors">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Provider</h2>
              <p className="text-muted-foreground mb-4">
                Send rewards through third-party providers like TangoCard,
                Blackhawk, or Amazon
              </p>
              <div className="flex items-center text-primary font-medium mt-auto">
                Select Provider <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Card>
        </Link>

        <Link href="/admin/send-rewards-catalog">
          <Card className="p-8 hover:border-primary hover:shadow-lg transition-all cursor-pointer group h-full">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4 group-hover:bg-green-200 transition-colors">
                <ShoppingBag className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Catalog</h2>
              <p className="text-muted-foreground mb-4">
                Send rewards from your organization&apos;s catalog inventory
              </p>
              <div className="flex items-center text-primary font-medium mt-auto">
                Browse Catalog <ChevronRight className="ml-1 h-4 w-4" />
              </div>
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
