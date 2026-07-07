const DEFAULT_API_URL = "https://api.peakly.ar";

export interface RuntimeOptions {
  apiKey?: string;
  apiUrl?: string;
  debug?: boolean;
}

export interface ResolvedConfig {
  apiKey?: string;
  apiKeySource: "flag" | "env" | "missing";
  baseUrl: string;
  baseUrlSource: "flag" | "env" | "default";
  debug: boolean;
}

let runtimeOptions: RuntimeOptions = {};

export function setRuntimeOptions(options: RuntimeOptions): void {
  runtimeOptions = options;
}

export function normalizeBaseUrl(value: string): string {
  const trimmed = value.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/v1") ? trimmed.slice(0, -3) : trimmed;
}

export function resolveConfig(
  env: NodeJS.ProcessEnv = process.env
): ResolvedConfig {
  const apiKey = runtimeOptions.apiKey || env.PEAKLY_API_KEY;
  const apiUrl = runtimeOptions.apiUrl || env.PEAKLY_API_URL;

  return {
    apiKey,
    apiKeySource: runtimeOptions.apiKey
      ? "flag"
      : env.PEAKLY_API_KEY
        ? "env"
        : "missing",
    baseUrl: normalizeBaseUrl(apiUrl || DEFAULT_API_URL),
    baseUrlSource: runtimeOptions.apiUrl
      ? "flag"
      : env.PEAKLY_API_URL
        ? "env"
        : "default",
    debug: Boolean(runtimeOptions.debug),
  };
}

export function maskSecret(value: string | undefined): string | null {
  if (!value) return null;
  if (value.length <= 8) return "****";
  return `${value.slice(0, 5)}...${value.slice(-4)}`;
}
