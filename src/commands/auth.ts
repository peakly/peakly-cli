import { Command } from "commander";
import { createClient } from "../client.js";
import { maskSecret, resolveConfig } from "../config.js";
import { die, formatApiError, printResult } from "../output.js";

interface AuthStatus {
  connected: boolean;
  apiKey: string | null;
  apiKeySource: string;
  baseUrl: string;
  baseUrlSource: string;
  status?: number;
  error?: string;
}

async function getAuthStatus() {
  const config = resolveConfig();

  if (!config.apiKey) {
    return {
      connected: false,
      apiKey: null,
      apiKeySource: "missing",
      baseUrl: config.baseUrl,
      baseUrlSource: config.baseUrlSource,
      error: "Missing API key. Set PEAKLY_API_KEY or pass --api-key <key>.",
    } satisfies AuthStatus;
  }

  const client = createClient();
  const { error, response } = await client.sales.customers.list({
    page_size: 1,
  });

  return {
    connected: !error,
    apiKey: maskSecret(config.apiKey),
    apiKeySource: config.apiKeySource,
    baseUrl: config.baseUrl,
    baseUrlSource: config.baseUrlSource,
    status: response.status,
    ...(error ? { error: formatApiError(error) } : {}),
  } satisfies AuthStatus;
}

export function buildAuthCommand(): Command {
  const cmd = new Command("auth").description("Inspect Peakly API authentication");

  cmd
    .command("status")
    .description("Verify the configured API key without printing it")
    .action(async () => {
      const status = await getAuthStatus();
      printResult(status);
      if (!status.connected) process.exit(1);
    });

  return cmd;
}

export function buildPingCommand(): Command {
  return new Command("ping")
    .description("Check API connectivity")
    .action(async () => {
      const status = await getAuthStatus();
      if (!status.connected) die(status.error ?? "Could not connect to Peakly API");
      printResult({ ok: true, baseUrl: status.baseUrl, status: status.status });
    });
}

export function buildWhoamiCommand(): Command {
  return new Command("whoami")
    .description("Alias for auth status")
    .action(async () => {
      const status = await getAuthStatus();
      printResult(status);
      if (!status.connected) process.exit(1);
    });
}
