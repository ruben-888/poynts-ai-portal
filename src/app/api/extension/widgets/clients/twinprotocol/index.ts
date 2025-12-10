/**
 * Twin Protocol Client Configuration
 *
 * This is the main entry point for the Twin Protocol demo.
 * Defines which widgets appear on which pages.
 * Actual widget code is served dynamically via /api/extension/widgets/script
 */

import { ClientConfig, WidgetMetadata } from "../types";
import { config } from "./config";

/**
 * Widget metadata definitions
 * These are returned by the API to tell the extension which widgets to load
 */
const navBadgeMetadata: WidgetMetadata = {
  id: "nav-badge",
  waitForSelector: "nav",
};

const setupTrackerMetadata: WidgetMetadata = {
  id: "setup-tracker",
  waitForSelector: '[role="tabpanel"]',
};

/**
 * Twin Protocol Configuration
 */
export const twinProtocolConfig: ClientConfig = {
  name: config.name,
  domains: config.domains,
  config, // Expose full config for API access

  getWidgets(path: string): WidgetMetadata[] {
    const widgets: WidgetMetadata[] = [];

    // Nav badge appears on ALL pages
    widgets.push(navBadgeMetadata);

    // Setup tracker only on profile/vault pages
    if (path.includes("/profile") || path.includes("/vault")) {
      widgets.push(setupTrackerMetadata);
    }

    return widgets;
  },
};

// Export config for use in widgets
export { config };
