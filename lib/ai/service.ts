import { buildGenerationContext } from "@/lib/ai/pipeline";
import type { AIPipelineConfig } from "@/lib/ai/config";
import { getEffectiveAIPipelineConfig } from "@/lib/ai/runtime-settings";
import { resolveProviderOrder } from "@/lib/ai/provider-plan";
import { deterministicProvider } from "@/lib/ai/providers/deterministic";
import { localOllamaProvider } from "@/lib/ai/providers/local-ollama";
import { openAIProvider } from "@/lib/ai/providers/openai";
import type {
  FlashcardGenerationInput,
  GenerationMode,
  GenerationProvider,
  GenerationTelemetry,
  QuizGenerationInput,
  ReviewerGenerationInput,
} from "@/lib/ai/types";

export class AIPipelineInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIPipelineInputError";
  }
}

const providerMap: Record<string, GenerationProvider> = {
  deterministic: deterministicProvider,
  "local-ollama": localOllamaProvider,
  openai: openAIProvider,
};

function ensureText(text: string | undefined) {
  if (!text || typeof text !== "string" || !text.trim()) {
    throw new AIPipelineInputError("No text provided");
  }

  return text;
}

async function runWithFallback<T>(options: {
  mode: GenerationMode;
  config: AIPipelineConfig;
  execute: (provider: GenerationProvider) => Promise<T>;
}) {
  const providerKeys = resolveProviderOrder(options.mode, options.config);
  const providers = providerKeys.map((key) => providerMap[key]).filter(Boolean);

  let retryCount = 0;
  let lastError: unknown = null;

  for (const provider of providers) {
    try {
      const data = await options.execute(provider);

      const telemetry: GenerationTelemetry = {
        generationMode: options.mode,
        pipelineVersion: options.config.pipelineVersion,
        provider: provider.name,
        retryCount,
      };

      return { data, telemetry };
    } catch (error) {
      lastError = error;
      retryCount += 1;
      continue;
    }
  }

  throw lastError || new Error("AI_PIPELINE_NO_PROVIDER_AVAILABLE");
}

export async function generateReviewer(input: ReviewerGenerationInput) {
  const text = ensureText(input.text);
  const { effectiveConfig } = await getEffectiveAIPipelineConfig();
  const context = buildGenerationContext(text, "reviewer", effectiveConfig);

  const { data, telemetry } = await runWithFallback<string>({
    mode: "reviewer",
    config: effectiveConfig,
    execute: (provider) => provider.generateReviewer(context),
  });

  return {
    reviewer: data,
    telemetry,
    chunking: context.chunking,
  };
}

export async function generateQuiz(input: QuizGenerationInput) {
  const text = ensureText(input.text);
  const { effectiveConfig } = await getEffectiveAIPipelineConfig();
  const context = buildGenerationContext(text, "quiz", effectiveConfig);

  const { data, telemetry } = await runWithFallback({
    mode: "quiz",
    config: effectiveConfig,
    execute: (provider) =>
      provider.generateQuiz(context, {
        difficulty: input.difficulty,
        count: input.count,
        questionType: input.questionType,
      }),
  });

  return {
    questions: data,
    telemetry,
    chunking: context.chunking,
  };
}

export async function generateFlashcards(input: FlashcardGenerationInput) {
  const text = ensureText(input.text);
  const { effectiveConfig } = await getEffectiveAIPipelineConfig();
  const context = buildGenerationContext(text, "flashcards", effectiveConfig);

  const { data, telemetry } = await runWithFallback({
    mode: "flashcards",
    config: effectiveConfig,
    execute: (provider) => provider.generateFlashcards(context),
  });

  return {
    flashcards: data,
    telemetry,
    chunking: context.chunking,
  };
}
