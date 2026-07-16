"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { TestTimer } from "@/components/simulator/TestTimer";
import { gradeReceptiveBatch } from "@/lib/ielts/grade-receptive";
import type { ReceptiveAnswerKey } from "@/lib/ielts/types";
import { useSimulatorStore } from "@/store/simulator-store";

interface ListeningQuestion {
  id: string;
  question: string;
  wordLimit?: number;
}

const LISTENING_QUESTIONS: ListeningQuestion[] = [
  { id: "l1", question: "What is the name of the museum?", wordLimit: 2 },
  { id: "l2", question: "On which day is the museum closed?", wordLimit: 1 },
  { id: "l3", question: "What time does the guided tour start?", wordLimit: 1 },
  { id: "l4", question: "How much is the student ticket?", wordLimit: 1 },
];

const LISTENING_KEYS: Record<string, ReceptiveAnswerKey> = {
  l1: { primary: "City Museum", wordLimit: 2 },
  l2: { primary: "Monday", acceptedAlternates: ["monday"], wordLimit: 1 },
  l3: { primary: "2:30", acceptedAlternates: ["2:30pm", "14:30"], wordLimit: 1 },
  l4: { primary: "£8", acceptedAlternates: ["8"], wordLimit: 1 },
};

const SAMPLE_TRANSCRIPT = `[Audio transcript for demonstration]
Welcome to the City Museum. We are open every day except Monday, from 9 AM to 5 PM.
Our guided tour starts at 2:30 PM daily. Adult tickets are £12, and student tickets are £8.
Children under 12 enter free. The museum is located on High Street, next to the library.`;

export default function ListeningPracticePage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [hasPlayed, setHasPlayed] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [showTranscript, setShowTranscript] = useState(false);
  const { setLocked } = useSimulatorStore();
  const audioPlayedRef = useRef(false);

  const handlePlay = useCallback(() => {
    if (audioPlayedRef.current) return;
    audioPlayedRef.current = true;
    setHasPlayed(true);
    setShowTranscript(true);
  }, []);

  const handleSubmit = useCallback(() => {
    const graded = gradeReceptiveBatch(answers, LISTENING_KEYS);
    const newResults: Record<string, boolean> = {};
    for (const [id, result] of Object.entries(graded.results)) {
      newResults[id] = result.correct;
    }
    setResults(newResults);
    setSubmitted(true);
    setLocked(true);
  }, [answers, setLocked]);

  const handleExpire = useCallback(() => {
    setLocked(true);
    handleSubmit();
  }, [handleSubmit, setLocked]);

  const score = Object.values(results).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-ielts-navy text-white px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm hover:underline">
          ← Home
        </Link>
        <h1 className="font-semibold">Listening Practice</h1>
        <TestTimer initialSeconds={600} onExpire={handleExpire} />
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          <strong>Exam Condition:</strong> Audio can only be played once. Exact spelling and
          word limits are enforced.
        </div>

        <div className="bg-white border border-slate-300 rounded-lg p-6 text-center">
          <button
            type="button"
            onClick={handlePlay}
            disabled={hasPlayed}
            className={`px-8 py-4 rounded-full text-lg font-semibold ${
              hasPlayed
                ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                : "bg-ielts-red text-white hover:bg-red-700"
            }`}
          >
            {hasPlayed ? "Audio Played (Single Playback)" : "▶ Play Audio"}
          </button>
          {showTranscript && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg text-left text-sm text-slate-600">
              <p className="text-xs text-slate-400 mb-2">
                Demo mode: transcript shown instead of audio file
              </p>
              <pre className="whitespace-pre-wrap font-sans">{SAMPLE_TRANSCRIPT}</pre>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {LISTENING_QUESTIONS.map((q, i) => (
            <div key={q.id} className="bg-white border border-slate-200 rounded-lg p-4">
              <p className="font-medium text-sm mb-2">
                <span className="text-ielts-red mr-2">{i + 1}.</span>
                {q.question}
                {q.wordLimit && (
                  <span className="block text-xs text-slate-500 mt-1">
                    No more than {q.wordLimit} word{q.wordLimit > 1 ? "s" : ""}
                  </span>
                )}
              </p>
              <input
                type="text"
                value={answers[q.id] || ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                }
                disabled={submitted}
                spellCheck={false}
                className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ielts-navy ${
                  submitted
                    ? results[q.id]
                      ? "border-green-400 bg-green-50"
                      : "border-red-400 bg-red-50"
                    : "border-slate-300"
                }`}
              />
              {submitted && !results[q.id] && (
                <p className="text-xs text-red-600 mt-1">
                  Correct: {LISTENING_KEYS[q.id].primary}
                </p>
              )}
            </div>
          ))}
        </div>

        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasPlayed}
            className="w-full py-3 bg-ielts-navy text-white rounded-lg font-semibold disabled:opacity-50"
          >
            Submit Answers
          </button>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-bold text-ielts-navy">
              Score: {score}/{LISTENING_QUESTIONS.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
