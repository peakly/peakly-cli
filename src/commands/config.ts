import { Command } from "commander";
import { maskSecret, resolveConfig } from "../config.js";
import { printResult } from "../output.js";

export function buildConfigCommand(): Command {
  const cmd = new Command("config").description("Inspect CLI configuration");

  cmd
    .command("get")
    .description("Print resolved configuration without exposing secrets")
    .action(() => {
      const config = resolveConfig();
      printResult({
        apiKey: maskSecret(config.apiKey),
        apiKeySource: config.apiKeySource,
        baseUrl: config.baseUrl,
        baseUrlSource: config.baseUrlSource,
        debug: config.debug,
      });
    });

  cmd
    .command("doctor")
    .description("Check whether required configuration is present")
    .action(() => {
      const config = resolveConfig();
      printResult({
        ok: Boolean(config.apiKey),
        apiKey: maskSecret(config.apiKey),
        apiKeySource: config.apiKeySource,
        baseUrl: config.baseUrl,
      });
      if (!config.apiKey) process.exit(1);
    });

  return cmd;
}
