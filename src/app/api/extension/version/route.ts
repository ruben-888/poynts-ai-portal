import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const manifestPath = path.join(process.cwd(), "chrome-extension", "manifest.json");

    if (!fs.existsSync(manifestPath)) {
      return NextResponse.json(
        { error: "Extension manifest not found" },
        { status: 404 }
      );
    }

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));

    return NextResponse.json({
      version: manifest.version,
      name: manifest.name,
      downloadUrl: "/api/extension/download",
      installPageUrl: "/extension",
    });
  } catch (error) {
    console.error("Error reading extension version:", error);
    return NextResponse.json(
      { error: "Failed to get extension version" },
      { status: 500 }
    );
  }
}
