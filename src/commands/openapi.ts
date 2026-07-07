import { Command } from "commander";
import { resolveConfig } from "../config.js";
import { die } from "../output.js";

export function buildOpenApiCommand(): Command {
  const cmd = new Command("openapi").description("Work with Peakly OpenAPI");

  cmd
    .command("pull")
    .description("Print the live OpenAPI document to stdout")
    .action(async () => {
      const config = resolveConfig();
      if (config.debug) {
        console.error(`[peakly] GET ${config.baseUrl}/openapi.json`);
      }
      const response = await fetch(`${config.baseUrl}/openapi.json`);
      if (!response.ok) {
        die(`OpenAPI request failed: ${response.status} ${response.statusText}`);
      }
      process.stdout.write(await response.text());
    });

  return cmd;
}
