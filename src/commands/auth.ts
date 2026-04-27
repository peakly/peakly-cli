import { Command } from "commander";
import { readConfig, writeConfig, configFilePath } from "../config.js";
import { createClient } from "../client.js";
import { printResult, die } from "../output.js";

export function buildAuthCommand(): Command {
  const cmd = new Command("auth").description("Authenticate with the Peakly API");

  cmd
    .requiredOption("--api-key <key>", "API key (pk_live_... or pk_test_...)")
    .option("--org-id <id>", "Organization ID (optional — resolved from key if omitted)")
    .option("--base-url <url>", "Override API base URL (or set PEAKLY_API_URL)")
    .action(
      async (opts: { apiKey: string; orgId?: string; baseUrl?: string }) => {
        writeConfig({
          apiKey: opts.apiKey,
          ...(opts.orgId ? { orgId: opts.orgId } : {}),
          ...(opts.baseUrl ? { baseUrl: opts.baseUrl } : {}),
        });
        console.log(`Credentials saved to ${configFilePath()}`);
      }
    );

  return cmd;
}

export function buildWhoamiCommand(): Command {
  return new Command("whoami")
    .description("Show current auth config and verify API connectivity")
    .action(async () => {
      const config = readConfig();
      const apiKey =
        process.env.PEAKLY_API_KEY ?? config?.apiKey ?? die("not authenticated");

      const masked =
        apiKey.length > 8
          ? apiKey.slice(0, 8) + "..." + apiKey.slice(-4)
          : "****";

      // Validate connectivity with a lightweight request
      const client = createClient();
      const { error } = await client.GET("/v1/customers", {
        params: { query: { page_size: 1 } },
      });

      const connected = !error;

      printResult({
        apiKey: masked,
        ...(config?.orgId ? { orgId: config.orgId } : {}),
        baseUrl:
          process.env.PEAKLY_API_URL ??
          config?.baseUrl ??
          "https://new.api.peakly.ar/v1",
        connected,
        ...(error ? { error: String(error) } : {}),
      });
    });
}
