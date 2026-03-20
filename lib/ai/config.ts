export type ProviderMode = "deterministic" | "local-first" | "openai";

export type AIPipelineConfig = {
  pipelineVersion: string;
  providerMode: ProviderMode;
  enableLocalProvider: boolean;
  localBaseUrl: string;
  localModel: string;
  localTimeoutMs: number;
  allowPaidProviders: boolean;
  enableOpenAIAdapter: boolean;
  chunkSize: number;
  chunkOverlap: number;
  maxContextChunks: number;
};

function parseBooleanEnv(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue;
  return value.toLowerCase() === "true";
}

function parseNumberEnv(value: string | undefined, defaultValue: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

export function parseProviderMode(value: string | undefined): ProviderMode {
  if (value === "local-first" || value === "openai") {
    return value;
  }

  return "deterministic";
}

export function getAIPipelineConfig(): AIPipelineConfig {
  return {
    pipelineVersion: process.env.AI_PIPELINE_VERSION || "v2-free-local",
    providerMode: parseProviderMode(process.env.AI_PROVIDER_MODE),
    enableLocalProvider: parseBooleanEnv(
      process.env.AI_ENABLE_LOCAL_PROVIDER,
      false,
    ),
    localBaseUrl: process.env.AI_LOCAL_BASE_URL || "http://127.0.0.1:11434",
    localModel: process.env.AI_LOCAL_MODEL || "llama3.1:8b",
    localTimeoutMs: parseNumberEnv(process.env.AI_LOCAL_TIMEOUT_MS, 12000),
    allowPaidProviders: parseBooleanEnv(
      process.env.AI_ALLOW_PAID_PROVIDERS,
      false,
    ),
    enableOpenAIAdapter: parseBooleanEnv(
      process.env.AI_ENABLE_OPENAI_ADAPTER,
      false,
    ),
    chunkSize: parseNumberEnv(process.env.AI_CHUNK_SIZE, 900),
    chunkOverlap: parseNumberEnv(process.env.AI_CHUNK_OVERLAP, 180),
    maxContextChunks: parseNumberEnv(process.env.AI_MAX_CONTEXT_CHUNKS, 6),
  };
}

export function withAIPipelineOverrides(
  base: AIPipelineConfig,
  overrides: Partial<AIPipelineConfig>,
): AIPipelineConfig {
  return {
    ...base,
    ...overrides,
    providerMode: parseProviderMode(overrides.providerMode),
  };
}
