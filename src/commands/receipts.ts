import { Command } from "commander";
import { createClient } from "../client.js";
import { die, formatApiError, isJsonMode, printResult, printTable } from "../output.js";

type ReceiptRow = {
  id?: string;
  number?: string;
  date?: string;
  customerId?: number;
  total?: number;
  status?: string;
  customer?: {
    businessName?: string;
  } | null;
};

function numberOption(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) die(`Invalid number: ${value}`);
  return parsed;
}

export function buildReceiptsCommand(): Command {
  const cmd = new Command("receipts").description("Manage sales receipts");

  cmd
    .command("list")
    .description("List sales receipts")
    .option("--page-size <n>", "Results per page", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--status <status>", "Filter by status")
    .option("--date-from <date>", "Filter from date (YYYY-MM-DD)")
    .option("--date-to <date>", "Filter to date (YYYY-MM-DD)")
    .option("--search <query>", "Search customer, receipt number, CAE, cuit:<value>, nro:<value>, id:<value>")
    .option("--customer-id <id>", "Filter by customer id")
    .action(
      async (opts: {
        pageSize: string;
        cursor?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        search?: string;
        customerId?: string;
      }) => {
        const client = createClient();
        const { data, error } = await client.sales.receipts.list({
          page_size: numberOption(opts.pageSize),
          cursor: opts.cursor,
          status: opts.status,
          date_from: opts.dateFrom,
          date_to: opts.dateTo,
          search: opts.search,
          customer_id: numberOption(opts.customerId),
        });
        if (error) die(formatApiError(error));
        if (isJsonMode()) return printResult(data);

        const items = (data?.data ?? []) as ReceiptRow[];
        const rows =
          items.map((receipt) => [
            receipt.id,
            receipt.number,
            receipt.date?.slice(0, 10),
            receipt.customer?.businessName ?? receipt.customerId,
            receipt.total,
            receipt.status,
          ]) ?? [];

        printTable(["ID", "Number", "Date", "Customer", "Total", "Status"], rows);
        if (data?.nextCursor) console.log(`\nNext page: --cursor ${data.nextCursor}`);
      }
    );

  cmd
    .command("get <id>")
    .description("Get a receipt by ID")
    .action(async (id: string) => {
      const client = createClient();
      const { data, error } = await client.sales.receipts.get(id);
      if (error) die(formatApiError(error));
      printResult(data);
    });

  cmd
    .command("confirm <id>")
    .description("Confirm a draft receipt")
    .action(async (id: string) => {
      const client = createClient();
      const { data, error } = await client.sales.receipts.confirm(id);
      if (error) die(formatApiError(error));
      printResult(data);
    });

  cmd
    .command("void <id>")
    .description("Void a receipt")
    .option("--no-credit-note", "Skip auto-creating a compensating credit note")
    .action(async (id: string, opts: { creditNote: boolean }) => {
      const client = createClient();
      const { data, error } = await client.sales.receipts.void(id, {
        createCreditNote: opts.creditNote,
      });
      if (error) die(formatApiError(error));
      printResult(data);
    });

  return cmd;
}
