import { PeaklyClient } from "@peakly/sdk";
import { readConfig } from "./config.js";

export function createClient(): PeaklyClient {
  const config = readConfig();
  const apiKey = process.env.PEAKLY_API_KEY ?? config?.apiKey;
  const baseUrl = process.env.PEAKLY_API_URL ?? config?.baseUrl;

  if (!apiKey) {
    console.error(
      "Error: not authenticated. Run: peakly auth --api-key <key>"
    );
    process.exit(1);
  }

  return new PeaklyClient(apiKey, baseUrl ? { baseUrl } : undefined);
}
