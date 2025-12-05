import ProgramsClient from "./components/programs-client";
import { Card, CardContent } from "@/components/ui/card";

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
        <p className="text-muted-foreground">
          Manage your reward programs and campaigns
        </p>
      </div>
      <Card>
        <CardContent className="pt-6">
          <ProgramsClient />
        </CardContent>
      </Card>
    </div>
  );
}
