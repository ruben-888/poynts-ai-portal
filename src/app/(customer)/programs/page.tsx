import ProgramsClient from "./components/programs-client";

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Programs</h2>
        <p className="text-muted-foreground">
          Manage your reward programs and campaigns
        </p>
      </div>
      <ProgramsClient />
    </div>
  );
}
