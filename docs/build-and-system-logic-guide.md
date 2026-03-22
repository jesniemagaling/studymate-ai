# StudyMate AI Build and System Logic Guide

## 1. Why This Document Exists

This guide is a deep technical walkthrough of how StudyMate AI is built.

Use it to study:

- How the app boots and builds
- How requests move through frontend and backend layers
- How authentication and security are enforced
- How PDF upload and AI generation are implemented
- How data is validated, normalized, and persisted
- How to reason about extending the codebase safely

## 2. Mental Model of the App

StudyMate AI is a full-stack Next.js App Router application with a route-handler backend.

Core loop:

1. User authenticates.
2. User uploads a PDF.
3. Backend extracts text with fallback handling.
4. AI pipeline generates reviewer, quiz, or flashcards.
5. User saves generated output into Results.
6. User revisits Results for review, quiz practice, flashcard study, copy/export/delete.
7. Analytics track quiz attempts for dashboard insights.

## 3. Build and Runtime Basics

### 3.1 Scripts and build pipeline

From package scripts:

- dev: local server with hot reload
- build: production build
- start: run production build
- lint: ESLint checks
- test: Vitest unit and integration tests
- test:e2e: Playwright end-to-end tests

Build behavior:

1. Next compiles App Router pages and route handlers.
2. TypeScript checks type safety.
3. Static routes are pre-rendered where possible.
4. Dynamic routes and API handlers stay server-rendered on demand.

### 3.2 Runtime architecture

At runtime, the app has these execution zones:

- Client components for interactive UI pages
- Server route handlers in app/api for backend logic
- Database layer through Mongoose models and shared connection helper
- Auth/session layer using NextAuth JWT tokens

## 4. Folder and Layer Structure

High-level layered structure:

- app: page routes and API route handlers
- components: reusable UI and layout modules
- lib: business logic, services, helpers, validation, providers
- models: Mongoose schemas
- types: shared TypeScript types
- docs: project documentation
- tests: unit, integration, and E2E tests

Architecture by responsibility:

1. Presentation layer

- app/(auth) pages
- app/(dashboard) pages
- components/ui and components/layout

2. API/controller layer

- app/api/\*\* route.ts files

3. Service/domain layer

- lib/services/\*\*
- lib/ai/\*\*
- lib/results/\*\*
- lib/validation/\*\*

4. Data access layer

- models/\*\*
- lib/db.ts

## 5. Request Lifecycle Patterns

## 5.1 Protected API pattern

Most authenticated APIs follow this structure:

1. Resolve user from JWT token via getUserIdFromRequest.
2. Return 401 if no authenticated user.
3. Validate payload.
4. Call service function.
5. Return apiSuccess or apiError envelope.

Key files:

- lib/auth/user-id.ts
- lib/api/response.ts
- app/api/results/route.ts
- app/api/ai/\*/route.ts

## 5.2 Protected page access

Route protection is centralized in proxy.ts (Next.js proxy middleware pattern).

Protected route matcher includes:

- /home
- /upload
- /library
- /generate
- /results
- /quiz
- /study
- /settings

If token is missing, user is redirected to /login.

## 6. Authentication and Security Logic

### 6.1 Login

Credentials login flow:

1. User submits email, password, turnstile token.
2. Turnstile verification happens server-side.
3. DB connection and default admin bootstrap run.
4. Password compared using bcrypt.
5. Legacy plaintext password records are auto-rehashed on successful login.

Google OAuth flow:

- Uses NextAuth Google provider
- Redirect callback is hardened to same-origin + safe fallback to /home

### 6.2 Registration with verification code

Send code route:

1. Validate email format.
2. Verify Turnstile token.
3. Reject if email already exists.
4. Enforce resend cooldown.
5. Generate 6-digit code and hash with bcrypt.
6. Store code with expiration and attempts.
7. Send email via SMTP.

Register route:

1. Validate required fields.
2. Check latest unused, unexpired code.
3. Compare entered code against stored hash.
4. Increment attempts on failure; lock record after limit.
5. Hash password and create user.

Security building blocks:

- Cloudflare Turnstile server verification
- Hashed code storage (never store raw code)
- Expiring code records with TTL index
- JWT session with protected route guard

## 7. Database Connection and Resilience

DB helper in lib/db.ts:

