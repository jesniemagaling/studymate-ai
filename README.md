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
- AI-powered study material generation using OpenAI
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
- **OpenAI API** – AI-generated study content
- **pdf-parse** – Server-side PDF text extraction
- **Node.js** – Runtime environment

---

## Getting Started

### Prerequisites

- Node.js v18 or later 
- npm or yarn  
- MongoDB Atlas account
- OpenAI API key
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
