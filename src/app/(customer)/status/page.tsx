export default function StatusPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Status</h1>
          <p className="text-muted-foreground">
            Current status of our services and infrastructure
          </p>
        </div>

        <div className="bg-card p-6">
          <iframe
            src="https://carepoynt.instatus.com/"
            width="100%"
            height="1200"
            frameBorder="0"
            scrolling="no"
            style={{ border: "none" }}
            title="Poynts AI Portal System Status"
          />
        </div>
      </div>
    </div>
  );
}
