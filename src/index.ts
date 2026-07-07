import { Command } from "commander";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { setJsonMode } from "./output.js";
import { setRuntimeOptions } from "./config.js";
import { buildAuthCommand, buildPingCommand, buildWhoamiCommand } from "./commands/auth.js";
import { buildCustomersCommand } from "./commands/customers.js";
import { buildReceiptsCommand } from "./commands/receipts.js";
import { buildProductsCommand } from "./commands/products.js";
import { buildConfigCommand } from "./commands/config.js";
import { buildOpenApiCommand } from "./commands/openapi.js";

const program = new Command();

function addSharedOptions(command: Command): Command {
  return command
    .option("--json", "Output raw JSON (for piping to jq)")
    .option("--api-key <key>", "API key. Prefer PEAKLY_API_KEY for regular use.")
    .option("--api-url <url>", "API base URL. Defaults to https://api.peakly.ar.")
    .option("--debug", "Print additional diagnostic details");
}

function readPackageVersion(): string {
  const packageJsonUrl = new URL("../package.json", import.meta.url);
  const packageJson = JSON.parse(
    readFileSync(fileURLToPath(packageJsonUrl), "utf-8")
  ) as { version?: string };
  return packageJson.version ?? "0.0.0";
}

program
  .name("peakly")
  .description("CLI for the Peakly API")
  .version(readPackageVersion())
  .showHelpAfterError()
  .hook("preAction", (_thisCommand, actionCommand) => {
    const opts = actionCommand.optsWithGlobals() as {
      json?: boolean;
      apiKey?: string;
      apiUrl?: string;
      debug?: boolean;
    };
    setJsonMode(!!opts.json);
    setRuntimeOptions({
      apiKey: opts.apiKey,
      apiUrl: opts.apiUrl,
      debug: opts.debug,
    });
  });

addSharedOptions(program);

program.addCommand(buildAuthCommand());
program.addCommand(buildPingCommand());
program.addCommand(buildConfigCommand());
program.addCommand(buildWhoamiCommand());
program.addCommand(buildCustomersCommand());
program.addCommand(buildReceiptsCommand());
program.addCommand(buildProductsCommand());
program.addCommand(buildOpenApiCommand());

for (const command of program.commands) {
  addSharedOptions(command);
  for (const subcommand of command.commands) {
    addSharedOptions(subcommand);
  }
}

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
