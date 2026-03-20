import type { AIPipelineConfig } from "@/lib/ai/config";
import type { GenerationMode } from "@/lib/ai/types";

export type ProviderKey = "deterministic" | "local-ollama" | "openai";

export function resolveProviderOrder(
  _mode: GenerationMode,
  config: AIPipelineConfig,
): ProviderKey[] {
  const order: ProviderKey[] = [];

  const canUseOpenAI = config.allowPaidProviders && config.enableOpenAIAdapter;

  if (config.providerMode === "openai" && canUseOpenAI) {
    order.push("openai");
  }

  if (
    (config.providerMode === "local-first" ||
      config.providerMode === "openai") &&
    config.enableLocalProvider
  ) {
    order.push("local-ollama");
  }

  order.push("deterministic");

  return order;
}
