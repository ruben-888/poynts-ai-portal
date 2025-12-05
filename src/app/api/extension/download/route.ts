import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    // Serve pre-built zip from public folder
    const zipPath = path.join(process.cwd(), "public", "extension", "poynts-campaign-extension.zip");

    if (!fs.existsSync(zipPath)) {
      return NextResponse.json(
        { error: "Extension package not found. Build may not have completed." },
        { status: 404 }
      );
    }

    const zipBuffer = fs.readFileSync(zipPath);

    return new NextResponse(zipBuffer, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition":
          'attachment; filename="poynts-campaign-extension.zip"',
        "Content-Length": zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving extension zip:", error);
    return NextResponse.json(
      { error: "Failed to serve extension download" },
      { status: 500 }
    );
  }
}
