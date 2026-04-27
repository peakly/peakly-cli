import { Command } from "commander";
import { setJsonMode } from "./output.js";
import { buildAuthCommand, buildWhoamiCommand } from "./commands/auth.js";
import { buildCustomersCommand } from "./commands/customers.js";
import { buildReceiptsCommand } from "./commands/receipts.js";
import { buildProductsCommand } from "./commands/products.js";

const program = new Command();

program
  .name("peakly")
  .description("CLI for the Peakly API")
  .version("0.1.0")
  .option("--json", "Output raw JSON (for piping to jq)")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts() as { json?: boolean };
    setJsonMode(!!opts.json);
  });

program.addCommand(buildAuthCommand());
program.addCommand(buildWhoamiCommand());
program.addCommand(buildCustomersCommand());
program.addCommand(buildReceiptsCommand());
program.addCommand(buildProductsCommand());

program.parseAsync(process.argv).catch((err: unknown) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
