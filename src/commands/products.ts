import { Command } from "commander";
import { createClient } from "../client.js";
import { isJsonMode, printResult, printTable, die } from "../output.js";

export function buildProductsCommand(): Command {
  const cmd = new Command("products").description("Manage products");

  cmd
    .command("list")
    .description("List products")
    .option("--page-size <n>", "Results per page", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--name <q>", "Filter by name")
    .action(async (opts: { pageSize: string; cursor?: string; name?: string }) => {
      const client = createClient();
      const { data, error } = await client.GET("/v1/products", {
        params: {
          query: {
            page_size: Number(opts.pageSize),
            ...(opts.cursor ? { cursor: opts.cursor } : {}),
            ...(opts.name ? { name: opts.name } : {}),
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
        console.log("No products found.");
        return;
      }
      printTable(
        ["ID", "Name", "SKU", "Price"],
        items.map((p: unknown) => {
          const product = p as {
            id?: number;
            name?: string;
            sku?: string;
            price?: number;
          };
          return [product.id, product.name, product.sku, product.price];
        })
      );
      if (body.nextCursor) {
        console.log(`\nNext page: --cursor ${body.nextCursor}`);
      }
    });

  return cmd;
}
