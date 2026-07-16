import Anthropic from "@anthropic-ai/sdk";
import { analyzeWriting } from "./analyze";
import type {
  BandRange,
  CriterionScore,
  EvaluateWritingInput,
  WritingEvaluation,
  WritingTaskType,
} from "./types";

export const EVALUATOR_MODEL = "claude-sonnet-4-6";
export const PROMPT_VERSION = "2026-07-16-v2";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const EVALUATION_TOOL = {
  name: "submit_writing_evaluation",
  description:
    "Submit an IELTS writing evaluation with per-criterion band ranges, evidence quotes, coaching notes separate from scores, and exactly three top fixes.",
  input_schema: {
    type: "object" as const,
    properties: {
      taskCriterion: {
        type: "object",
        description: "Task Response (Task 2) or Task Achievement (Task 1)",
        properties: {
          low: { type: "number", description: "Band low (0-9, 0.5 steps)" },
          high: { type: "number", description: "Band high (0-9, 0.5 steps)" },
          feedback: { type: "string" },
          evidenceQuotes: {
            type: "array",
            items: { type: "string" },
            description: "Direct quotes from the submission supporting the band",
          },
        },
        required: ["low", "high", "feedback", "evidenceQuotes"],
      },
      coherenceCohesion: {
        type: "object",
        properties: {
          low: { type: "number" },
          high: { type: "number" },
          feedback: { type: "string" },
          evidenceQuotes: { type: "array", items: { type: "string" } },
        },
        required: ["low", "high", "feedback", "evidenceQuotes"],
      },
      lexicalResource: {
        type: "object",
        properties: {
          low: { type: "number" },
          high: { type: "number" },
          feedback: { type: "string" },
          evidenceQuotes: { type: "array", items: { type: "string" } },
        },
        required: ["low", "high", "feedback", "evidenceQuotes"],
      },
      grammaticalRange: {
        type: "object",
        properties: {
          low: { type: "number" },
          high: { type: "number" },
          feedback: { type: "string" },
          evidenceQuotes: { type: "array", items: { type: "string" } },
        },
        required: ["low", "high", "feedback", "evidenceQuotes"],
      },
      coachingNotes: {
        type: "array",
        items: { type: "string" },
        description:
          "Pedagogical scaffold suggestions (PEEL, overview, register). Never used to lower bands.",
      },
      topFixes: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 3,
        description: "Exactly three actionable fixes for the next submission",
      },
    },
    required: [
      "taskCriterion",
      "coherenceCohesion",
      "lexicalResource",
      "grammaticalRange",
      "coachingNotes",
      "topFixes",
    ],
  },
};

interface ToolCriterionInput {
  low: number;
  high: number;
  feedback: string;
  evidenceQuotes: string[];
}

interface ToolEvaluationInput {
  taskCriterion: ToolCriterionInput;
  coherenceCohesion: ToolCriterionInput;
  lexicalResource: ToolCriterionInput;
  grammaticalRange: ToolCriterionInput;
  coachingNotes: string[];
  topFixes: string[];
}

function taskCriterionLabel(taskType: WritingTaskType): string {
  return taskType === "TASK_2" ? "Task Response" : "Task Achievement";
}

function buildSystemPrompt(taskType: WritingTaskType): string {
  const taskLabel = taskCriterionLabel(taskType);

  const taskRules: Record<WritingTaskType, string> = {
    TASK_2: `Writing Task 2 — criterion: Task Response
- Minimum 250 words; under-length limits Task Response per official descriptors.
- Score ONLY against public IELTS band descriptors for each criterion.
- Coaching scaffolds (4-paragraph essay, PEEL, intro 40-50 words, body ~80-100 words, conclusion 40-50 words) belong in coachingNotes — NEVER auto-penalise structure unless it genuinely harms descriptor-level performance.
- A well-executed 5-paragraph essay can still be Band 9.`,

    TASK_1_ACADEMIC: `Writing Task 1 Academic — criterion: Task Achievement
- Minimum 150 words. Factual report only.
- Personal opinion or speculation IS off-task and DOES affect Task Achievement.
- An overview of main trends is required for Band 6+.
- Coaching scaffold: Introduction, Overview, Body 1, Body 2 — put scaffold tips in coachingNotes, not band penalties.`,

    TASK_1_GENERAL: `Writing Task 1 General Training — criterion: Task Achievement
- Minimum 150 words. All three bullet points must be covered.
- Register is three-way: informal / semi-formal / formal — infer from recipient AND situation (NOT a binary friend=informal switch).
- Coaching scaffold: purpose, one paragraph per bullet, matched sign-off — in coachingNotes only.`,
  };

  return `You are an expert IELTS writing examiner. Follow CLAUDE.md strictly.

GRADING PHILOSOPHY (non-negotiable):
1. Descriptors score; scaffolds coach. Band ranges reflect official public IELTS band descriptors only.
2. Return band RANGES (low/high per criterion), never a single precise number.
3. Use the pre-computed statistics provided — do NOT invent word counts or vocabulary percentages.
4. Flag misused memorised phrases in lexicalResource feedback with simpler alternatives, but only penalise Lexical Resource when misuse shows genuine imprecision per descriptors.
5. coachingNotes are pedagogical suggestions ONLY and must not duplicate scoring rationale.

${taskRules[taskType]}

Primary criterion label for this task: ${taskLabel}.`;
}

