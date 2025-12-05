import { NextRequest, NextResponse } from "next/server";
import { getClientConfig } from "./clients";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const domain = searchParams.get("domain");
  const path = searchParams.get("path") || "/";

  if (!domain) {
    return NextResponse.json(
      { error: "Missing domain parameter" },
      { status: 400 }
    );
  }

  console.log(`[Widgets API] Request for domain: ${domain}, path: ${path}`);

  try {
    // Get the client configuration based on domain
    const clientConfig = getClientConfig(domain);

    if (!clientConfig) {
      console.log(`[Widgets API] No client config found for: ${domain}`);
      return NextResponse.json({ widgets: [] });
    }

    // Get widgets for this page
    const widgets = clientConfig.getWidgets(path);

    console.log(`[Widgets API] Returning ${widgets.length} widget(s) for ${domain}${path}`);

    return NextResponse.json({
      client: clientConfig.name,
      widgets,
    });
  } catch (error) {
    console.error("[Widgets API] Error:", error);
    return NextResponse.json(
      { error: "Failed to get widgets" },
      { status: 500 }
    );
  }
}
