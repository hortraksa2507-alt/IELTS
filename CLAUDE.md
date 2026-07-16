# IELTS Preparation Platform — Project Contract

This file is the single source of truth for engineering standards and
pedagogical rules. It is written for AI coding agents (Claude Code, Cursor)
and human contributors. Every rule here overrides anything an imported
spec, blog post, or research report says.

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- PostgreSQL via Prisma
- Anthropic API (`@anthropic-ai/sdk`) for writing/speaking evaluation
- Zustand for simulator state

## Grading philosophy (most important section)

1. **Descriptors score; scaffolds coach.** Band scores are assigned per
   criterion (Task Response / Task Achievement, Coherence & Cohesion,
   Lexical Resource, Grammatical Range & Accuracy) against the official
   public IELTS band descriptors. Teaching scaffolds — the 4-paragraph
   essay, PEEL, "overview not conclusion", the 5-heading speaking prep —
   are surfaced as coaching notes and must NEVER automatically lower a
   band. A well-executed 5-paragraph essay can be a Band 9.
2. **Scores are ranges, not points.** A single LLM evaluation is noisy.
   The UI must display the returned `overall.low`–`overall.high` range.
   For high-stakes feedback, use the ensemble evaluator (3 runs, median).
3. **Code counts; the model judges.** Word counts, paragraph counts,
   sentence statistics, and repetition are computed deterministically in
   `lib/ielts/analyze.ts` and passed into the prompt. Never ask the model
   to count words or estimate vocabulary-level percentages — it will
   confabulate the numbers.
4. **Structured output only.** Every evaluation call uses a forced tool
   schema (`tool_choice`), never free-text JSON parsing.
5. **Vocabulary: clarity over complexity.** Reward precise, natural word
   choice. Flag misused high-register or memorised phrases and always
   suggest a clearer alternative — but only penalise Lexical Resource
   when the misuse genuinely shows imprecision, per the descriptors.

## Task rule sets (three, not one)

### Writing Task 2 (Academic & GT) — criterion label: Task Response

- Minimum 250 words; under-length limits Task Response per descriptors.
- Coaching scaffold: intro 40–50 words (paraphrase prompt + clear
  position), two body paragraphs of roughly 80–100 words each (PEEL, one
  central idea, realistic example), conclusion 40–50 words, no new ideas.

### Writing Task 1 Academic — criterion label: Task Achievement

- Minimum 150 words. Factual report only: personal opinion or
  speculation is off-task and does affect Task Achievement.
- An overview of the main trends is required for Band 6 and above.
- Coaching scaffold: Introduction, Overview, Body 1, Body 2. Prefer an
  overview to a conclusion; keep specific figures out of the overview.

### Writing Task 1 General Training — criterion label: Task Achievement

- Minimum 150 words. All three bullet points must be covered.
- Tone is three-way — informal / semi-formal / formal — inferred from
  the recipient AND the situation. A letter to a landlord you know is
  semi-formal. Do NOT implement a binary "friend = informal" switch.
- Coaching scaffold: purpose statement, one paragraph per bullet point,
  sign-off matched to register.

## Receptive skills grading (Reading & Listening)

- Deterministic code, never an LLM.
- **Case-insensitive matching. IELTS does not penalise capitalisation.**
- Spelling is strict; misspelled answers are wrong.
- Every answer key stores accepted alternates
  (`colour|color`, `20|twenty`, `USA|the USA`).
- Enforce word limits exactly ("no more than three words" means three).
- Listening audio plays once. Enforce this server-side with a one-time
  play token, not just in the UI.

## Simulator engineering rules

- **Server-authoritative timing.** Persist `startedAt` + `durationSec`;
  the client only renders the countdown and reconciles on focus/reload.
  Browsers throttle background-tab timers — never trust the client clock.
- Autosave writing submissions every 5–10 seconds. A refresh or crash
  must restore the session exactly.
- Writing text areas: `spellCheck={false}`, `autoCorrect="off"`,
  `autoCapitalize="off"`, with a live word counter.
- Timer UI hides seconds during the final minute (static "1 minute
  remaining"), then locks all inputs at zero.
- Reading: split-screen layout — passage left with independent scroll,
  questions right; highlights and notes persist for the session.

## Content rules

- Never include Cambridge past-paper material or any other copyrighted
  test content. All passages, recordings, and questions must be original
  or licensed, stored via authoring models with difficulty metadata and
  per-question accepted-alternate answer keys.

## Provided modules (do not regress)

- `lib/ielts/analyze.ts` — deterministic text statistics
- `lib/ielts/evaluator.ts` — prompt builder + Anthropic call with forced
  tool schema, per-criterion bands, coaching notes, ensemble helper
- `app/api/evaluate-writing/route.ts` — POST endpoint

Env: `ANTHROPIC_API_KEY` required server-side.
Model: `claude-sonnet-4-6`.
