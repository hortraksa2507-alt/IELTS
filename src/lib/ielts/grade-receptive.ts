import type { ReceptiveAnswerKey } from "./types";

function normalizeAnswer(answer: string): string {
  return answer.trim().replace(/\s+/g, " ").toLowerCase();
}

function expandAcceptedAnswers(key: ReceptiveAnswerKey): string[] {
  const all = [key.primary, ...(key.acceptedAlternates ?? [])];
  return all.map(normalizeAnswer);
}

export function gradeReceptiveAnswer(
  userAnswer: string,
  key: ReceptiveAnswerKey
): { correct: boolean; reason?: string } {
  const trimmed = userAnswer.trim();
  if (!trimmed) {
    return { correct: false, reason: "empty" };
  }

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if (key.wordLimit !== undefined && wordCount > key.wordLimit) {
    return { correct: false, reason: "word_limit_exceeded" };
  }

  const normalizedUser = normalizeAnswer(trimmed);
  const accepted = expandAcceptedAnswers(key);

  if (accepted.includes(normalizedUser)) {
    return { correct: true };
  }

  return { correct: false, reason: "spelling_or_mismatch" };
}

export function gradeReceptiveBatch(
  answers: Record<string, string>,
  keys: Record<string, ReceptiveAnswerKey>
): {
  score: number;
  total: number;
  results: Record<string, { correct: boolean; reason?: string }>;
} {
  const results: Record<string, { correct: boolean; reason?: string }> = {};
  let score = 0;

  for (const [questionId, key] of Object.entries(keys)) {
    const result = gradeReceptiveAnswer(answers[questionId] ?? "", key);
    results[questionId] = result;
    if (result.correct) score += 1;
  }

  return { score, total: Object.keys(keys).length, results };
}