function buildUserMessage(
  input: EvaluateWritingInput,
  analysis: ReturnType<typeof analyzeWriting>
): string {
  const taskLabel = taskCriterionLabel(input.taskType);

  return `Evaluate this IELTS writing submission.

TASK TYPE: ${input.taskType}
PROMPT:
${input.prompt}

PRE-COMPUTED STATISTICS (authoritative — do not recalculate):
- Word count: ${analysis.wordCount} (minimum: ${analysis.minWordCount}, meets minimum: ${analysis.meetsMinWordCount})
- Paragraph count: ${analysis.paragraphCount}
- Paragraph word counts: [${analysis.paragraphWordCounts.join(", ")}]
- Sentence count: ${analysis.sentenceCount}
- Average words per sentence: ${analysis.avgWordsPerSentence}
- Repeated content words (3+ occurrences): ${analysis.repeatedWords.length ? JSON.stringify(analysis.repeatedWords) : "none"}
- Memorised phrase hits: ${analysis.memorizedPhrases.length ? JSON.stringify(analysis.memorizedPhrases) : "none"}
- Conclusion markers found: ${analysis.conclusionMarkersFound.length ? analysis.conclusionMarkersFound.join(", ") : "none"}
${analysis.inferredRegister ? `- Inferred register (GT): ${analysis.inferredRegister}` : ""}

SUBMISSION TEXT:
${input.essay}

Use submit_writing_evaluation. Score ${taskLabel}, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy as separate band ranges with evidence quotes from the submission.`;
}

function clampBand(value: number): number {
  return Math.min(9, Math.max(0, Math.round(value * 2) / 2));
}

function normalizeCriterion(input: ToolCriterionInput): CriterionScore {
  const low = clampBand(Math.min(input.low, input.high));
  const high = clampBand(Math.max(input.low, input.high));
  return {
    band: { low, high },
    feedback: input.feedback,
    evidenceQuotes: input.evidenceQuotes ?? [],
  };
}

function computeOverall(criteria: CriterionScore[]): BandRange {
  const mids = criteria.map((c) => (c.band.low + c.band.high) / 2);
  const avg = mids.reduce((a, b) => a + b, 0) / mids.length;
  const rounded = Math.round(avg * 2) / 2;
  return { low: clampBand(rounded - 0.5), high: clampBand(rounded + 0.5) };
}

function parseToolOutput(raw: ToolEvaluationInput): Omit<
  WritingEvaluation,
  "taskType" | "analysis" | "model" | "promptVersion"
> {
  const taskCriterion = normalizeCriterion(raw.taskCriterion);
  const coherenceCohesion = normalizeCriterion(raw.coherenceCohesion);
  const lexicalResource = normalizeCriterion(raw.lexicalResource);
  const grammaticalRange = normalizeCriterion(raw.grammaticalRange);

  const overall = computeOverall([
    taskCriterion,
    coherenceCohesion,
    lexicalResource,
    grammaticalRange,
  ]);

  return {
    overall,
    taskCriterion,
    coherenceCohesion,
    lexicalResource,
    grammaticalRange,
    coachingNotes: raw.coachingNotes ?? [],
    topFixes: (raw.topFixes ?? []).slice(0, 3),
  };
}

export async function evaluateWriting(
  input: EvaluateWritingInput
): Promise<WritingEvaluation> {
  const analysis = analyzeWriting(input.essay, input.taskType, input.prompt);

  const response = await anthropic.messages.create({
    model: EVALUATOR_MODEL,
    max_tokens: 4096,
    system: buildSystemPrompt(input.taskType),
    tools: [EVALUATION_TOOL],
    tool_choice: { type: "tool", name: "submit_writing_evaluation" },
    messages: [
      {
        role: "user",
        content: buildUserMessage(input, analysis),
      },
    ],
  });

  const toolBlock = response.content.find((block) => block.type === "tool_use");
  if (!toolBlock || toolBlock.type !== "tool_use") {
    throw new Error("Model did not return structured evaluation");
  }

  const parsed = parseToolOutput(toolBlock.input as ToolEvaluationInput);

  return {
    taskType: input.taskType,
    analysis,
    model: EVALUATOR_MODEL,
    promptVersion: PROMPT_VERSION,
    ...parsed,
  };
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function medianRange(ranges: BandRange[]): BandRange {
  return {
    low: clampBand(median(ranges.map((r) => r.low))),
    high: clampBand(median(ranges.map((r) => r.high))),
  };
}

function medianCriterion(scores: CriterionScore[]): CriterionScore {
  return {
    band: medianRange(scores.map((s) => s.band)),
    feedback: scores[0]?.feedback ?? "",
    evidenceQuotes: scores.flatMap((s) => s.evidenceQuotes).slice(0, 5),
  };
}

export async function evaluateWritingEnsemble(
  input: EvaluateWritingInput,
  runs = 3
): Promise<WritingEvaluation> {
  const results = await Promise.all(
    Array.from({ length: runs }, () => evaluateWriting(input))
  );

  const first = results[0];
  return {
    ...first,
    overall: medianRange(results.map((r) => r.overall)),
    taskCriterion: medianCriterion(results.map((r) => r.taskCriterion)),
    coherenceCohesion: medianCriterion(results.map((r) => r.coherenceCohesion)),
    lexicalResource: medianCriterion(results.map((r) => r.lexicalResource)),
    grammaticalRange: medianCriterion(results.map((r) => r.grammaticalRange)),
    coachingNotes: first.coachingNotes,
    topFixes: first.topFixes,
  };
}

export function formatBandRange(range: BandRange): string {
  if (range.low === range.high) return range.low.toFixed(1);
  return `${range.low.toFixed(1)}–${range.high.toFixed(1)}`;
}