1. Uses global cached promise/connection to avoid hot-reload reconnection storms.
2. Tries MONGODB_URI first (SRV).
3. Falls back to MONGODB_URI_DIRECT on failure.
4. Detects DNS lookup failures and returns clear diagnostic messages.

This pattern is important for local dev stability and cloud environment reliability.

## 8. PDF Upload and Extraction Logic

Main route: app/api/pdf/upload/route.ts

Flow:

1. Validate session user.
2. Parse multipart form-data and file.
3. Enforce PDF MIME type.
4. Pass binary buffer to processPdfUpload.

Service: lib/services/pdf-upload.ts

Logic branches:

- Success branch:
  - extractTextFromPDF succeeds
  - store Pdf with extractionStatus=success

- Fallback branch:
  - parser throws MALFORMED_PDF or EMPTY_TEXT
  - fallback extractor attempts object-level text recovery
  - if fallback text exists: extractionStatus=fallback

- Failed branch:
  - fallback still empty
  - store Pdf with extractionStatus=failed
  - UI switches to manual text mode

Parser implementation details in lib/pdf.ts:

- Uses pdf-parse primary pass
- Sanitizes buffers when bytes precede PDF header
- Applies malformed recovery using literal text extraction from PDF objects

## 9. AI Pipeline and Provider Fallback Design

Core service: lib/ai/service.ts

Design goals:

- Unified generation API for reviewer, quiz, flashcards
- Config-driven provider selection
- Automatic fallback across providers
- Structured telemetry in responses

### 9.1 Context preparation

lib/ai/pipeline.ts does:

1. Normalize and sanitize input text.
2. Chunk text with overlap.
3. Score chunks by mode-specific keywords.
4. Select top chunks up to configured max.
5. Build contextText for provider input.

### 9.2 Provider selection

Provider order is resolved by:

- lib/ai/config.ts for env/runtime flags
- lib/ai/runtime-settings.ts for DB-stored overrides
- lib/ai/provider-plan.ts for final fallback order

Provider map:

- deterministic provider (always available baseline)
- local-ollama provider (optional local model)
- openai provider (optional paid path)

### 9.3 Fallback execution

runWithFallback loops provider order:

1. Try provider A.
2. On failure, increment retryCount.
3. Continue until success.
4. Return telemetry: mode, pipeline version, provider, retry count.

If all providers fail, error bubbles to route handler.

### 9.4 Deterministic provider logic

- Reviewer: sentence extraction and key-point formatting
- Quiz: generated from sentence-based keyword logic plus distractor templates
- Flashcards: keyword extraction and front/back construction

This gives predictable, zero-cost generation even without external AI services.

## 10. Result Save, Validation, and Normalization

### 10.1 Save contract

Result save route delegates to saveResultForUser.

Validation schema in lib/validation/result.ts enforces:

- Discriminated union by type: reviewer | quiz | flashcards
- Type-specific content shape
- Quiz-specific constraints:
  - MCQ needs at least 2 options
  - answer must exist in options for MCQ
  - fill_in_blank bypasses options-match rule

### 10.2 Read normalization and migration

lib/results/normalize.ts supports legacy and current formats.

When reading stored results:

1. Normalize raw shape into current StudyResult shape.
2. Sanitize text fields.
3. Detect if legacy schema was used.
4. Optionally migrate stored document to current format.

This prevents old saved data from breaking newer UI logic.

## 11. Module-by-Module Code Logic

### 11.1 Home

- Fetches analytics summary from /api/analytics/track GET
- Renders metrics, recent activity, status cards, and quiz snapshot bars

### 11.2 Upload

- Handles file upload and text extraction states
- Supports manual text mode
- Drives generation calls for reviewer/quiz/flashcards
- Saves and optionally routes to immediate practice mode

### 11.3 Generate

- Lightweight launcher that deep-links into Upload with mode query

### 11.4 Library

- Lists user PDFs
- Opens preview dialog for extracted text
- Sends selected PDF to Upload using query param

### 11.5 Results and Result Detail

- Results list page fetches saved outputs
- Detail page supports:
  - title update
  - copy
  - PDF export
  - delete with confirmation
  - jump-to-practice flows

### 11.6 Quiz mode

- Loads quiz from saved result by id
- Handles MCQ and fill-in-blank input logic
- Tracks quiz attempt analytics on completion

### 11.7 Study mode

- Loads flashcards and handles flip/reset interactions

