import { NextRequest, NextResponse } from "next/server";
import { getClientConfig } from "../clients";
import { generateNavBadgeWidget } from "../generators/nav-badge";
import { generateSetupTrackerWidget } from "../generators/setup-tracker";

// CORS headers for extension requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, { headers: corsHeaders });
}

/**
 * Serves widget JavaScript files dynamically
 *
 * GET /api/extension/widgets/script?widget=nav-badge&domain=twinprotocol.ai
 *
 * Returns JavaScript with embedded data for the requested widget
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const widgetId = searchParams.get("widget");
  const domain = searchParams.get("domain");
  const path = searchParams.get("path") || "/";

  if (!widgetId || !domain) {
    return new NextResponse(
      `console.error('[Poynts] Missing widget or domain parameter');`,
      {
        status: 400,
        headers: {
          "Content-Type": "application/javascript",
          ...corsHeaders,
        },
      }
    );
  }

  console.log(`[Widget Script] Request for widget: ${widgetId}, domain: ${domain}, path: ${path}`);

  try {
    // Get client config
    const clientConfig = getClientConfig(domain);

    if (!clientConfig) {
      return new NextResponse(
        `console.error('[Poynts] No client config found for domain: ${domain}');`,
        {
          status: 404,
          headers: {
            "Content-Type": "application/javascript",
            ...corsHeaders,
          },
        }
      );
    }

    // Generate widget code based on widget ID
    let code: string;

    switch (widgetId) {
      case "nav-badge":
        code = await generateNavBadgeWidget(clientConfig);
        break;
      case "setup-tracker":
        code = await generateSetupTrackerWidget(clientConfig);
        break;
      default:
        return new NextResponse(
          `console.error('[Poynts] Unknown widget: ${widgetId}');`,
          {
            status: 404,
            headers: {
              "Content-Type": "application/javascript",
              ...corsHeaders,
            },
          }
        );
    }

    console.log(`[Widget Script] Serving ${widgetId} for ${domain}`);

    return new NextResponse(code, {
      headers: {
        "Content-Type": "application/javascript",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error("[Widget Script] Error:", error);
    return new NextResponse(
      `console.error('[Poynts] Server error generating widget');`,
      {
        status: 500,
        headers: {
          "Content-Type": "application/javascript",
          ...corsHeaders,
        },
      }
    );
  }
}
