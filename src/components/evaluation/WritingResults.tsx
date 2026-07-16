"use client";

import type { WritingEvaluation } from "@/lib/ielts/types";
import { formatBandRange } from "@/lib/ielts/evaluator";

interface WritingResultsProps {
  evaluation: WritingEvaluation;
  onRetry: () => void;
}

function taskCriterionLabel(taskType: WritingEvaluation["taskType"]): string {
  return taskType === "TASK_2" ? "Task Response" : "Task Achievement";
}

function CriterionCard({
  label,
  score,
}: {
  label: string;
  score: WritingEvaluation["taskCriterion"];
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm text-ielts-navy">{label}</h3>
        <span className="font-mono font-bold text-ielts-red">
          {formatBandRange(score.band)}
        </span>
      </div>
      <p className="text-sm text-slate-700 mb-3">{score.feedback}</p>
      {score.evidenceQuotes.length > 0 && (
        <div className="bg-slate-50 rounded p-3 space-y-1">
          <p className="text-xs font-medium text-slate-500 uppercase">Evidence</p>
          {score.evidenceQuotes.map((quote, i) => (
            <p key={i} className="text-xs text-slate-600 italic border-l-2 border-slate-300 pl-2">
              &ldquo;{quote}&rdquo;
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export function WritingResults({ evaluation, onRetry }: WritingResultsProps) {
  const taskLabel = taskCriterionLabel(evaluation.taskType);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-2xl font-bold text-ielts-navy">Evaluation Results</h2>
            <p className="text-xs text-slate-500 mt-1">
              Estimated range — only IELTS can issue official band scores.
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-slate-500 uppercase">Overall Band Range</p>
            <p className="text-4xl font-bold text-ielts-red">
              {formatBandRange(evaluation.overall)}
            </p>
          </div>
        </div>

        <div className="grid gap-4 mt-6">
          <CriterionCard label={taskLabel} score={evaluation.taskCriterion} />
          <CriterionCard label="Coherence & Cohesion" score={evaluation.coherenceCohesion} />
          <CriterionCard label="Lexical Resource" score={evaluation.lexicalResource} />
          <CriterionCard label="Grammatical Range & Accuracy" score={evaluation.grammaticalRange} />
        </div>

        {evaluation.coachingNotes.length > 0 && (
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">
              Coaching Notes
              <span className="ml-2 text-xs font-normal text-blue-600">
                (scaffolds — not score penalties)
              </span>
            </h3>
            <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
              {evaluation.coachingNotes.map((note, i) => (
                <li key={i}>{note}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Top 3 Fixes for Next Submission</h3>
          <ol className="list-decimal list-inside text-sm text-amber-800 space-y-1">
            {evaluation.topFixes.map((fix, i) => (
              <li key={i}>{fix}</li>
            ))}
          </ol>
        </div>

        <details className="mt-4 text-xs text-slate-400">
          <summary className="cursor-pointer">Analysis statistics</summary>
          <pre className="mt-2 bg-slate-50 p-3 rounded overflow-x-auto">
            {JSON.stringify(evaluation.analysis, null, 2)}
          </pre>
        </details>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="w-full py-3 bg-ielts-navy text-white rounded-lg font-semibold hover:bg-ielts-navy/90"
      >
        Try Another Task
      </button>
    </div>
  );
}
