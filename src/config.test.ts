import { describe, expect, it } from "vitest";
import { maskSecret, normalizeBaseUrl, resolveConfig, setRuntimeOptions } from "./config.js";

describe("config", () => {
  it("normalizes API URLs for SDK baseUrl usage", () => {
    expect(normalizeBaseUrl("https://api.peakly.ar/v1/")).toBe("https://api.peakly.ar");
    expect(normalizeBaseUrl("https://api.peakly.ar/")).toBe("https://api.peakly.ar");
  });

  it("prefers runtime flags over environment variables", () => {
    setRuntimeOptions({ apiKey: "flag-key", apiUrl: "https://flag.example/v1" });
    const config = resolveConfig({
      PEAKLY_API_KEY: "env-key",
      PEAKLY_API_URL: "https://env.example",
    });
    expect(config.apiKey).toBe("flag-key");
    expect(config.apiKeySource).toBe("flag");
    expect(config.baseUrl).toBe("https://flag.example");
    expect(config.baseUrlSource).toBe("flag");
    setRuntimeOptions({});
  });

  it("masks API keys", () => {
    expect(maskSecret("pk_live_1234567890")).toBe("pk_li...7890");
    expect(maskSecret("short")).toBe("****");
    expect(maskSecret(undefined)).toBeNull();
  });
});
