# StudyMate AI - Business Requirements Document (BRD)

## 1. Introduction

StudyMate AI is a web-based learning platform that converts uploaded PDF study materials into structured resources (reviewers, quizzes, and flashcards). The system reduces preparation time, improves recall practice, and helps learners revisit saved outputs.

## 2. Business Objectives

1. Reduce student time spent manually creating study aids.
2. Provide guided, repeatable study workflows from upload to practice.
3. Support active recall through quiz and flashcard practice modes.
4. Preserve generated outputs for later review and export.
5. Provide usage insights to monitor learner activity.

## 3. Target Users

1. College students.
2. Senior high school students.
3. Independent/self-directed learners.

## 4. In-Scope Features (Current)

1. Authentication (email/password + Google sign-in).
2. Protected learning routes (`/home`, `/upload`, `/library`, `/generate`, `/results`, `/quiz`, `/study`).
3. PDF upload, extraction, fallback recovery for malformed files, and manual text mode.
4. Content generation:
   1. Reviewer generation (AI-powered, with fallback behavior).
   2. Quiz generation (difficulty, item count, question type, context hints).
   3. Flashcard generation.
5. Result management:
   1. Save reviewer/quiz/flashcards.
   2. List, get, update title, and delete saved results.
6. Practice experiences:
   1. Quiz practice with progress and scoring.
   2. Flashcard study mode with card flipping.
7. Direct actions after generation:
   1. Save & Start Quiz.
   2. Save & Start Study.
8. PDF export for saved results with branded header/footer and page numbering.
9. Analytics summary dashboard (uploads, generated content counts, latest activity).

## 5. Functional Requirements

1. Users must be able to register and authenticate.
2. The system must allow authenticated users to upload PDFs.
3. The system must extract text from PDFs and provide fallback/manual handling when extraction fails.
4. Users must be able to generate reviewer, quiz, and flashcard outputs from extracted/manual text.
5. Users must be able to save generated outputs and retrieve them later.
6. Users must be able to practice saved quiz and flashcard outputs.
7. Users must be able to update result titles, delete results, and export results to PDF.
8. Users must be able to view basic analytics for their own activity.

## 6. Non-Functional Requirements

1. Performance: PDF processing and generation endpoints should respond within practical interactive latency for study workflows.
2. Security: Endpoints and routes must enforce user authentication and user-level data isolation.
3. Reliability: Saved PDFs/results must remain retrievable and editable per user.
4. Usability: Dashboard modules must use consistent UI patterns for loading, empty states, and actions.
5. Maintainability: Service-layer route design and standardized API envelopes should be used to reduce duplication.
