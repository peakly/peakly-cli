let _jsonMode = false;

export function setJsonMode(val: boolean): void {
  _jsonMode = val;
}

export function isJsonMode(): boolean {
  return _jsonMode;
}

export function printResult(data: unknown): void {
  if (_jsonMode) {
    console.log(JSON.stringify(data, null, 2));
    return;
  }
  console.log(JSON.stringify(data, null, 2));
}

export function printMessage(message: string): void {
  if (!_jsonMode) {
    console.log(message);
  }
}

export function printTable(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  if (!rows.length) {
    console.log("No results.");
    return;
  }
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length))
  );
  const fmt = (s: string | number | null | undefined, w: number) =>
    String(s ?? "").padEnd(w);
  console.log(headers.map((h, i) => fmt(h, widths[i])).join("  "));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) {
    console.log(row.map((c, i) => fmt(c, widths[i])).join("  "));
  }
}

export function formatApiError(error: unknown): string {
  if (!error) return "Unknown API error";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object") {
    const record = error as Record<string, unknown>;
    const code = record.error ?? record.code;
    const message = record.message ?? record.detail ?? record.title;
    if (code && message) return `${String(code)}: ${String(message)}`;
    if (message) return String(message);
    if (code) return String(code);
    return JSON.stringify(error);
  }
  return String(error);
}

export function die(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}
