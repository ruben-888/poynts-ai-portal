/**
 * [CLIENT NAME] Client Configuration
 *
 * TEMPLATE - Copy this entire directory to create a new client:
 *
 *   cp -r src/app/api/extension/widgets/clients/_template \
 *         src/app/api/extension/widgets/clients/my-client
 *
 * Then:
 * 1. Update config.ts with client details and organization ID
 * 2. Create widgets in the widgets/ directory
 * 3. Import widgets and configure getWidgets() below
 * 4. Register in clients/index.ts
 * 5. Add domains to chrome-extension/manifest.json
 */

import { ClientConfig, Widget } from "../types";
import { config } from "./config";
// Import your widgets here:
// import { myWidget } from "./widgets/my-widget";

export const templateClientConfig: ClientConfig = {
  name: config.name,
  domains: config.domains,

  getWidgets(_path: string): Widget[] {
    const widgets: Widget[] = [];

    // Add widgets based on path
    // Example:
    //
    // widgets.push(navBadgeWidget);
    //
    // if (path === "/" || path === "/home") {
    //   widgets.push(welcomeModalWidget);
    // }
    //
    // if (path.startsWith("/dashboard")) {
    //   widgets.push(progressTrackerWidget);
    // }

    return widgets;
  },
};

/**
 * Export config for use in widgets that need organization data
 */
export { config };
