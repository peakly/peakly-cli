import { Command } from "commander";
import { createClient } from "../client.js";
import { isJsonMode, printResult, printTable, die } from "../output.js";

export function buildReceiptsCommand(): Command {
  const cmd = new Command("receipts").description(
    "Manage sales receipts (invoices)"
  );

  cmd
    .command("list")
    .description("List sales receipts")
    .option("--page-size <n>", "Results per page", "20")
    .option("--cursor <cursor>", "Pagination cursor")
    .option("--status <status>", "Filter by status (e.g. EMITIDO, BORRADOR)")
    .option("--date-from <date>", "Filter from date (YYYY-MM-DD)")
    .option("--date-to <date>", "Filter to date (YYYY-MM-DD)")
    .option("--search <q>", "Free-text search")
    .action(
      async (opts: {
        pageSize: string;
        cursor?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        search?: string;
      }) => {
        const client = createClient();
        const { data, error } = await client.GET("/v1/sales-receipts", {
          params: {
            query: {
              page_size: Number(opts.pageSize),
              ...(opts.cursor ? { cursor: opts.cursor } : {}),
              ...(opts.status ? { status: opts.status as never } : {}),
              ...(opts.dateFrom ? { date_from: opts.dateFrom } : {}),
              ...(opts.dateTo ? { date_to: opts.dateTo } : {}),
              ...(opts.search ? { search: opts.search } : {}),
            },
          },
        });
        if (error) die(JSON.stringify(error));
        if (isJsonMode()) {
          printResult(data);
          return;
        }
        const body = data as unknown as {
          data?: unknown[];
          nextCursor?: string;
        };
        const items = body.data ?? [];
        if (!items.length) {
          console.log("No receipts found.");
          return;
        }
        printTable(
          ["ID", "Number", "Date", "Customer", "Total", "Status"],
          items.map((r: unknown) => {
            const receipt = r as {
              id?: string;
              number?: string;
              date?: string;
              customerName?: string;
              total?: number;
              status?: string;
            };
            return [
              receipt.id,
              receipt.number,
              receipt.date,
              receipt.customerName,
              receipt.total,
              receipt.status,
            ];
          })
        );
        if (body.nextCursor) {
          console.log(`\nNext page: --cursor ${body.nextCursor}`);
        }
      }
    );

  cmd
    .command("get <id>")
    .description("Get a receipt by ID")
    .action(async (id: string) => {
      const client = createClient();
      const { data, error } = await client.GET("/v1/sales-receipts/{id}", {
        params: { path: { id } },
      });
      if (error) die(JSON.stringify(error));
      printResult(data);
    });

  cmd
    .command("void <id>")
    .description(
      "Void a receipt (creates a compensating credit note by default)"
    )
    .option(
      "--no-credit-note",
      "Skip auto-creating a compensating credit note"
    )
    .action(async (id: string, opts: { creditNote: boolean }) => {
      const client = createClient();
      const { data, error } = await client.POST(
        "/v1/sales-receipts/{id}/void",
        {
          params: { path: { id } },
          body: { createCreditNote: opts.creditNote },
        }
      );
      if (error) die(JSON.stringify(error));
      printResult(data);
    });

  return cmd;
}
