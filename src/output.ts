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

export function printTable(
  headers: string[],
  rows: (string | number | null | undefined)[][]
): void {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map((r) => String(r[i] ?? "").length))
  );
  const fmt = (s: string | number | null | undefined, w: number) =>
    String(s ?? "").padEnd(w);
  console.log(headers.map((h, i) => fmt(h, widths[i])).join("  "));
  console.log(widths.map((w) => "─".repeat(w)).join("  "));
  for (const row of rows) {
    console.log(row.map((c, i) => fmt(c, widths[i])).join("  "));
  }
}

export function die(message: string): never {
  console.error(`Error: ${message}`);
  process.exit(1);
}
