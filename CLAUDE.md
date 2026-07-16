# IELTS Advantage Platform

## Project Overview

This project is an elite web-based IELTS preparation platform built using Next.js (App Router), TypeScript, Tailwind CSS, and PostgreSQL (via Prisma). The application functions as a highly accurate Computer-Delivered IELTS (CD-IELTS) simulator and an AI-powered grading platform based strictly on the "IELTS Advantage" methodology developed by Chris Pell.

## Technical Architecture & Stack

- **Frontend:** Next.js (React), Tailwind CSS, Zustand (for complex simulator state management including timers and split-screens).
- **Backend:** Next.js API Routes, PostgreSQL, Prisma ORM.
- **AI Integration:** Anthropic Claude API for evaluating user essays and speaking transcripts via the official SDK.

## Pedagogical Logic (The "IELTS Advantage" Ruleset)

When building backend evaluation prompts or frontend guidance components, you MUST adhere to these non-negotiable rules:

1. **Writing Task 2 Structure:** Essays require exactly 4 paragraphs (Introduction, Body 1, Body 2, Conclusion). Body paragraphs must follow the PEEL framework (Point, Explain, Example, Link).
2. **Writing Task 1 Academic:** Reports require 4 paragraphs (Introduction, Overview, Body 1, Body 2). There must be NO CONCLUSION and NO OPINIONS. The overview summarizes main trends without specific data.
3. **Writing Task 1 General:** Letters require 5 paragraphs (Purpose, Bullet 1, Bullet 2, Bullet 3, Sign-off). Tone is dictated by the prompt (informal if to a "friend", formal otherwise).
4. **Vocabulary Evaluation (Birthday Cake Strategy):** The AI evaluator must reward simple, accurate language (A1-B2) forming 90% of the essay. It must heavily penalize forced, inaccurate complex words (C1/C2). Clarity beats complexity.
5. **Speaking Part 2 Strategy:** The UI must provide a 1-minute prep timer with a digital scratchpad locked to 5 required headings: Introduction, Past, Description, Opinion, Future.
6. **CD-IELTS Simulator Constraints:**
   - Reading modules MUST have a responsive split-screen layout (passage left, questions right).
   - Writing modules MUST have a live word counter but MUST disable all browser spell-checking (`spellcheck="false"`).
   - Timers must hide seconds during the final minute of the test.

## Coding Standards

- Use TypeScript strict mode throughout.
- Prefer server components for data fetching; client components only when interactivity is required.
- Keep evaluation prompts in dedicated files under `src/lib/prompts/`.
- All band score feedback must map to the four official IELTS criteria.
