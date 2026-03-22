# StudyMate AI User Manual

## 1. Purpose

This manual explains how to use StudyMate AI from account sign-in to generating, saving, and reviewing study materials.

StudyMate AI helps you transform PDF study files into:

- Reviewer summaries
- Quizzes
- Flashcards

It also provides:

- A personal PDF library
- Saved results history
- Quiz practice mode
- Flashcard study mode
- Optional AI settings page for authorized users

## 2. Who This Is For

- Students who want to generate study materials from notes or PDFs
- Users who want to practice quizzes and flashcards in one place
- Admin or advanced users who can access AI Settings

## 3. Access and Sign-In

### 3.1 Login

Path: `/login`

You can log in with:

- Email + password
- Google sign-in

If bot protection is enabled, complete the Turnstile challenge before login.

Common login messages:

- `Please enter email and password`
- `Please complete the bot verification request.`
- `Invalid email or password`
- `Bot verification failed. Please try again.`

### 3.2 Register with Email Verification

Path: `/register`

Registration flow:

1. Enter first name, last name, and email.
2. Complete Turnstile (if enabled).
3. Click `Send verification code`.
4. Check email inbox and copy the 6-digit code.
5. Enter verification code and password.
6. Click `Register`.

Important rules:

- Code resend has cooldown (about 60 seconds).
- Verification code expires (about 10 minutes).
- If email is changed after code is sent, request a new code.

Common registration messages:

- `All fields are required`
- `Please request and verify your email code first.`
- `Email changed. Please request a new verification code.`
- `Verification code is missing or expired. Please request a new code.`
- `Invalid verification code`

## 4. Navigation Overview

After login, the top navigation includes:

- Home
- Upload
- Library
- Generate
- Results
- Settings (only if your account can edit AI settings)

You can also:

- Toggle light/dark theme
- Log out

## 5. Home Module

Path: `/home`

Home gives a dashboard summary of your activity, including:

- PDFs uploaded
- Reviewers generated
- Quizzes generated
- Flashcards generated
- Quiz performance snapshot
- Recent activity feed
- AI status indicator

Use Home to quickly check progress and jump to core actions.

## 6. Generate Module

Path: `/generate`

Generate is a quick launcher. Choose one mode:

- Reviewer
- Quiz
- Flashcards

Selecting a mode redirects to Upload with the mode pre-selected.

Recommended use:

- Start here if you already know which material type to create.

## 7. Upload Module (Core Workflow)

Path: `/upload`

This is the main creation workspace.

### 7.1 Upload and Text Extraction

1. Click upload area and select a PDF.
2. Click `Upload & Extract Text`.
3. Wait for extraction to complete.

Possible outcomes:

- Success: extracted text appears.
- Fallback: recovered text is loaded with warning.
- Manual mode: extraction failed, paste text manually.

### 7.2 Choose Material Type

After text is available, choose:

- Reviewer
- Quiz
- Flashcards

### 7.3 Generate Reviewer

1. Select Reviewer.
2. Click `Generate Reviewer`.
3. Review output.
4. Optional: set a custom title.
5. Click `Save Result`.

### 7.4 Generate Quiz

1. Select Quiz.
2. Configure:
   - Question type: Multiple Choice or Fill in the Blank
   - Difficulty: Easy, Medium, Hard
   - Number of items
3. Click `Generate ... Quiz`.
4. Optional: set a custom title.
5. Choose one:
   - `Save Result`
   - `Save & Start Quiz`

### 7.5 Generate Flashcards

1. Select Flashcards.
2. Click `Generate Flashcards`.
3. Optional: set a custom title.
4. Choose one:
   - `Save Result`
   - `Save & Start Study`

### 7.6 Upload Module Tips

- Use clear, content-rich text for better quiz quality.
- For scanned PDFs with poor extraction, paste clean manual text.
- Save outputs before leaving the page if you want to keep them.

## 8. Library Module

