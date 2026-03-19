# StudyMate AI - System Documentation

## 1. System Overview

StudyMate AI is a Next.js full-stack application that transforms uploaded PDF materials into reviewer summaries, quizzes, and flashcards. It supports a continuous study loop (generate, practice, analyze), analytics, and PDF export of generated results.

## 2. Current End-to-End Workflow

1. User signs in using credentials or Google.
2. User uploads a PDF in Upload module.
3. Backend extracts text using `pdf-parse`; malformed PDF fallback recovery is applied when needed.
4. User selects output type and generates reviewer/quiz/flashcards.
5. User saves output to Results collection.
6. User can directly continue to Quiz Practice or Flashcard Study via save-and-start actions.
7. User can review, edit title, delete, and export saved results.
8. Quiz attempts are tracked to produce average score, total attempts, and latest score insights.

## 3. Architecture

1. Frontend:
   1. Next.js App Router + React.
   2. Tailwind CSS + shadcn UI components.
2. Backend:
   1. Next.js route handlers under `app/api/**`.
   2. Service-layer logic in `lib/services/**`.
3. Database:
   1. MongoDB Atlas.
   2. Mongoose models (`User`, `Pdf`, `Result`).
4. Authentication:
   1. NextAuth JWT session strategy.
   2. Route protection via `proxy.ts` matcher.
5. AI/Generation:
   1. Reviewer route integrates OpenAI.
   2. Quiz and flashcards use deterministic generation logic.
6. API Patterns:
   1. Standardized envelopes via `lib/api/response.ts`.
   2. Shared auth user-id resolution via `lib/auth/user-id.ts`.
   3. Optional shared client wrapper via `lib/api/client.ts`.

## 4. Modules

1. Authentication Module
   1. Register API.
   2. NextAuth login providers.
2. Upload & PDF Module
   1. Upload endpoint with extraction fallback handling.
   2. PDF library list/get endpoints.
   3. View dialog preview and reuse action in UI.
3. Generation Module
   1. Reviewer generation endpoint (AI + fallback behaviors).
   2. Quiz generation endpoint (difficulty/item count/type/context hint).
   3. Flashcard generation endpoint.
4. Results Module
   1. Save/list/get/update/delete endpoints.
   2. Practice mode integration.
   3. Export-to-PDF with branded layout and pagination.
5. Analytics Module
   1. Per-user usage aggregation.
   2. Recent activity summary.

## 5. Data Model Summary

1. `User`
   1. `firstName`, `lastName`, `email`, `password`, `image`, `role`, timestamps.
2. `Pdf`
   1. `userId`, `fileName`, `mimeType`, `size`, `extractedText`, `extractionStatus`, `extractionError`, timestamps.
3. `Result`
   1. `userId`, `title`, `type` (`reviewer|quiz|flashcards`), `sourcePdfId`, `content`, timestamps.
4. `Analytics`
   1. `userId`, `eventType`, `resultId`, `sourcePdfId`, `score`, `totalQuestions`, `percentage`, timestamps.

## 6. API Surface (Current)

1. Auth:
   1. `POST /api/auth/register`
   2. `GET|POST /api/auth/[...nextauth]`
2. PDF:
   1. `POST /api/pdf/upload`
   2. `GET /api/pdf/list`
   3. `GET /api/pdf/get/[id]`
3. AI:
   1. `POST /api/ai/generate`
   2. `POST /api/ai/quiz`
   3. `POST /api/ai/flashcards`
4. Results:
   1. `POST /api/results`
   2. `GET /api/results/list`
   3. `GET /api/results/get/[id]`
   4. `PATCH /api/results/update/[id]`
   5. `DELETE /api/results/delete/[id]`
5. Analytics:
   1. `GET /api/analytics/track`
   2. `POST /api/analytics/track` (quiz attempt event ingestion)

## 7. Notes on Reliability and Quality

1. Result export avoids DOM screenshot parsing issues by using structured text-to-PDF generation.
2. API routes are being standardized around service-layer and envelope patterns to improve maintainability.
3. Protected route coverage includes quiz and study paths.
4. Reviewer generation fallback behavior:
   1. If AI is unavailable or quota-limited, the system returns simplified keyword/sentence-based reviewer output.
   2. The response is surfaced to users as limited/fallback generation mode.

## 8. Limitations

1. AI output quality depends on input text quality.
2. Very large PDFs may require chunking and staged processing as future enhancement.
3. Offline mode is not supported.
4. Full request rate limiting is currently documented as a requirement; additional enforcement hardening is planned.
