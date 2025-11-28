import { Card, CardContent } from "@/components/ui/card";
import { Wallet } from "lucide-react";

export default function PointsBanksPage() {
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <Wallet className="w-12 h-12 text-muted-foreground animate-pulse" />
          <h1 className="text-3xl font-bold tracking-tight">Coming Soon</h1>
          <p className="text-muted-foreground max-w-md">
            Points Banks management features are currently under development.
            Check back soon for updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