Path: `/library`

Library stores uploaded PDFs for reuse.

Features:

- View file name, size, preview text, and upload date
- Open full text preview dialog
- Reuse any PDF directly in Upload module

Actions:

- `View` opens extracted text preview
- `Use This PDF` opens Upload with selected file context

Status indicators:

- `fallback`: recovered text from malformed PDF
- `failed`: extraction failed; manual text mode available

## 9. Results Module

Path: `/results`

Results lists all saved outputs (reviewer, quiz, flashcards).

Each card shows:

- Title
- Type
- Save date
- `View` action

Use this page to revisit, manage, and continue studying old outputs.

## 10. Result Detail Module

Path: `/results/[id]`

This page provides detailed result management.

Available actions:

- Edit title and save update
- Copy content to clipboard
- Export content as PDF
- Delete result (with confirmation dialog)
- Start study/practice flow depending on content type

Export behavior:

- Reviewer: summary + key points
- Quiz: questions, options, answers, hints
- Flashcards: front and back card text

## 11. Quiz Practice Mode

Path: `/quiz/[id]`

Quiz mode is launched after saving quiz or from Results.

How it works:

1. Answer one question at a time.
2. For multiple choice, select an option.
3. For fill-in-the-blank, type your answer.
4. Submit answer to proceed.
5. At end, view score summary.

Notes:

- Answers are matched case-insensitively.
- Quiz attempt analytics are tracked automatically.

## 12. Flashcard Study Mode

Path: `/study/[id]`

How it works:

1. Open saved flashcards.
2. Click a card to flip and reveal answer.
3. Click again to flip back.
4. Use reset action to clear flipped state.

Best practice:

- Use active recall: try answering before flipping.

## 13. Settings Module (Authorized Users)

Path: `/settings`

Only visible to accounts with permission.

Purpose:

- View AI provider health
- Adjust AI pipeline mode
- Configure allowed provider controls (depending on environment lock)
- Review configuration audit entries

If you cannot see Settings in navbar, your account likely does not have edit access.

## 14. Error and Troubleshooting Guide

### 14.1 Verification Code Not Sent

Check:

- SMTP credentials are correct
- Sender is verified in email provider
- Provider account is activated for SMTP sending
- Turnstile token is completed when required

### 14.2 Bot Verification Failures

Check:

- Turnstile site key and secret key values
- Allowed domain in Turnstile dashboard
- Browser extensions causing challenge issues

### 14.3 PDF Extraction Problems

If extraction fails:

- Use manual text mode in Upload
- Clean pasted text before generating outputs
- Try another PDF copy if file is malformed

### 14.4 Result Not Loading

Check:

- Session is active
- Result still exists
- Network/API response status

### 14.5 Quiz/Flashcard Practice Empty

This happens when:

- Result type mismatch (non-quiz in quiz route, etc.)
- Saved content is missing or invalid

Fix:

- Return to Results and open the correct saved item

## 15. Recommended End-to-End User Workflow

1. Register and verify email.
2. Log in.
3. Upload a PDF.
4. Generate reviewer, quiz, and flashcards.
5. Save each output.
6. Open Results and verify all saved entries.
7. Start Quiz practice.
8. Start Flashcard study.
9. Export important results as PDF.

## 16. Security and Privacy Notes for Users

- Do not share verification codes.
- Use strong unique passwords.
- Log out on shared devices.
- Avoid uploading sensitive confidential documents unless your deployment policies permit it.

## 17. Quick FAQ

### Q: Can I use a previously uploaded PDF without re-uploading?

Yes. Open Library and click `Use This PDF`.

### Q: Why can I not request another verification code immediately?

There is an anti-abuse cooldown before resend is allowed.

### Q: Why is Settings not visible in my account?

Settings only appears for users with edit access to AI configuration.

### Q: Can I export generated results?

Yes. Open a result detail and use the export action to generate PDF.

---

Last updated: 2026-03-21
