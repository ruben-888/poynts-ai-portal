"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  StatsigProvider,
  StatsigUser,
} from "@statsig/react-bindings";
import { StatsigClient } from "@statsig/js-client";
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
}

// Create plugins once at module level to avoid recreating on each render
const statsigPlugins = [
  new StatsigAutoCapturePlugin(),
  new StatsigSessionReplayPlugin(),
];

// Singleton client to avoid recreation
let statsigClientInstance: StatsigClient | null = null;

export default function CPStatsigProvider({
  children,
  userId = "a-user",
  userEmail,
  environment = "development",
  userFullName = "Test User",
  sessionClaims,
}: CPStatsigProviderProps) {
  const [isReady, setIsReady] = useState(false);

  // Memoize statsigUser to prevent unnecessary re-initialization
  const statsigUser: StatsigUser = useMemo(
    () => ({
      userID: userId,
      email: userEmail || undefined,
      appVersion: "1.0.0",
      custom: {
        fullName: userFullName,
        orgSlug: sessionClaims?.org_slug,
        orgRole: sessionClaims?.org_role,
      },
    }),
    [userId, userEmail, userFullName, sessionClaims?.org_slug, sessionClaims?.org_role]
  );

  // Initialize client once
  useEffect(() => {
    if (!statsigClientInstance) {
      statsigClientInstance = new StatsigClient(
        "client-hlb55FAYIabzPxisg7peYhbXK8vy1pIr9sjJNlDBVQq",
        statsigUser,
        {
          environment: {
            tier: environment,
          },
          plugins: statsigPlugins,
        }
      );

      statsigClientInstance.initializeAsync().then(() => {
        setIsReady(true);
      });
    } else {
      // Client already exists, just update user if needed
      statsigClientInstance.updateUserAsync(statsigUser).then(() => {
        setIsReady(true);
      });
    }
  }, [statsigUser, environment]);

  // Show loading state while initializing
  if (!isReady || !statsigClientInstance) {
    return <div className="min-h-screen" />;
  }

  return (
    <StatsigProvider client={statsigClientInstance}>
      {children}
    </StatsigProvider>
  );
}
