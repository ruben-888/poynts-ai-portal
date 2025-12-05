/**
 * Twin Protocol Client Configuration
 *
 * This is the main entry point for the Twin Protocol demo.
 * Import widgets from separate files and configure which pages they appear on.
 */

import { ClientConfig, Widget } from "../types";
import { config } from "./config";
import { navBadgeWidget } from "./widgets/nav-badge";
import { setupTrackerWidget } from "./widgets/setup-tracker";

/**
 * Twin Protocol Configuration
 */
export const twinProtocolConfig: ClientConfig = {
  name: config.name,
  domains: config.domains,
  config, // Expose full config for API access

  getWidgets(path: string): Widget[] {
    const widgets: Widget[] = [];

    // Nav badge appears on ALL pages
    widgets.push(navBadgeWidget);

    // Setup tracker only on profile/vault pages
    if (path.includes("/profile") || path.includes("/vault")) {
      widgets.push(setupTrackerWidget);
    }

    // Future: Dynamic widgets based on campaigns
    // const campaigns = await loadCampaigns(config.organizationId);
    // widgets.push(createCampaignWidget(campaigns));

    return widgets;
  },
};

// Export config for use in widgets
export { config };
