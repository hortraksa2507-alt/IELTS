import Anthropic from "@anthropic-ai/sdk";
import {
  WRITING_TASK2_SYSTEM_PROMPT,
  WRITING_TASK1_ACADEMIC_SYSTEM_PROMPT,
  WRITING_TASK1_GENERAL_SYSTEM_PROMPT,
  SPEAKING_PELL_SYSTEM_PROMPT,
  FORCED_VOCABULARY_PATTERNS,
  type WritingEvaluationResult,
  type SpeakingEvaluationResult,
} from "@/lib/prompts/evaluation-prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

function parseEvaluationJson<T>(text: string): T {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse evaluation response");
  }
  return JSON.parse(jsonMatch[0]) as T;
}

export async function evaluateWritingTask2(
  essay: string,
  prompt: string
): Promise<WritingEvaluationResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: WRITING_TASK2_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Evaluate this Writing Task 2 essay.\n\nPrompt: ${prompt}\n\nEssay:\n${essay}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return parseEvaluationJson<WritingEvaluationResult>(textBlock.text);
}

export async function evaluateWritingTask1Academic(
  report: string,
  prompt: string
): Promise<WritingEvaluationResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: WRITING_TASK1_ACADEMIC_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Evaluate this Academic Writing Task 1 report.\n\nPrompt: ${prompt}\n\nReport:\n${report}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return parseEvaluationJson<WritingEvaluationResult>(textBlock.text);
}

export async function evaluateWritingTask1General(
  letter: string,
  prompt: string
): Promise<WritingEvaluationResult> {
  const isInformal = prompt.toLowerCase().includes("friend");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: WRITING_TASK1_GENERAL_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Evaluate this General Training Writing Task 1 letter.\nTone requirement: ${isInformal ? "INFORMAL (writing to a friend)" : "FORMAL"}\n\nPrompt: ${prompt}\n\nLetter:\n${letter}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return parseEvaluationJson<WritingEvaluationResult>(textBlock.text);
}

export async function evaluateSpeakingTranscript(
  transcript: string,
  question: string
): Promise<SpeakingEvaluationResult> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: SPEAKING_PELL_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Evaluate this speaking response using the PELL framework.\n\nQuestion: ${question}\n\nTranscript:\n${transcript}`,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude");
  }

  return parseEvaluationJson<SpeakingEvaluationResult>(textBlock.text);
}

export function checkWordLimit(answer: string, limit: number): boolean {
  const words = answer.trim().split(/\s+/).filter(Boolean);
  return words.length <= limit;
}

export function checkExactSpelling(
  userAnswer: string,
  correctAnswer: string
): boolean {
  return userAnswer.trim() === correctAnswer.trim();
}

export function detectForcedVocabulary(text: string): string[] {
  const lowerText = text.toLowerCase();
  return FORCED_VOCABULARY_PATTERNS.filter((phrase) =>
    lowerText.includes(phrase.toLowerCase())
  );
}
