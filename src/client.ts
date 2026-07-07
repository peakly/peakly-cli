import { PeaklyClient } from "peakly";
import { resolveConfig } from "./config.js";

export function createClient(): PeaklyClient {
  const config = resolveConfig();

  if (!config.apiKey) {
    throw new Error(
      "Missing API key. Set PEAKLY_API_KEY or pass --api-key <key>."
    );
  }

  if (config.debug) {
    console.error(
      `[peakly] baseUrl=${config.baseUrl} apiKeySource=${config.apiKeySource}`
    );
  }

  return new PeaklyClient({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
  });
}
