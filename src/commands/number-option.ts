import { die } from "../output.js";

export function numberOption(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;

  const trimmed = value.trim();
  if (trimmed.length === 0) die(`Invalid number: ${JSON.stringify(value)}`);

  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed)) die(`Invalid number: ${value}`);
  return parsed;
}

export function requiredNumber(value: string, label: string): number {
  return numberOption(value) ?? die(`Missing ${label}`);
}
