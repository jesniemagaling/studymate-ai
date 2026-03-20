import { describe, expect, it } from "vitest";
import { resolveProviderOrder } from "@/lib/ai/provider-plan";
import type { AIPipelineConfig } from "@/lib/ai/config";

const baseConfig: AIPipelineConfig = {
  pipelineVersion: "test",
  providerMode: "deterministic",
  enableLocalProvider: false,
  localBaseUrl: "http://127.0.0.1:11434",
  localModel: "llama3.1:8b",
  localTimeoutMs: 12000,
  allowPaidProviders: false,
  enableOpenAIAdapter: false,
  chunkSize: 900,
  chunkOverlap: 180,
  maxContextChunks: 6,
};

describe("resolveProviderOrder", () => {
  it("uses deterministic-only mode by default", () => {
    const order = resolveProviderOrder("reviewer", baseConfig);
    expect(order).toEqual(["deterministic"]);
  });

  it("uses local-first chain when local mode is enabled", () => {
    const order = resolveProviderOrder("quiz", {
      ...baseConfig,
      providerMode: "local-first",
      enableLocalProvider: true,
    });

    expect(order).toEqual(["local-ollama", "deterministic"]);
  });

  it("blocks openai when paid providers are disabled", () => {
    const order = resolveProviderOrder("flashcards", {
      ...baseConfig,
      providerMode: "openai",
      enableLocalProvider: true,
      allowPaidProviders: false,
      enableOpenAIAdapter: true,
    });

    expect(order).toEqual(["local-ollama", "deterministic"]);
  });

  it("includes openai when all paid gates are enabled", () => {
    const order = resolveProviderOrder("reviewer", {
      ...baseConfig,
      providerMode: "openai",
      enableLocalProvider: true,
      allowPaidProviders: true,
      enableOpenAIAdapter: true,
    });

    expect(order).toEqual(["openai", "local-ollama", "deterministic"]);
  });
});
