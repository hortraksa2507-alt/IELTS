"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { TestTimer } from "@/components/simulator/TestTimer";
import {
  StructuredWritingSimulator,
  WritingSimulator,
} from "@/components/simulator/WritingSimulator";
import {
  CoffeeShopMethod,
  TASK2_PARAGRAPHS,
  TASK1_ACADEMIC_PARAGRAPHS,
  TASK1_GENERAL_PARAGRAPHS,
} from "@/components/simulator/SpeakingSimulator";
import { useSimulatorStore } from "@/store/simulator-store";

type TaskType = "TASK_2" | "TASK_1_ACADEMIC" | "TASK_1_GENERAL";
type Phase = "select" | "ideation" | "writing" | "results";

interface EvaluationResult {
  estimatedBandScore: number;
  taskResponse: string;
  coherenceCohesion: string;
  lexicalResource: string;
  grammaticalRange: string;
  actionableFixes: string[];
}

const SAMPLE_PROMPTS: Record<TaskType, { title: string; prompt: string; minWords: number; maxWords: number }> = {
  TASK_2: {
    title: "Writing Task 2 — Essay",
    prompt:
      "Some people believe that technology has made our lives more complicated, while others think it has made life easier. Discuss both views and give your own opinion.",
    minWords: 250,
    maxWords: 300,
  },
  TASK_1_ACADEMIC: {
    title: "Writing Task 1 — Academic Report",
    prompt:
      "The chart below shows the percentage of households with internet access in three countries between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
    minWords: 150,
    maxWords: 200,
  },
  TASK_1_GENERAL: {
    title: "Writing Task 1 — General Training Letter",
    prompt:
      "You recently moved to a new city and want to tell your friend about it. Write a letter to your friend. In your letter:\n- explain why you moved\n- describe your new neighbourhood\n- invite your friend to visit",
    minWords: 150,
    maxWords: 200,
  },
};

const PARAGRAPH_MAP: Record<TaskType, typeof TASK2_PARAGRAPHS> = {
  TASK_2: TASK2_PARAGRAPHS,
  TASK_1_ACADEMIC: TASK1_ACADEMIC_PARAGRAPHS,
  TASK_1_GENERAL: TASK1_GENERAL_PARAGRAPHS,
};

export default function WritingPracticePage() {
  const [taskType, setTaskType] = useState<TaskType>("TASK_2");
  const [phase, setPhase] = useState<Phase>("select");
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const { content, reset, setLocked } = useSimulatorStore();

  const sample = SAMPLE_PROMPTS[taskType];
  const paragraphs = PARAGRAPH_MAP[taskType];
  const duration = taskType === "TASK_2" ? 2400 : 1200;

  const handleExpire = useCallback(() => {
    setLocked(true);
  }, [setLocked]);

  const handleSubmit = useCallback(async () => {
    setIsEvaluating(true);
    try {
      const response = await fetch("/api/evaluate-writing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essay: content,
          prompt: sample.prompt,
          taskType,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Evaluation failed");
      }

      const result = await response.json();
      setEvaluation(result);
      setPhase("results");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Evaluation failed");
    } finally {
      setIsEvaluating(false);
    }
  }, [content, sample.prompt, taskType]);

  const handleReset = useCallback(() => {
    reset();
    setEvaluation(null);
    setPhase("select");
  }, [reset]);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-ielts-navy text-white px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm hover:underline">
          ← Home
        </Link>
        <h1 className="font-semibold">Writing Practice</h1>
        <div className="w-16" />
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {phase === "select" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-ielts-navy">Select Writing Task</h2>
            <div className="grid gap-4">
              {(Object.keys(SAMPLE_PROMPTS) as TaskType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setTaskType(type);
                    reset();
                    setPhase(type === "TASK_2" ? "ideation" : "writing");
                  }}
                  className={`text-left p-4 rounded-lg border transition ${
                    taskType === type
                      ? "border-ielts-red bg-red-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <h3 className="font-semibold text-ielts-navy">
                    {SAMPLE_PROMPTS[type].title}
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {SAMPLE_PROMPTS[type].prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {phase === "ideation" && (
          <CoffeeShopMethod
            prompt={sample.prompt}
            onIdeasGenerated={() => setPhase("writing")}
          />
        )}

        {phase === "writing" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-ielts-navy">{sample.title}</h2>
                <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                  {sample.prompt}
                </p>
              </div>
              <TestTimer initialSeconds={duration} onExpire={handleExpire} />
            </div>

            {taskType === "TASK_2" || taskType === "TASK_1_ACADEMIC" || taskType === "TASK_1_GENERAL" ? (
              <StructuredWritingSimulator paragraphs={[...paragraphs]} />
            ) : (
              <WritingSimulator minWords={sample.minWords} maxWords={sample.maxWords} />
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isEvaluating || !content.trim()}
                className="flex-1 py-3 bg-ielts-red text-white rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
              >
                {isEvaluating ? "Evaluating..." : "Submit for AI Evaluation"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 border border-slate-300 rounded-lg text-sm hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {phase === "results" && evaluation && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-ielts-navy">Evaluation Results</h2>
                <div className="text-center">
                  <p className="text-xs text-slate-500 uppercase">Estimated Band</p>
                  <p className="text-4xl font-bold text-ielts-red">
                    {evaluation.estimatedBandScore}
                  </p>
                </div>
              </div>

              <div className="grid gap-4">
                {[
                  { label: "Task Response", value: evaluation.taskResponse },
                  { label: "Coherence & Cohesion", value: evaluation.coherenceCohesion },
                  { label: "Lexical Resource", value: evaluation.lexicalResource },
                  { label: "Grammatical Range", value: evaluation.grammaticalRange },
                ].map((criterion) => (
                  <div key={criterion.label} className="border border-slate-100 rounded-lg p-4">
                    <h3 className="font-semibold text-sm text-ielts-navy mb-1">
                      {criterion.label}
                    </h3>
                    <p className="text-sm text-slate-700">{criterion.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-semibold text-amber-900 mb-2">Actionable Fixes</h3>
                <ol className="list-decimal list-inside text-sm text-amber-800 space-y-1">
                  {evaluation.actionableFixes.map((fix, i) => (
                    <li key={i}>{fix}</li>
                  ))}
                </ol>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-3 bg-ielts-navy text-white rounded-lg font-semibold hover:bg-ielts-navy/90"
            >
              Try Another Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
