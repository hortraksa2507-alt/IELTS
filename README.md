# IELTS Advantage Platform

An AI-powered IELTS preparation platform built on the **IELTS Advantage** methodology. Features a Computer-Delivered IELTS (CD-IELTS) simulator with examiner-grade AI feedback powered by Anthropic Claude.

## Features

### Writing Module
- **Task 2 Essay Blueprint** — Enforced 4-paragraph structure with PEEL framework
- **Coffee Shop Method** — Ideation phase before formal drafting
- **Task 1 Academic/General** — Separate logic paths with tone detection (Friend Rule)
- **Birthday Cake Lexical Analysis** — AI penalizes forced complexity, rewards clarity
- **Live word counter** with spell-check disabled (exam conditions)

### Reading Module
- **Split-screen CD-IELTS layout** — Passage left, questions right, resizable
- **Text highlighting** with color selection
- **T/F/NG and Y/N/NG** diagnostic feedback
- **Matching Headings** strategy support

### Listening Module
- **Single audio playback** (exam condition)
- **Strict word limit enforcement**
- **Exact spelling and capitalization** grading

### Speaking Module
- **PELL Framework** for Parts 1 & 3 (Point, Elaboration, Level Up, Link)
- **5-Heading Strategy** for Part 2 (Introduction, Past, Description, Opinion, Future)
- **1-minute prep timer** with structured scratchpad
- **Speech-to-text** with AI transcript evaluation

### CD-IELTS Simulator
- Countdown timer with final-minute behavior (hides seconds, shows "1 minute remaining")
- Auto-lock on timer expiry
- Disabled browser spell-check in writing areas

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 4, Zustand
- **Backend:** Next.js API Routes, PostgreSQL, Prisma ORM
- **AI:** Anthropic Claude API (claude-sonnet-4-20250514)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Anthropic API key

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and ANTHROPIC_API_KEY

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the platform.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── evaluate-writing/    # AI writing evaluation
│   │   ├── evaluate-speaking/   # AI speaking evaluation
│   │   ├── submissions/         # CRUD for user submissions
│   │   └── mock-tests/          # Mock test management
│   ├── practice/
│   │   ├── reading/             # CD-IELTS reading simulator
│   │   ├── writing/             # Structured writing practice
│   │   ├── listening/           # Single-playback listening
│   │   └── speaking/            # PELL & 5-Heading practice
│   └── dashboard/               # Progress tracking
├── components/simulator/
│   ├── ReadingSimulator.tsx     # Split-screen with highlighting
│   ├── WritingSimulator.tsx     # Spell-check disabled, word counter
│   ├── TestTimer.tsx            # Final-minute behavior
│   └── SpeakingSimulator.tsx    # Part 2 prep & PELL guide
├── lib/
│   ├── ai/evaluator.ts          # Anthropic Claude integration
│   └── prompts/                 # IELTS Advantage evaluation prompts
└── store/
    └── simulator-store.ts       # Zustand state management
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/evaluate-writing` | AI-evaluate writing submissions |
| POST | `/api/evaluate-speaking` | AI-evaluate speaking transcripts |
| GET/POST | `/api/submissions` | Manage user submissions |
| GET/POST | `/api/mock-tests` | List/create mock tests |
| GET | `/api/mock-tests/[id]` | Get specific mock test |

## Pedagogical Rules

See `CLAUDE.md` for the complete IELTS Advantage ruleset that governs all AI evaluation prompts and UI guidance components.

## License

Private — IELTS Advantage Platform
