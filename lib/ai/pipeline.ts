import { getAIPipelineConfig, type AIPipelineConfig } from "@/lib/ai/config";
import type { GenerationContext, GenerationMode } from "@/lib/ai/types";
import { sanitizeStudyText } from "@/lib/text/sanitize";

function normalizeText(raw: string) {
  return sanitizeStudyText(
    raw
      .replace(/\r/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function createChunks(text: string, chunkSize: number, overlap: number) {
  if (!text) {
    return [];
  }

  if (text.length <= chunkSize) {
    return [text];
  }

  const chunks: string[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    const end = Math.min(text.length, cursor + chunkSize);
    chunks.push(text.slice(cursor, end).trim());

    if (end >= text.length) {
      break;
    }

    cursor = Math.max(end - overlap, cursor + 1);
  }

  return chunks.filter(Boolean);
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 3);
}

function keywordsForMode(mode: GenerationMode) {
  if (mode === "quiz") {
    return ["concept", "definition", "process", "example", "important"];
  }

  if (mode === "flashcards") {
    return ["term", "definition", "key", "meaning", "principle"];
  }

  return ["summary", "important", "key", "concept", "overview"];
}

function scoreChunk(chunk: string, mode: GenerationMode) {
  const keywords = keywordsForMode(mode);
  const tokens = tokenize(chunk);

  if (!tokens.length) {
    return 0;
  }

  const matches = keywords.reduce((count, keyword) => {
    return count + (tokens.includes(keyword) ? 1 : 0);
  }, 0);

  return matches * 10 + Math.min(8, Math.floor(tokens.length / 30));
}

export function buildGenerationContext(
  rawText: string,
  mode: GenerationMode,
  configOverride?: AIPipelineConfig,
): GenerationContext {
  const config = configOverride || getAIPipelineConfig();
  const normalized = normalizeText(rawText);

  const allChunks = createChunks(
    normalized,
    config.chunkSize,
    Math.min(config.chunkOverlap, Math.floor(config.chunkSize / 2)),
  );

  const selectedChunks = [...allChunks]
    .map((chunk) => ({ chunk, score: scoreChunk(chunk, mode) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.max(1, config.maxContextChunks))
    .map((entry) => entry.chunk);

  const contextText = selectedChunks.join("\n\n").trim() || normalized;

  return {
    originalText: rawText,
    normalizedText: normalized,
    contextText,
    mode,
    chunking: {
      totalChunks: allChunks.length || (normalized ? 1 : 0),
      selectedChunks: selectedChunks.length || (normalized ? 1 : 0),
    },
  };
}