### 11.8 Settings

- Admin-only or allowlisted access
- Reads/writes runtime AI settings
- Shows local provider health
- Logs settings changes to audit model

## 12. API Catalog by Domain

Auth:

- /api/auth/[...nextauth]
- /api/auth/register
- /api/auth/register/send-code

PDF:

- /api/pdf/upload
- /api/pdf/list
- /api/pdf/get/[id]

AI:

- /api/ai/generate
- /api/ai/quiz
- /api/ai/flashcards
- /api/ai/health
- /api/ai/settings

Results:

- /api/results
- /api/results/list
- /api/results/get/[id]
- /api/results/update/[id]
- /api/results/delete/[id]

Analytics:

- /api/analytics/track (POST quiz_attempt, GET summary)

## 13. Data Models

Important models and roles:

- User: identity, auth fields, role
- EmailVerificationCode: hashed code, expiry, attempts, used state
- Pdf: extracted text and extraction status metadata
- Result: saved generated study outputs
- Analytics: quiz attempt records and score percentages
- AiSettings: runtime AI mode toggles
- AiSettingsAudit: settings change history

## 14. Error Handling Strategy

Patterns used:

1. Central response envelope (apiSuccess/apiError) for many routes
2. Validation errors mapped to 400
3. Unauthorized mapped to 401
4. Domain not found mapped to 404
5. Unknown/internal exceptions mapped to 500
6. UI toasts surface clear user-readable messages

Notable resilience choices:

- PDF extraction fallback for malformed files
- AI provider fallback chain
- DB URI direct fallback when SRV lookup fails
- Legacy result normalization at read time

## 15. Testing and Quality Gates

Current quality stack:

- ESLint for static analysis
- Vitest for unit and integration tests
- Playwright for E2E smoke tests

Recommended gate before deploy:

1. npm run lint
2. npm run test
3. npm run build
4. Manual smoke test for auth, upload, generate, save, results, quiz/study

## 16. How to Study This Codebase Efficiently

Suggested reading order:

1. app/layout.tsx and proxy.ts
2. app/(auth) pages and app/api/auth routes
3. app/(dashboard)/upload page + app/api/pdf/upload + lib/services/pdf-upload + lib/pdf
4. app/api/ai routes + lib/ai/service + lib/ai/pipeline + providers
5. app/api/results routes + lib/services/results + lib/validation/result + lib/results/normalize
6. app/(dashboard)/results pages + ResultRenderer
7. app/api/analytics/track + home dashboard page
8. app/(dashboard)/settings + app/api/ai/settings + lib/ai/runtime-settings

Practical study exercises:

- Trace a single Upload-to-Save request end-to-end and write your own sequence notes.
- Add one new analytics event and show it on Home.
- Add one new quiz difficulty rule in deterministic generator.
- Implement forgot-password using the same verification-code architecture.

## 17. Extension Blueprint: Forgot Password (Recommended Next)

Reuse existing verification components:

1. Add send-reset-code route using EmailVerificationCode model.
2. Add reset-password route with code validation and bcrypt rehash.
3. Add client page with two-step flow (request code, set new password).
4. Keep generic responses to prevent account enumeration.
5. Apply Turnstile and cooldown/rate controls.

## 18. Reference Files

Core runtime:

- package.json
- app/layout.tsx
- proxy.ts

Auth/security:

- app/api/auth/[...nextauth]/route.ts
- app/api/auth/register/send-code/route.ts
- app/api/auth/register/route.ts
- lib/security/turnstile.ts
- lib/email/mailer.ts

PDF:

- app/api/pdf/upload/route.ts
- lib/services/pdf-upload.ts
- lib/pdf.ts

AI:

- app/api/ai/generate/route.ts
- app/api/ai/quiz/route.ts
- app/api/ai/flashcards/route.ts
- lib/ai/service.ts
- lib/ai/pipeline.ts
- lib/ai/runtime-settings.ts
- lib/ai/providers/deterministic.ts
- lib/ai/providers/local-ollama.ts
- lib/ai/providers/openai.ts

Results/data:

- app/api/results/route.ts
- lib/results/save-result.ts
- lib/services/results.ts
- lib/validation/result.ts
- lib/results/normalize.ts
- models/Result.ts

Analytics:

- app/api/analytics/track/route.ts
- models/Analytics.ts

---

Last updated: 2026-03-22
