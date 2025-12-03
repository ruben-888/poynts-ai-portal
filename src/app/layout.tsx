import type { Metadata } from "next";
import { GeistSans, GeistMono } from "geist/font";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});
import { cn } from "@/lib/utils";
import TanstackProvider from "@/components/context/tanstack-provider";
import { ThemeProvider } from "@/components/context/theme-provider";
import { auth } from "@clerk/nextjs/server";

import DatadogInitializer from "@/components/tracking/datadog-init";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Poynts AI Portal",
  description: "Poynts AI Portal",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export interface AuthUserSessionClaims {
  userId: string;
  userEmail: string;
  userFullName: string;
}

export default async function RootLayout({
  children,
}: RootLayoutProps): Promise<React.JSX.Element> {
  const { userId, sessionClaims } = await auth();

  // Extract email from session claims or use undefined
  const userEmail = sessionClaims?.primaryEmail as string | undefined;
  const userFullName = sessionClaims?.fullName as string | undefined;

  const ddEnvironment = process.env.DATADOG_ENVIRONMENT || "well_local";

  // Create user session data for Datadog if the user is authenticated
  const userSessionData =
    userId && userEmail && userFullName
      ? {
          userId,
          userEmail,
          userFullName,
        }
      : null;

  // Get environment for sandbox bar
  const environment = process.env.ENVIRONMENT;
  const shouldShowEnvironmentBar =
    environment === "SANDBOX-WELL" ||
    environment === "QA" ||
    environment === "DEV";
  const environmentBarText =
    environment === "SANDBOX-WELL"
      ? "SANDBOX"
      : environment === "QA"
        ? "QA ENVIRONMENT"
        : environment === "DEV"
          ? "DEV ENVIRONMENT"
          : "";

  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      {/* <Script id="datadog-rum">
        {`
          (function(h,o,u,n,d) {
            h=h[d]=h[d]||{q:[],onReady:function(c){h.q.push(c)}}
            d=o.createElement(u);d.async=1;d.src=n
            n=o.getElementsByTagName(u)[0];n.parentNode.insertBefore(d,n)
          })(window,document,'script','https://www.datadoghq-browser-agent.com/us1/v6/datadog-rum.js','DD_RUM')
          window.DD_RUM.onReady(function() {
            window.DD_RUM.init({
              clientToken: 'pubbf38f67cf22bff869a8fd754217c9fa4',
              applicationId: '52c78749-cc6f-462e-95bf-30112b07981a',
              site: 'datadoghq.com',
              service: 'Care Portal',
              env: '${ddEnvironment}',
              // Specify a version number to identify the deployed version of your application in Datadog
              // version: '1.0.0',
              sessionSampleRate: 100,
              sessionReplaySampleRate: 100,
            });
          })
        `}
      </Script> */}
      <body
        className={cn(
          "min-h-screen bg-background antialiased",
          GeistSans.variable,
          GeistMono.variable,
          inter.variable
        )}
        suppressHydrationWarning
      >
        {/* Environment Bar - only show for non-production environments */}
        {shouldShowEnvironmentBar && (
          <div
            className="fixed top-0 left-0 right-0 z-50 h-6 flex items-center justify-center"
            style={{ backgroundColor: "#1DA1C4" }}
          >
            <span className="text-white text-sm font-medium tracking-wide">
              {environmentBarText}
            </span>
          </div>
        )}

        {/* Add top padding to body content to account for the fixed environment bar when shown */}
        <div className={shouldShowEnvironmentBar ? "pt-6" : ""}>
          <DatadogInitializer authUserSessionClaims={userSessionData} />
          <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
            appearance={{
              elements: {
                organizationSwitcherTrigger: "py-2",
                // Hide personal account option in organization switcher
                userButtonPopoverCard: {
                  hidePersonalAccount: true,
                },
              },
            }}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <TooltipProvider>
                <TanstackProvider>{children}</TanstackProvider>
              </TooltipProvider>
            </ThemeProvider>
          </ClerkProvider>
          <Toaster richColors closeButton position="top-right" />
        </div>
      </body>
    </html>
  );
}
