"use client";

import { useState, useCallback } from "react";
import { TestTimer } from "./TestTimer";
import { useSimulatorStore } from "@/store/simulator-store";

const PART2_HEADINGS = [
  { key: "introduction", label: "Introduction", hint: "Brief opening about the topic" },
  { key: "past", label: "Past", hint: "Use past simple or past perfect tense" },
  { key: "description", label: "Description", hint: "Describe details using present tense" },
  { key: "opinion", label: "Opinion", hint: "Share your personal view" },
  { key: "future", label: "Future", hint: "Use future continuous or 'be going to'" },
] as const;

interface SpeakingPart2Props {
  cueCard: {
    topic: string;
    bulletPoints: string[];
  };
  onComplete: (notes: Record<string, string>) => void;
}

export function SpeakingPart2Prep({ cueCard, onComplete }: SpeakingPart2Props) {
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [phase, setPhase] = useState<"prep" | "speaking">("prep");
  const { reset } = useSimulatorStore();

  const handleNoteChange = useCallback((key: string, value: string) => {
    setNotes((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePrepExpire = useCallback(() => {
    setPhase("speaking");
  }, []);

  const handleSpeakingExpire = useCallback(() => {
    onComplete(notes);
  }, [notes, onComplete]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white border border-slate-300 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-ielts-navy mb-2">Cue Card</h3>
        <p className="text-slate-800 mb-4">{cueCard.topic}</p>
        <p className="text-sm text-slate-500 mb-2">You should say:</p>
        <ul className="list-disc list-inside text-sm text-slate-700 space-y-1">
          {cueCard.bulletPoints.map((point, i) => (
            <li key={i}>{point}</li>
          ))}
        </ul>
        <p className="text-xs text-slate-400 mt-3 italic">
          Tip: Do not try to cover every bullet point. Use the 5-Heading Strategy below instead.
        </p>
      </div>

      {phase === "prep" ? (
        <>
          <div className="flex justify-center">
            <TestTimer initialSeconds={60} onExpire={handlePrepExpire} />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
            <strong>5-Heading Strategy:</strong> Take notes under each heading below.
            This trains you to move through different tenses naturally.
          </div>
          <div className="grid gap-4">
            {PART2_HEADINGS.map((heading) => (
              <div
                key={heading.key}
                className="bg-white border border-slate-300 rounded-lg overflow-hidden"
              >
                <div className="px-4 py-2 bg-slate-100 border-b border-slate-300">
                  <h4 className="font-semibold text-sm text-ielts-navy">{heading.label}</h4>
                  <p className="text-xs text-slate-500">{heading.hint}</p>
                </div>
                <textarea
                  value={notes[heading.key] || ""}
                  onChange={(e) => handleNoteChange(heading.key, e.target.value)}
                  className="w-full min-h-[80px] p-3 text-sm resize-none focus:outline-none"
                  placeholder={`Notes for ${heading.label}...`}
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-center">
            <TestTimer initialSeconds={120} onExpire={handleSpeakingExpire} />
          </div>
          <div className="bg-white border border-slate-300 rounded-lg p-6 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ielts-red flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-white animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-ielts-navy">Speaking — Part 2</p>
            <p className="text-sm text-slate-500 mt-2">
              Speak continuously for up to 2 minutes using your notes as a guide.
            </p>
          </div>
          <div className="grid gap-2">
            {PART2_HEADINGS.map((heading) => (
              <div key={heading.key} className="bg-slate-50 rounded px-4 py-2 text-sm">
                <span className="font-medium text-ielts-navy">{heading.label}:</span>{" "}
                <span className="text-slate-600">{notes[heading.key] || "—"}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => {
              reset();
              onComplete(notes);
            }}
            className="w-full py-3 bg-ielts-navy text-white rounded-lg font-medium hover:bg-ielts-navy/90"
          >
            Finish Speaking
          </button>
        </>
      )}
    </div>
  );
}

interface PELLFrameworkGuideProps {
  question: string;
}

export function PELLFrameworkGuide({ question }: PELLFrameworkGuideProps) {
  return (
    <div className="bg-white border border-slate-300 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-ielts-navy">Question</h3>
      <p className="text-slate-800">{question}</p>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-sm text-blue-900 mb-2">PELL Framework</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li><strong>P</strong>oint — Answer the question directly</li>
          <li><strong>E</strong>laboration — Explain your reasoning</li>
          <li><strong>L</strong>evel Up — Add depth, contrast, or an anecdote</li>
          <li><strong>L</strong>ink — Connect back to your original point</li>
        </ul>
      </div>
      <div className="bg-slate-50 rounded-lg p-4 text-xs text-slate-500">
        <p className="font-medium text-slate-700 mb-1">Speaking Myths — Ignore These:</p>
        <ul className="space-y-1">
          <li>Body language and eye contact have zero impact on your score</li>
          <li>Extreme politeness does not increase your band</li>
          <li>Forcing idioms damages both lexical and fluency scores</li>
          <li>Memorized scripts are easily detected and heavily penalized</li>
        </ul>
      </div>
    </div>
  );
}

interface CoffeeShopMethodProps {
  prompt: string;
  onIdeasGenerated: (ideas: string) => void;
}

export function CoffeeShopMethod({ prompt, onIdeasGenerated }: CoffeeShopMethodProps) {
  const [ideas, setIdeas] = useState("");

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 space-y-4">
      <h3 className="font-semibold text-amber-900">Coffee Shop Method — Ideation Phase</h3>
      <p className="text-sm text-amber-800">
        Before writing, imagine discussing this topic with a friend in a relaxed coffee shop.
        What would you naturally say? Write your ideas below — keep them simple and logical.
      </p>
      <div className="bg-white rounded-lg p-4 border border-amber-200">
        <p className="text-sm font-medium text-slate-700 mb-2">Essay Prompt:</p>
        <p className="text-slate-800">{prompt}</p>
      </div>
      <textarea
        value={ideas}
        onChange={(e) => setIdeas(e.target.value)}
        className="w-full min-h-[150px] p-4 text-sm border border-amber-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-400"
        placeholder="Imagine telling a friend your thoughts on this topic..."
      />
      <button
        type="button"
        onClick={() => onIdeasGenerated(ideas)}
        disabled={!ideas.trim()}
        className="px-6 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50"
      >
        Continue to Essay Blueprint
      </button>
    </div>
  );
}

export const TASK2_PARAGRAPHS = [
  {
    key: "introduction",
    label: "Introduction",
    minWords: 40,
    maxWords: 50,
    hint: "Paraphrase the prompt and state a clear position. No examples here.",
  },
  {
    key: "body1",
    label: "Body Paragraph 1",
    minWords: 80,
    maxWords: 100,
    hint: "PEEL: One central idea with Point, Explain, Example, Link.",
  },
  {
    key: "body2",
    label: "Body Paragraph 2",
    minWords: 80,
    maxWords: 100,
    hint: "PEEL: One central idea with Point, Explain, Example, Link.",
  },
  {
    key: "conclusion",
    label: "Conclusion",
    minWords: 40,
    maxWords: 50,
    hint: "Restate position and summarize. No new information.",
  },
];

export const TASK1_ACADEMIC_PARAGRAPHS = [
  {
    key: "introduction",
    label: "Introduction",
    minWords: 20,
    maxWords: 40,
    hint: "Paraphrase what the visual shows. No data or opinions.",
  },
  {
    key: "overview",
    label: "Overview",
    minWords: 30,
    maxWords: 50,
    hint: "Summarize main trends without specific data. No conclusion.",
  },
  {
    key: "body1",
    label: "Body Paragraph 1",
    minWords: 50,
    maxWords: 80,
    hint: "Describe key data with comparisons and trend language.",
  },
  {
    key: "body2",
    label: "Body Paragraph 2",
    minWords: 50,
    maxWords: 80,
    hint: "Describe remaining data. No conclusion or personal opinion.",
  },
];

export const TASK1_GENERAL_PARAGRAPHS = [
  {
    key: "purpose",
    label: "Statement of Purpose",
    minWords: 20,
    maxWords: 40,
    hint: "State why you are writing with appropriate salutation.",
  },
  {
    key: "bullet1",
    label: "Bullet Point 1",
    minWords: 30,
    maxWords: 50,
    hint: "Address the first bullet point from the prompt.",
  },
  {
    key: "bullet2",
    label: "Bullet Point 2",
    minWords: 30,
    maxWords: 50,
    hint: "Address the second bullet point from the prompt.",
  },
  {
    key: "bullet3",
    label: "Bullet Point 3",
    minWords: 30,
    maxWords: 50,
    hint: "Address the third bullet point from the prompt.",
  },
  {
    key: "signoff",
    label: "Sign-off",
    minWords: 10,
    maxWords: 30,
    hint: "Appropriate closing and sign-off matching the tone.",
  },
];
