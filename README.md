# @peakly/cli

Command-line interface for the [Peakly](https://peakly.ar) API — manage customers, invoices, and products from your terminal.

## Installation

```bash
npm install -g @peakly/cli
# or run without installing:
npx @peakly/cli <command>
```

## Authentication

```bash
peakly auth --api-key pk_live_...
```

Config is stored at `~/.peakly/config.json`. Override at runtime with:

```bash
PEAKLY_API_KEY=pk_live_... peakly whoami
PEAKLY_API_URL=https://staging.api.peakly.ar/v1 peakly customers list
```

## Commands

### Auth

```bash
peakly auth --api-key <key>           # Save credentials
peakly auth --api-key <key> --org-id <id>   # Save with explicit org ID
peakly whoami                         # Show stored config + verify connectivity
```

### Customers

```bash
peakly customers list                 # List all customers (paginated)
peakly customers list --page-size 50  # Custom page size
peakly customers list --cursor <c>    # Next page
peakly customers search "Acme"        # Search by name or CUIT
peakly customers get 123              # Get customer by ID
```

### Receipts

```bash
peakly receipts list                  # List receipts (paginated)
peakly receipts list --status EMITIDO # Filter by status
peakly receipts list --date-from 2025-01-01 --date-to 2025-12-31
peakly receipts list --search "Acme"  # Free-text search
peakly receipts get 456               # Get receipt by ID
peakly receipts void 456              # Void + auto-create credit note
peakly receipts void 456 --no-credit-note  # Void without credit note
```

### Products

```bash
peakly products list                  # List all products
peakly products list --name "Widget"  # Filter by name
peakly products list --page-size 50   # Custom page size
```

### JSON output

All commands support `--json` for machine-readable output:

```bash
peakly --json customers list | jq '.[0].name'
peakly --json receipts get 456 | jq '.total'
```

## Development

```bash
npm install
npm run build      # Compile TypeScript → dist/
npm run typecheck  # Type-check only
npm run dev        # Watch mode
```

### Regenerating SDK types

The CLI depends on `@peakly/sdk` which is auto-generated from the API OpenAPI spec. See [peakly/peakly-sdk](https://github.com/peakly/peakly-sdk) for regeneration instructions.

## Environment variables

| Variable | Description |
|---|---|
| `PEAKLY_API_KEY` | API key — overrides `~/.peakly/config.json` |
| `PEAKLY_API_URL` | Base URL — overrides config (default: `https://new.api.peakly.ar/v1`) |

## License

UNLICENSED — proprietary.
