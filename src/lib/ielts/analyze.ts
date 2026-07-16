import type { RegisterTone, TextAnalysis, WritingTaskType } from "./types";

const MEMORIZED_PHRASES = [
  "a plethora of",
  "ubiquitous",
  "proliferation",
  "myriad",
  "paradigm shift",
  "in this day and age",
  "it goes without saying",
  "last but not least",
  "needless to say",
  "cutting-edge",
  "game-changer",
  "double-edged sword",
];

const CONCLUSION_MARKERS = [
  "in conclusion",
  "to conclude",
  "in summary",
  "to sum up",
  "all in all",
  "in a nutshell",
  "to summarise",
  "to summarize",
];

const STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
  "is", "are", "was", "were", "be", "been", "being", "have", "has", "had",
  "do", "does", "did", "will", "would", "could", "should", "may", "might",
  "that", "this", "these", "those", "it", "its", "they", "them", "their",
  "we", "our", "you", "your", "i", "my", "he", "she", "his", "her", "as",
  "with", "by", "from", "not", "can", "also", "so", "if", "when", "which",
  "who", "what", "how", "there", "than", "then", "into", "about", "over",
]);

const MIN_WORDS: Record<WritingTaskType, number> = {
  TASK_2: 250,
  TASK_1_ACADEMIC: 150,
  TASK_1_GENERAL: 150,
};

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function findRepeatedWords(text: string, minCount = 3): Array<{ word: string; count: number }> {
  const words = text
    .toLowerCase()
    .replace(/[^a-z'\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w));

  const counts = new Map<string, number>();
  for (const word of words) {
    counts.set(word, (counts.get(word) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= minCount)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

function findMemorizedPhrases(text: string): Array<{ phrase: string; excerpt: string }> {
  const lower = text.toLowerCase();
  const hits: Array<{ phrase: string; excerpt: string }> = [];

  for (const phrase of MEMORIZED_PHRASES) {
    const index = lower.indexOf(phrase);
    if (index === -1) continue;
    const start = Math.max(0, index - 30);
    const end = Math.min(text.length, index + phrase.length + 30);
    hits.push({
      phrase,
      excerpt: text.slice(start, end).replace(/\s+/g, " ").trim(),
    });
  }

  return hits;
}

function findConclusionMarkers(text: string): string[] {
  const lower = text.toLowerCase();
  return CONCLUSION_MARKERS.filter((marker) => lower.includes(marker));
}

export function inferRegister(prompt: string): RegisterTone {
  const lower = prompt.toLowerCase();

  if (
    lower.includes("friend") ||
    lower.includes("classmate") ||
    lower.includes("cousin") ||
    lower.includes("neighbour you know well")
  ) {
    return "informal";
  }

  if (
    lower.includes("landlord") ||
    lower.includes("manager") ||
    lower.includes("colleague") ||
    lower.includes("teacher") ||
    lower.includes("employer")
  ) {
    return "semi-formal";
  }

  if (
    lower.includes("company") ||
    lower.includes("council") ||
    lower.includes("authority") ||
    lower.includes("director") ||
    lower.includes("complaint") ||
    lower.includes("application")
  ) {
    return "formal";
  }

  return "formal";
}

export function analyzeWriting(
  text: string,
  taskType: WritingTaskType,
  prompt?: string
): TextAnalysis {
  const paragraphs = splitParagraphs(text);
  const paragraphWordCounts = paragraphs.map(countWords);
  const wordCount = countWords(text);
  const minWordCount = MIN_WORDS[taskType];
  const sentences = splitSentences(text);
  const conclusionMarkersFound = findConclusionMarkers(text);

  const analysis: TextAnalysis = {
    wordCount,
    paragraphCount: paragraphs.length,
    paragraphs,
    paragraphWordCounts,
    sentenceCount: sentences.length,
    avgWordsPerSentence:
      sentences.length > 0 ? Math.round((wordCount / sentences.length) * 10) / 10 : 0,
    repeatedWords: findRepeatedWords(text),
    memorizedPhrases: findMemorizedPhrases(text),
    hasConclusionMarker: conclusionMarkersFound.length > 0,
    conclusionMarkersFound,
    meetsMinWordCount: wordCount >= minWordCount,
    minWordCount,
  };

  if (taskType === "TASK_1_GENERAL" && prompt) {
    analysis.inferredRegister = inferRegister(prompt);
  }

  return analysis;
}

export { MEMORIZED_PHRASES, CONCLUSION_MARKERS };
