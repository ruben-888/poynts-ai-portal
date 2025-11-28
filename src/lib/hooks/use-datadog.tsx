"use client";
import { useEffect } from "react";
import { datadogRum } from "@datadog/browser-rum";
import { datadogLogs } from "@datadog/browser-logs";
import packageJson from "../../../package.json";
export let isDatadogInitialized = false;
import { useUser } from "@clerk/nextjs";
import { AuthUserSessionClaims } from "@/app/layout";

export const useDatadog = ({
  authUserSessionClaims,
}: {
  authUserSessionClaims?: AuthUserSessionClaims | null;
}) => {
  useEffect(() => {
    // Skip Datadog initialization in development
    // if (process.env.NODE_ENV === "development") {
    //   console.log("Datadog disabled in development mode");
    //   return;
    // }

    // Does this work
 
    if (typeof window !== "undefined" && !isDatadogInitialized) {
      isDatadogInitialized = true;
      // Initialize Datadog RUM
      datadogRum.init({
        version: packageJson?.version ?? "unknown",
        applicationId: "52c78749-cc6f-462e-95bf-30112b07981a",
        clientToken: "pubbf38f67cf22bff869a8fd754217c9fa4",
        site: "datadoghq.com",
        service: "care-portal",
        env: process.env.DATADOG_ENVIRONMENT ?? "well_local",
        sessionSampleRate: 100,
        sessionReplaySampleRate: 100,
        trackUserInteractions: true,
        trackResources: true,
        trackLongTasks: true,
        defaultPrivacyLevel: "allow",
        beforeSend: (event) => {
          // Custom logic to filter errors
          const errorMessage = (event.error as any)?.message || "";
          if (
            errorMessage.includes("Object Not Found Matching") ||
            errorMessage.includes(
              "XHR error POST https://px.ads.linkedin.com"
            ) ||
            errorMessage.includes(
              "XHR error POST https://events.launchdarkly.com/events/bulk"
            ) ||
            errorMessage.includes("network error (Error)") ||
            errorMessage.includes("[LaunchDarkly] network error") ||
            errorMessage.includes("Fetch error POST https://api.segment.io") ||
            errorMessage.includes("Error sending segment")
          ) {
            return false;
          }
          return true;
        },
      });

      // Initialize Datadog Logs
      datadogLogs.init({
        version: packageJson?.version ?? "unknown",
        clientToken: "pubbf38f67cf22bff869a8fd754217c9fa4",
        // applicationId: "52c78749-cc6f-462e-95bf-30112b07981a",
        site: "datadoghq.com",
        service: "care-portal",
        env: process.env.DATADOG_ENVIRONMENT ?? "well_local",
        forwardErrorsToLogs: true,
        sessionSampleRate: 100,
        beforeSend: (logEvent: any) => {
          // Custom logic to filter logs
          const message = logEvent.message || "";
          if (
            message.includes("Object Not Found Matching") ||
            message.includes("XHR error POST https://px.ads.linkedin.com") ||
            message.includes(
              "XHR error POST https://events.launchdarkly.com/events/bulk"
            ) ||
            message.includes("network error (Error)") ||
            message.includes("[LaunchDarkly] network error") ||
            message.includes("Fetch error POST https://api.segment.io") ||
            message.includes("Error sending segment")
          ) {
            return false;
          }
          return true;
        },
      });

      // Only set user context if available
      if (authUserSessionClaims?.userId) {
        console.log(
          "Setting user context in Datadog:",
          authUserSessionClaims.userId,
          authUserSessionClaims.userFullName,
          authUserSessionClaims.userEmail
        );
        datadogRum.setGlobalContextProperty("user", {
          name: authUserSessionClaims.userFullName,
          email: authUserSessionClaims.userEmail,
        });
      }

      // Start session replay recording
      datadogRum.startSessionReplayRecording();
    }
  }, [authUserSessionClaims]);
};

// For backward compatibility
export const useDatadogLoggedin = useDatadog;

export default useDatadog;
