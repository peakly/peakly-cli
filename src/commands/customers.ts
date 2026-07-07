import { Command } from "commander";
import { createClient } from "../client.js";
import { die, formatApiError, isJsonMode, printResult, printTable } from "../output.js";
import { numberOption, requiredNumber } from "./number-option.js";

type CustomerRow = {
  id?: number;
  businessName?: string;
  taxId?: string | null;
  email?: string | null;
};

export function buildCustomersCommand(): Command {
  const cmd = new Command("customers").description("Manage customers");

  cmd
    .command("list")
    .description("List customers")
    .option("--page-size <n>", "Number of results per page", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--search <query>", "Search by business name, tax id, or email")
    .option("--provider-id <id>", "Exact external provider id")
    .action(
      async (opts: {
        pageSize: string;
        cursor?: string;
        search?: string;
        providerId?: string;
      }) => {
        const client = createClient();
        const { data, error } = await client.sales.customers.list({
          page_size: numberOption(opts.pageSize),
          cursor: opts.cursor,
          search: opts.search,
          provider_id: opts.providerId,
        });
        if (error) die(formatApiError(error));
        if (isJsonMode()) return printResult(data);

        const items = (data?.data ?? []) as CustomerRow[];
        const rows =
          items.map((customer) => [
            customer.id,
            customer.businessName,
            customer.taxId,
            customer.email,
          ]) ?? [];

        printTable(["ID", "Business name", "Tax ID", "Email"], rows);
        if (data?.nextCursor) console.log(`\nNext page: --cursor ${data.nextCursor}`);
      }
    );

  cmd
    .command("search <query>")
    .description("Search customers by business name, tax id, or email")
    .option("--page-size <n>", "Number of results", "20")
    .action(async (query: string, opts: { pageSize: string }) => {
      const client = createClient();
      const { data, error } = await client.sales.customers.list({
        search: query,
        page_size: numberOption(opts.pageSize),
      });
      if (error) die(formatApiError(error));
      if (isJsonMode()) return printResult(data);

      const items = (data?.data ?? []) as CustomerRow[];
      const rows =
        items.map((customer) => [
          customer.id,
          customer.businessName,
          customer.taxId,
          customer.email,
        ]) ?? [];
      printTable(["ID", "Business name", "Tax ID", "Email"], rows);
    });

  cmd
    .command("get <id>")
    .description("Get a customer by ID")
    .action(async (id: string) => {
      const customerId = requiredNumber(id, "customer id");
      const client = createClient();
      const { data, error } = await client.sales.customers.get(customerId);
      if (error) die(formatApiError(error));
      printResult(data);
    });

  cmd
    .command("create")
    .description("Create a customer")
    .option("--business-name <name>", "Legal/business name")
    .option("--tax-id <value>", "CUIT/CUIL/DNI")
    .option("--tax-category-id <id>", "Tax category id")
    .option("--document-type-id <id>", "Document type id")
    .option("--email <email>", "Email")
    .option("--phone <phone>", "Phone")
    .option("--address <address>", "Address")
    .option("--city <city>", "City")
    .option("--postal-code <postalCode>", "Postal code")
    .option("--provider-id <id>", "External provider id")
    .action(
      async (opts: {
        businessName?: string;
        taxId?: string;
        taxCategoryId?: string;
        documentTypeId?: string;
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        postalCode?: string;
        providerId?: string;
      }) => {
        if (!opts.businessName && !opts.taxId) {
          die("customers create requires --business-name or --tax-id");
        }

        const client = createClient();
        const { data, error } = await client.sales.customers.create({
          businessName: opts.businessName,
          taxId: opts.taxId,
          taxCategoryId: numberOption(opts.taxCategoryId),
          documentTypeId: numberOption(opts.documentTypeId),
          email: opts.email,
          phone: opts.phone,
          address: opts.address,
          city: opts.city,
          postalCode: opts.postalCode,
          providerId: opts.providerId,
          isActive: true,
        });
        if (error) die(formatApiError(error));
        printResult(data);
      }
    );

  return cmd;
}
