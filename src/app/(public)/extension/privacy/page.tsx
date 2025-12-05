import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - Poynts Campaign Extension",
  description: "Privacy policy for the Poynts Campaign Demo Chrome extension",
};

export default function ExtensionPrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-12 px-4 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Poynts Campaign Demo Extension
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Last updated: December 2024
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
            <p>
              The Poynts Campaign Demo extension (&quot;Extension&quot;) is designed to display
              loyalty campaign widgets on supported partner websites. This privacy policy
              explains what data the Extension accesses and how it is used.
            </p>

            <h3 className="text-lg font-semibold mt-6">Data Collection</h3>
            <p>
              The Extension collects and processes minimal data necessary for its functionality:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Page URL:</strong> The Extension reads the current page URL to determine
                if campaign widgets should be displayed. This information is processed locally
                and is not transmitted to external servers except as necessary to load widget content.
              </li>
              <li>
                <strong>Widget Interaction:</strong> When you interact with campaign widgets,
                your interactions may be sent to Poynts servers to track campaign progress and
                award points.
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-6">Data Storage</h3>
            <p>
              The Extension may use Chrome&apos;s local storage to remember:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Which widgets have been displayed to avoid duplicate loading</li>
              <li>User preferences for widget display</li>
            </ul>
            <p>
              This data is stored locally on your device and is not transmitted externally.
            </p>

            <h3 className="text-lg font-semibold mt-6">Third-Party Services</h3>
            <p>
              The Extension loads widget content from Poynts servers
              (poynts-ai-portal.vercel.app). These requests are subject to
              Poynts&apos; main privacy policy.
            </p>

            <h3 className="text-lg font-semibold mt-6">Permissions</h3>
            <p>The Extension requires the following permissions:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>activeTab:</strong> To detect when you&apos;re on a supported partner
                website and inject campaign widgets.
              </li>
              <li>
                <strong>storage:</strong> To save local preferences and widget state.
              </li>
              <li>
                <strong>Host permissions (twinprotocol.ai):</strong> To run on supported
                partner websites where campaigns are active.
              </li>
            </ul>

            <h3 className="text-lg font-semibold mt-6">Data Sharing</h3>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable
              information to third parties. The Extension only communicates with Poynts
              servers to load and operate campaign widgets.
            </p>

            <h3 className="text-lg font-semibold mt-6">Changes to This Policy</h3>
            <p>
              We may update this privacy policy from time to time. Any changes will be
              posted on this page with an updated revision date.
            </p>

            <h3 className="text-lg font-semibold mt-6">Contact</h3>
            <p>
              If you have questions about this privacy policy, please contact us at{" "}
              <a
                href="mailto:support@carepoynt.com"
                className="text-primary hover:underline"
              >
                support@carepoynt.com
              </a>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-8">
          <a href="/extension" className="text-primary hover:underline">
            ← Back to Extension
          </a>
        </p>
      </div>
    </div>
  );
}
