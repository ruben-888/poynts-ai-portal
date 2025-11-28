"use client";

import React from "react";
import {
  StatsigProvider,
  StatsigUser,
  useClientAsyncInit,
} from "@statsig/react-bindings";
import { StatsigAutoCapturePlugin } from "@statsig/web-analytics";
import { StatsigSessionReplayPlugin } from "@statsig/session-replay";
import { JwtPayload } from "@clerk/types";

interface CPStatsigProviderProps {
  children: React.ReactNode;
  userId?: string;
  userEmail?: string;
  environment?: string;
  userFullName?: string;
  sessionClaims?: JwtPayload | null;
  bootstrapValues?: Record<string, any>;
  // Add any other user properties you want to pass to Statsig
}

// TODO: We should just probably pass the full Clerk session claims object
export default function CPStatsigProvider({
  children,
  userId = "a-user",
  userEmail,
  environment = "development",
  userFullName = "Test User",
  sessionClaims,
  // bootstrapValues,
}: CPStatsigProviderProps) {
  // custom: {
  //   // You can add additional user info here if needed
  // },

  const statsigUser: StatsigUser = {
    userID: userId,
    email: userEmail || undefined,
    appVersion: "1.0.0",
    custom: {
      fullName: userFullName,
      orgSlug: sessionClaims?.org_slug,
      orgRole: sessionClaims?.org_role,
    },
  };

  // console.log("statsigUser in Provider", statsigUser);

  // console.log("sessionClaims in Provider", sessionClaims);

  const { client } = useClientAsyncInit(
    "client-hlb55FAYIabzPxisg7peYhbXK8vy1pIr9sjJNlDBVQq",
    statsigUser,
    {
      environment: {
        tier: environment,
      },
      plugins: [
        new StatsigAutoCapturePlugin(),
        new StatsigSessionReplayPlugin(),
      ],
      // Bootstrap with server-side values if provided
      // ...(bootstrapValues && { initializeValues: bootstrapValues }),
    }
  );

  return (
    <StatsigProvider client={client} loadingComponent={<div>Loading...</div>}>
      {children}
    </StatsigProvider>
  );
}
