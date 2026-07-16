# Building the Rest with Claude Code (Real Commands)

The research report's command sequence used commands that don't exist
(`/task-start`, `/go`). This is the workflow that actually works.

## Setup

1. Node 18+ and git installed.
2. `npm install -g @anthropic-ai/claude-code`
3. `cd` into your repo (this kit's files already in place, `CLAUDE.md`
   at the root) and run `claude`.

Claude Code reads `CLAUDE.md` automatically at session start — that file
is the pedagogy/engineering contract, so keep it at the repo root.

## The plan → approve → execute loop

There is no `/task-start`. Plan mode itself is the gate:

1. Enter plan mode: press **Shift+Tab** (cycles modes) or use `/plan`.
2. Paste one of the phase prompts below as a normal message.
3. Claude Code researches the repo and presents a plan. Nothing is
   edited yet.
4. **Approving the plan is what starts execution.** Review it carefully
   first — cheaper to fix a plan than code.
5. After changes: `/diff` to review, `/code-review` before committing,
   `/compact` when a long session gets sluggish.

Note: exact command availability varies by Claude Code version — type
`/` to see what your build exposes.

## Phase prompts (revised from the report)

### Phase A — Database schema

> Design a Prisma/PostgreSQL schema for this IELTS platform. Include:
> User (target band, test type), MockTest (academic/general),
> Submission (raw text or audio ref, startedAt, durationSec for
> server-authoritative timing, autosave versions, final word count),
> Evaluation (per-criterion bands, overall low/high range, coachingNotes
> JSON, model + prompt version for auditability), and a full content
> authoring layer: Passage, AudioClip, Question, and AnswerKey with an
> acceptedAlternates string array per answer. Follow every rule in
> CLAUDE.md, especially "Receptive skills grading" and "Content rules".

### Phase B — Simulator UI

> Build ReadingSimulator (split screen, independent passage scroll,
> highlighting), WritingSimulator (spellcheck disabled, live word
> counter via Zustand, autosave every 5–10s), and TestTimer. The timer
> must be server-authoritative per CLAUDE.md: render from startedAt +
> durationSec, reconcile on focus/reload, hide seconds in the final
> minute, lock inputs at zero.

### Phase C — Wire in the evaluator

> lib/ielts/analyze.ts, lib/ielts/evaluator.ts, and
> app/api/evaluate-writing/route.ts already exist and are correct — do
> not rewrite their grading logic. Build the results UI: per-criterion
> band cards with evidence quotes, the overall range (never a single
> number), coaching notes visually separated from scores, and the three
> topFixes. Add a Prisma persistence call in the route.

### Phase D — Performance pass

> Audit frontend loading performance. Prioritise time-to-interactive for
> ReadingSimulator; remove unused CSS and redundant imports.

## Using Cursor instead

The same `CLAUDE.md` works as agent rules in Cursor — reference it from
`.cursor/rules` or an `AGENTS.md`, and reuse the phase prompts verbatim.

## Before shipping the evaluator

- Set `ANTHROPIC_API_KEY` in env (Vercel project settings).
- Calibrate: run officially scored sample essays through
  `evaluateWritingEnsemble` and compare bands. Adjust prompt anchors if
  it skews lenient (LLM graders usually do).
- Show users the range, with a note that only IELTS can issue real bands.
