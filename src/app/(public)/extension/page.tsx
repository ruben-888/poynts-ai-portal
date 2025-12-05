import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Chrome, Settings, RefreshCw, Puzzle, FolderOpen, ToggleRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Install Poynts Campaign Extension",
  description: "Install the Poynts Campaign Demo extension for Chrome",
};

export default function ExtensionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto py-12 px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 mb-6">
            <Puzzle className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Poynts Campaign Extension
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Inject Poynts campaign widgets into partner sites for demonstration purposes
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <Badge variant="secondary">Version 1.0.0</Badge>
            <Badge variant="outline">Chrome Extension</Badge>
          </div>
        </div>

        {/* Download Card */}
        <Card className="mb-8 border-primary/20">
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download Extension
            </CardTitle>
            <CardDescription>
              Download the extension package to install manually
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pt-4">
            <a href="/api/extension/download">
              <Button size="lg" className="gap-2">
                <Download className="w-4 h-4" />
                Download Extension (.zip)
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Installation Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Chrome className="w-5 h-5" />
              Installation Instructions
            </CardTitle>
            <CardDescription>
              Follow these steps to install the extension in Chrome
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                1
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Download and Extract</h3>
                <p className="text-muted-foreground mb-3">
                  Click the download button above to get the extension package. Extract the ZIP file to a folder on your computer that you&apos;ll keep (e.g., <code className="bg-muted px-1.5 py-0.5 rounded text-sm">Documents/poynts-extension</code>).
                </p>
                <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
                  <FolderOpen className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Keep this folder - Chrome will reference it for the extension
                  </span>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                2
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Open Chrome Extensions</h3>
                <p className="text-muted-foreground mb-3">
                  Open Chrome and navigate to the extensions page:
                </p>
                <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                  chrome://extensions
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Or click the puzzle icon in Chrome&apos;s toolbar → &quot;Manage Extensions&quot;
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                3
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  Enable Developer Mode
                  <Badge variant="outline" className="font-normal">Required</Badge>
                </h3>
                <p className="text-muted-foreground mb-3">
                  Toggle the &quot;Developer mode&quot; switch in the top-right corner of the extensions page.
                </p>
                <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3">
                  <ToggleRight className="w-6 h-6 text-primary" />
                  <span className="text-sm">
                    This enables loading unpacked extensions
                  </span>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                4
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Load the Extension</h3>
                <p className="text-muted-foreground mb-3">
                  Click &quot;Load unpacked&quot; and select the folder where you extracted the extension.
                </p>
                <div className="grid gap-2">
                  <div className="bg-muted/50 rounded-lg p-3 flex items-start gap-2">
                    <Settings className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Select the folder containing <code className="bg-muted px-1 rounded">manifest.json</code>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2 text-green-600">Done!</h3>
                <p className="text-muted-foreground">
                  The extension is now installed. Visit{" "}
                  <a
                    href="https://twinprotocol.ai"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    twinprotocol.ai
                  </a>{" "}
                  to see the campaign widgets in action.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Updating Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Updating the Extension
            </CardTitle>
            <CardDescription>
              How to get the latest version
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              To update the extension when a new version is available:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Download the new version using the button above</li>
              <li>Extract it to the same folder (replace existing files)</li>
              <li>Go to <code className="bg-muted px-1.5 py-0.5 rounded text-sm">chrome://extensions</code></li>
              <li>Click the refresh icon on the Poynts Campaign Demo card</li>
            </ol>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <strong>Tip:</strong> You can also click the &quot;Update&quot; button at the top of the extensions page to refresh all developer extensions at once.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          This extension is for demonstration purposes only and is not published to the Chrome Web Store.
        </p>
      </div>
    </div>
  );
}
