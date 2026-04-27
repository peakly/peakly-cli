import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

const CONFIG_DIR = join(homedir(), ".peakly");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export interface PeaklyConfig {
  apiKey: string;
  orgId?: string;
  baseUrl?: string;
}

export function readConfig(): PeaklyConfig | null {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, "utf-8")) as PeaklyConfig;
  } catch {
    return null;
  }
}

export function writeConfig(config: PeaklyConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2) + "\n", "utf-8");
}

export function configFilePath(): string {
  return CONFIG_FILE;
}
