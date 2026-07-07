import { Command } from "commander";
import { createClient } from "../client.js";
import { die, formatApiError, isJsonMode, printResult, printTable } from "../output.js";

type ProductRow = {
  id?: number;
  description?: string;
  barcode?: string | null;
  unitPrice?: number | null;
};

function numberOption(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) die(`Invalid number: ${value}`);
  return parsed;
}

export function buildProductsCommand(): Command {
  const cmd = new Command("products").description("Manage products");

  cmd
    .command("list")
    .description("List products")
    .option("--page-size <n>", "Results per page", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--name <query>", "Filter by product description")
    .action(
      async (opts: { pageSize: string; cursor?: string; name?: string }) => {
        const client = createClient();
        const { data, error } = await client.sales.products.list({
          page_size: numberOption(opts.pageSize),
          cursor: opts.cursor,
          name: opts.name,
        });
        if (error) die(formatApiError(error));
        if (isJsonMode()) return printResult(data);

        const items = (data?.data ?? []) as ProductRow[];
        const rows =
          items.map((product) => [
            product.id,
            product.description,
            product.barcode,
            product.unitPrice,
          ]) ?? [];

        printTable(["ID", "Description", "Barcode", "Unit price"], rows);
        if (data?.nextCursor) console.log(`\nNext page: --cursor ${data.nextCursor}`);
      }
    );

  cmd
    .command("search <query>")
    .description("Search products by description or barcode")
    .option("--limit <n>", "Max results", "20")
    .action(async (query: string, opts: { limit: string }) => {
      const client = createClient();
      const { data, error } = await client.sales.products.search({
        q: query,
        limit: numberOption(opts.limit),
      });
      if (error) die(formatApiError(error));
      if (isJsonMode()) return printResult(data);

      const items = (data?.results ?? []) as ProductRow[];
      const rows =
        items.map((product) => [
          product.id,
          product.description,
          product.barcode,
          product.unitPrice,
        ]) ?? [];
      printTable(["ID", "Description", "Barcode", "Unit price"], rows);
    });

  cmd
    .command("get <id>")
    .description("Get a product by ID")
    .action(async (id: string) => {
      const client = createClient();
      const { data, error } = await client.sales.products.get(Number(id));
      if (error) die(formatApiError(error));
      printResult(data);
    });

  cmd
    .command("create")
    .description("Create a product")
    .requiredOption("--description <description>", "Product description")
    .requiredOption("--unit-of-measure-id <id>", "Unit of measure id")
    .option("--barcode <barcode>", "Barcode")
    .option("--vat-rate-id <id>", "VAT rate id")
    .option("--category-id <id>", "Product category id")
    .option("--type <type>", "Product type")
    .option("--quantity <n>", "Default quantity")
    .option("--unit-price <n>", "Default unit price")
    .action(
      async (opts: {
        description: string;
        unitOfMeasureId: string;
        barcode?: string;
        vatRateId?: string;
        categoryId?: string;
        type?: string;
        quantity?: string;
        unitPrice?: string;
      }) => {
        const unitOfMeasureId =
          numberOption(opts.unitOfMeasureId) ?? die("Missing --unit-of-measure-id");
        const client = createClient();
        const { data, error } = await client.sales.products.create({
          description: opts.description,
          unitOfMeasureId,
          barcode: opts.barcode,
          vatRateId: numberOption(opts.vatRateId),
          categoryId: numberOption(opts.categoryId),
          type: opts.type,
          quantity: numberOption(opts.quantity),
          unitPrice: numberOption(opts.unitPrice),
        });
        if (error) die(formatApiError(error));
        printResult(data);
      }
    );

  return cmd;
}
