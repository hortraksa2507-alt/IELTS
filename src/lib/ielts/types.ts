export type WritingTaskType = "TASK_2" | "TASK_1_ACADEMIC" | "TASK_1_GENERAL";

export type RegisterTone = "informal" | "semi-formal" | "formal";

export interface BandRange {
  low: number;
  high: number;
}

export interface CriterionScore {
  band: BandRange;
  feedback: string;
  evidenceQuotes: string[];
}

export interface TextAnalysis {
  wordCount: number;
  paragraphCount: number;
  paragraphs: string[];
  paragraphWordCounts: number[];
  sentenceCount: number;
  avgWordsPerSentence: number;
  repeatedWords: Array<{ word: string; count: number }>;
  memorizedPhrases: Array<{ phrase: string; excerpt: string }>;
  hasConclusionMarker: boolean;
  conclusionMarkersFound: string[];
  meetsMinWordCount: boolean;
  minWordCount: number;
  inferredRegister?: RegisterTone;
}

export interface WritingEvaluation {
  taskType: WritingTaskType;
  overall: BandRange;
  taskCriterion: CriterionScore;
  coherenceCohesion: CriterionScore;
  lexicalResource: CriterionScore;
  grammaticalRange: CriterionScore;
  coachingNotes: string[];
  topFixes: string[];
  analysis: TextAnalysis;
  model: string;
  promptVersion: string;
}

export interface EvaluateWritingInput {
  essay: string;
  prompt: string;
  taskType: WritingTaskType;
}

export interface ReceptiveAnswerKey {
  primary: string;
  acceptedAlternates?: string[];
  wordLimit?: number;
}
