# peakly-cli

[![CI](https://github.com/peakly/peakly-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/peakly/peakly-cli/actions/workflows/ci.yml)
[![Release](https://github.com/peakly/peakly-cli/actions/workflows/release.yml/badge.svg)](https://github.com/peakly/peakly-cli/actions/workflows/release.yml)
[![npm version](https://img.shields.io/npm/v/peakly-cli.svg)](https://www.npmjs.com/package/peakly-cli)

Command-line interface for the [Peakly API](https://api.peakly.ar), published as [`peakly-cli`](https://www.npmjs.com/package/peakly-cli) and exposing the `peakly` binary.

The CLI uses the public [`peakly`](https://www.npmjs.com/package/peakly) TypeScript SDK for API calls and types. It does not copy OpenAPI types or send `X-Organization-Id`.

## Install

```bash
npm install -g peakly-cli
```

Or run without installing:

```bash
npx peakly-cli --help
```

## Authentication

Peakly API keys are scoped to a single organization. The CLI sends only `X-API-Key`.

```bash
export PEAKLY_API_KEY=pk_...
peakly auth status
```

For one-off commands:

```bash
peakly --api-key pk_... customers list
```

Optional:

```bash
export PEAKLY_API_URL=https://api.peakly.ar
```

## Commands

### Auth and config

```bash
peakly auth status
peakly whoami
peakly ping
peakly config get
peakly config doctor
```

### Customers

```bash
peakly customers list
peakly customers list --search "Acme"
peakly customers search "30700000000"
peakly customers get 123
peakly customers create --business-name "Acme SA" --tax-id 30700000000
```

### Products

```bash
peakly products list
peakly products list --name "Widget"
peakly products search "Widget"
peakly products get 123
peakly products create --description "Widget A" --unit-of-measure-id 1 --unit-price 1000
```

### Sales receipts

```bash
peakly receipts list
peakly receipts list --date-from 2026-07-01 --date-to 2026-07-31
peakly receipts list --status Creada
peakly receipts get 550e8400-e29b-41d4-a716-446655440000
peakly receipts confirm 550e8400-e29b-41d4-a716-446655440000
peakly receipts void 550e8400-e29b-41d4-a716-446655440000
peakly receipts void 550e8400-e29b-41d4-a716-446655440000 --no-credit-note
```

### OpenAPI

```bash
peakly openapi pull > peakly-openapi.json
```

## JSON output

All commands support `--json`:

```bash
peakly --json customers list | jq '.data[0]'
peakly --json receipts get 550e8400-e29b-41d4-a716-446655440000 | jq '.total'
```

## Development

```bash
npm install
npm run typecheck
npm test
npm run build
node dist/index.js --help
```

## Release

Releases run from GitHub Actions with `semantic-release` and npm Trusted Publishing. Do not configure long-lived `NPM_TOKEN`/`NODE_AUTH_TOKEN` secrets for publishing.

Configure npm Trusted Publisher for package `peakly-cli`:

- repository: `peakly/peakly-cli`
- workflow: `.github/workflows/release.yml`
- environment: empty, unless a GitHub Environment is intentionally added later
- allowed action: `npm publish`

## License

MIT
