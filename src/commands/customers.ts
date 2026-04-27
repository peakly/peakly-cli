import { Command } from "commander";
import { createClient } from "../client.js";
import { isJsonMode, printResult, printTable, die } from "../output.js";

export function buildCustomersCommand(): Command {
  const cmd = new Command("customers").description("Manage customers");

  cmd
    .command("list")
    .description("List customers")
    .option("--page-size <n>", "Number of results per page", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .action(async (opts: { pageSize: string; cursor?: string }) => {
      const client = createClient();
      const { data, error } = await client.GET("/v1/customers", {
        params: {
          query: {
            page_size: Number(opts.pageSize),
            ...(opts.cursor ? { cursor: opts.cursor } : {}),
          },
        },
      });
      if (error) die(JSON.stringify(error));
      if (isJsonMode()) {
        printResult(data);
        return;
      }
      const body = data as unknown as { data?: unknown[]; nextCursor?: string };
      const items = body.data ?? [];
      if (!items.length) {
        console.log("No customers found.");
        return;
      }
      printTable(
        ["ID", "Name", "CUIT", "Email"],
        items.map((c: unknown) => {
          const customer = c as {
            id?: number;
            name?: string;
            cuit?: string;
            email?: string;
          };
          return [customer.id, customer.name, customer.cuit, customer.email];
        })
      );
      if (body.nextCursor) {
        console.log(`\nNext page: --cursor ${body.nextCursor}`);
      }
    });

  cmd
    .command("search <query>")
    .description("Search customers by name or CUIT")
    .option("--page-size <n>", "Number of results", "20")
    .action(async (query: string, opts: { pageSize: string }) => {
      const client = createClient();
      const { data, error } = await client.GET("/v1/customers", {
        params: {
          query: { search: query, page_size: Number(opts.pageSize) },
        },
      });
      if (error) die(JSON.stringify(error));
      if (isJsonMode()) {
        printResult(data);
        return;
      }
      const body = data as unknown as { data?: unknown[]; nextCursor?: string };
      const items = body.data ?? [];
      if (!items.length) {
        console.log("No customers found.");
        return;
      }
      printTable(
        ["ID", "Name", "CUIT", "Email"],
        items.map((c: unknown) => {
          const customer = c as {
            id?: number;
            name?: string;
            cuit?: string;
            email?: string;
          };
          return [customer.id, customer.name, customer.cuit, customer.email];
        })
      );
    });

  cmd
    .command("get <id>")
    .description("Get a customer by ID")
    .action(async (id: string) => {
      const client = createClient();
      const { data, error } = await client.GET("/v1/customers/{id}", {
        params: { path: { id: Number(id) } },
      });
      if (error) die(JSON.stringify(error));
      printResult(data);
    });

  return cmd;
}
