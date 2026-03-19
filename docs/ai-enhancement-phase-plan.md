# StudyMate AI - Advanced Generation Upgrade Plan

## Goal

Improve reviewer, quiz, and flashcard quality to be closer to premium assistant outputs while keeping reliability, cost control, and backward compatibility.

## Scope

This is a pre-implementation phase plan only. No functional behavior changes are included here yet.

## Phase 0 - Baseline and Safety (Prework)

### Objectives

1. Keep current generation routes stable while building new pipeline.
2. Add feature flags for controlled rollout.
3. Define quality metrics and acceptance thresholds.

### Deliverables

1. Feature flags:
   1. AI_PIPELINE_V2_REVIEWER
   2. AI_PIPELINE_V2_QUIZ
   3. AI_PIPELINE_V2_FLASHCARDS
2. Unified telemetry fields in generation responses:
   1. generationMode
   2. pipelineVersion
   3. retryCount
3. Baseline metrics capture:
   1. generation latency
   2. validation failure rate
   3. user satisfaction proxy (save/use rates)

### Exit Criteria

1. Existing behavior unchanged when flags are off.
2. Baseline metrics visible in logs.

## Phase 1 - Chunking and Relevance Selection

### Objectives

1. Reduce noise from long extracted text.
2. Improve grounding before generation.

### Design

1. Text normalization:
   1. Remove duplicated whitespace and noisy separators.
2. Semantic chunking:
   1. Sliding window with overlap.
   2. Configurable chunk size and overlap.
3. Relevance ranking:
   1. Query-aware scoring per output type.
   2. Select top K chunks for generation context.

### Deliverables

1. New service module for chunking and ranking.
2. Relevance context payload passed to generator routes.
3. Fallback behavior when text is short (no chunking needed).

### Exit Criteria

1. Long-input routes consume top-ranked chunks only.
2. No regression on short inputs.

## Phase 2 - Multi-step Reviewer Pipeline

### Objectives

1. Improve coherence, coverage, and readability.
2. Make output less template-like and more instructional.

### Design

1. Step A: Concept extraction and learning-objective map.
2. Step B: Draft reviewer generation from selected chunks.
3. Step C: Critique pass (coverage, clarity, factual consistency).
4. Step D: Final rewrite with consistent voice and structure.

### Deliverables

1. Reviewer pipeline orchestrator service.
2. Internal critique rubric with numeric scoring.
3. Final output mapped to strict reviewer schema.

### Exit Criteria

1. Reviewer output passes schema validation.
2. Critique score meets configured threshold.

## Phase 3 - Multi-step Quiz and Flashcards Pipelines

### Objectives

1. Improve question quality and distractor quality.
2. Improve flashcard usefulness beyond simple definitions.

### Quiz Design

1. Step A: Topic and concept extraction.
2. Step B: Difficulty-aware question drafting.
3. Step C: Critique pass for ambiguity and answer validity.
4. Step D: Rewrite and finalize with explanations.

### Flashcard Design

1. Step A: Concept extraction and tagging.
2. Step B: Card drafting (definition + application mix).
3. Step C: Critique pass for clarity and redundancy.
4. Step D: Rewrite and finalize.

### Deliverables

1. Quiz orchestrator service.
2. Flashcard orchestrator service.
3. Difficulty distribution guardrails.

### Exit Criteria

1. Quiz questions contain valid answer-option mapping.
2. Flashcards have low redundancy and clear front/back quality.

## Phase 4 - Structured JSON Validation and Retry

### Objectives

1. Ensure deterministic and parse-safe output.
2. Minimize malformed response failures.

### Design

1. Route-specific strict schemas:
   1. Reviewer schema.
   2. Quiz schema.
   3. Flashcards schema.
2. Validation layer:
   1. Validate model output before returning.
3. Retry policy:
   1. One targeted repair retry on invalid output.
   2. Fallback to deterministic mode on repeated failure.

### Deliverables

1. Shared validator utilities.
2. Standard retry utility and error taxonomy.
3. Route responses include validation metadata.

### Exit Criteria

1. Invalid JSON incidents drop to near zero.
2. Stable API envelopes maintained.

## Phase 5 - Quality Evaluation and Continuous Improvement

### Objectives

1. Measure output quality continuously.
2. Enable data-driven prompt and pipeline improvements.

### Deliverables

1. Lightweight judge pass scoring:
   1. coverage
   2. clarity
   3. format validity
   4. difficulty consistency (quiz)
2. Human feedback capture points in UI.
3. Quality dashboard metrics for weekly review.

### Exit Criteria

1. Measurable quality improvement against Phase 0 baseline.
2. Stable latency and acceptable cost profile.

## Rollout Strategy

1. Internal-only rollout with flags on reviewer first.
2. Limited user rollout for reviewer.
3. Expand to quiz and flashcards after validation.
4. Full rollout once quality and reliability thresholds are met.

## Reliability and Cost Controls

1. Strict timeout budgets per step.
2. Max token budgets per route.
3. Graceful fallback to deterministic generation mode.
4. Circuit-breaker behavior under repeated provider errors.

## Proposed Acceptance Metrics

1. Schema success rate: at least 99 percent.
2. Retry rate: below 10 percent.
3. User save-or-use action rate increase: target +15 percent.
4. Mean generation latency increase capped within acceptable UX range.

## Open Decisions Needed Before Implementation

1. Which premium model tier to use for final step outputs.
2. Maximum acceptable latency per generation type.
3. Budget cap per 1,000 generations.
4. Default on/off state for each feature flag.

## Implementation Order Recommendation

1. Phase 0
2. Phase 1
3. Phase 2
4. Phase 4 (validator and retry early)
5. Phase 3
6. Phase 5

This order reduces risk by adding validation controls before full multi-step rollout across all generation types.
