"use client";

import useDatadog from "@/lib/hooks/use-datadog";
import { AuthUserSessionClaims } from "@/app/layout";

const DatadogInitializer = ({
  authUserSessionClaims,
}: {
  authUserSessionClaims?: AuthUserSessionClaims | null;
}) => {
  // Always initialize Datadog, but only pass user data if available
  useDatadog({ authUserSessionClaims });
  return null;
};

export default DatadogInitializer;
