# StudyMate AI

**StudyMate AI** is an AI-powered study companion built using Next.js, TypeScript, and Tailwind CSS.
It was developed as a learning and capstone-style project to explore full-stack web development, authentication, database integration, and AI-powered features using modern web technologies.
The project focuses on transforming PDF study materials into useful learning tools such as reviewers, quizzes, and flashcards.

---

## Overview

This project was built to deepen knowledge in modern full-stack development using Next.js and AI integration.
With StudyMate AI, users can:

1. Upload PDF study materials
2. Extract text from uploaded PDFs
3. Generate AI-powered reviewers, quizzes, and flashcards
4. Save and reuse uploaded PDFs
5. View generated study results
6. Track basic usage analytics

It is a hands-on, intermediate-level project that demonstrates real-world application architecture, secure authentication, and AI-assisted learning features in a clean and modern UI.

---

## Key Features

- User authentication with Email & Google OAuth
- Secure dashboard with protected routes
- PDF upload and text extraction
- AI-powered study material generation with deterministic and optional local LLM providers
- Personal PDF library per user
- Saved AI-generated results
- Basic analytics dashboard
- Responsive and modern UI using Tailwind CSS
- Modular and scalable project structure with Next.js App Router

---

## Tech Stack

- **Next.js** – Full-stack React framework (App Router)
- **TypeScript** – Type-safe development
- **Tailwind CSS** – Utility-first styling for responsive design
- **MongoDB + Mongoose** – Database and data modeling
- **NextAuth.js** – Authentication and session management
- **OpenAI API (optional)** - Paid-provider adapter, disabled by default
- **Local LLM via Ollama (optional)** - Zero-subscription local generation mode
- **pdf-parse** – Server-side PDF text extraction
- **Node.js** – Runtime environment

---

## Getting Started

### Prerequisites

- Node.js v18 or later
- npm or yarn
- MongoDB Atlas account
- OpenAI API key (optional; only needed when explicitly enabling paid providers)
- Code editor (VS Code recommended)

---

### Installation

```bash
# Clone this repository
git clone https://github.com/jesniemagaling/studymate-ai.git

# Go into the project folder
cd studymate-ai

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Testing

This project uses a modern test stack:

- `Vitest` for unit and integration tests
- `Playwright` for end-to-end smoke tests

Run tests locally:

```bash
# Unit + integration
npm run test

# Coverage report
npm run test:coverage

# E2E tests
npm run test:e2e
```

CI workflows:

- `.github/workflows/ci.yml` runs lint, tests, and build on push/PR
- `.github/workflows/e2e.yml` runs Playwright tests manually via workflow dispatch

## Auth Security Setup

StudyMate AI now supports:

- Cloudflare Turnstile bot protection for login and registration code requests
- Email verification code before account creation

Set these variables in `.env.local`:

```bash
# Core auth and database
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-long-random-secret
MONGODB_URI=your-mongodb-uri

# Cloudflare Turnstile
TURNSTILE_ENABLED=true
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your-turnstile-site-key
TURNSTILE_SECRET_KEY=your-turnstile-secret-key

# SMTP mail delivery for registration verification code
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
SMTP_FROM="StudyMate AI <no-reply@yourdomain.com>"
```

Notes:

- If `TURNSTILE_ENABLED=false`, server-side Turnstile checks are bypassed.
- Registration requires a valid email code sent through SMTP before creating an account.

## AI Provider Modes

The generation pipeline supports a structured provider interface with safe defaults:

- `deterministic` (default): zero-cost rule-based generation
- `local-first`: use local model first (for example, Ollama), then fallback to deterministic
- `openai`: available only when explicitly enabled and paid providers are allowed

Environment flags:

```bash
AI_PIPELINE_VERSION=v2-free-local
AI_PROVIDER_MODE=deterministic
AI_ENABLE_LOCAL_PROVIDER=false
AI_LOCAL_BASE_URL=http://127.0.0.1:11434
AI_LOCAL_MODEL=llama3.1:8b
AI_LOCAL_TIMEOUT_MS=12000

# Hard safety switch: keep false to prevent paid API charges
AI_ALLOW_PAID_PROVIDERS=false

# Must also be true to use OpenAI adapter
AI_ENABLE_OPENAI_ADAPTER=false
```

With the default values above, the app never incurs OpenAI token charges.

### Default Admin Bootstrap

For first-time setup, the app can auto-create a default admin account during credentials login flow.

Default values:

```bash
DEFAULT_ADMIN_ENABLED=true
DEFAULT_ADMIN_EMAIL=admin@studymate.local
DEFAULT_ADMIN_PASSWORD=admin12345
DEFAULT_ADMIN_FIRST_NAME=System
DEFAULT_ADMIN_LAST_NAME=Admin
```

You can override these in `.env.local`.
