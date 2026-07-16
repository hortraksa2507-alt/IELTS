"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { TestTimer } from "@/components/simulator/TestTimer";
import { ReadingSimulator, type ReadingQuestion } from "@/components/simulator/ReadingSimulator";
import { gradeReceptiveBatch } from "@/lib/ielts/grade-receptive";
import type { ReceptiveAnswerKey } from "@/lib/ielts/types";
import { useSimulatorStore } from "@/store/simulator-store";

const SAMPLE_PASSAGE = `The History of Urban Green Spaces

Urban green spaces have played a vital role in city planning for centuries. The earliest recorded public gardens date back to ancient Mesopotamia, where rulers created elaborate gardens as symbols of power and prosperity. These early green spaces were primarily designed for the elite, with ordinary citizens having limited access to natural environments within city walls.

During the Industrial Revolution, the concept of public parks underwent a significant transformation. As cities grew rapidly and living conditions deteriorated, reformers argued that access to green spaces was essential for public health. Frederick Law Olmsted, often considered the father of American landscape architecture, designed Central Park in New York City in 1858. His vision was revolutionary: a green space accessible to all citizens, regardless of social class.

The twentieth century saw further evolution in urban green space design. The garden city movement, pioneered by Ebenezer Howard in 1902, proposed integrating green belts around urban areas to limit sprawl and provide recreational space. Meanwhile, rooftop gardens and vertical green walls emerged as innovative solutions in densely populated cities where ground-level space was scarce.

Today, urban planners face new challenges. Climate change has made the cooling effect of green spaces more critical than ever. Studies show that neighbourhoods with adequate tree cover can be up to 5 degrees Celsius cooler than surrounding areas. Additionally, research from the University of Melbourne indicates that residents living within 300 metres of a park report significantly higher levels of mental wellbeing.

Despite these benefits, many cities struggle to maintain existing green spaces while creating new ones. Funding constraints, competing land use demands, and population growth all pose significant obstacles. Some experts argue that private-sector partnerships may offer a partial solution, though others caution that commercial involvement could limit public access.`;

const SAMPLE_QUESTIONS: ReadingQuestion[] = [
  {
    id: "q1",
    type: "true_false_ng",
    question:
      "The earliest public gardens in Mesopotamia were open to all citizens.",
  },
  {
    id: "q2",
    type: "true_false_ng",
    question:
      "Frederick Law Olmsted designed Central Park to be accessible to people of all social classes.",
  },
  {
    id: "q3",
    type: "true_false_ng",
    question:
      "The garden city movement was established before the Industrial Revolution.",
  },
  {
    id: "q4",
    type: "yes_no_ng",
    question:
      "The author believes that private-sector partnerships are the best solution for funding green spaces.",
  },
  {
    id: "q5",
    type: "fill_blank",
    question: "Neighbourhoods with tree cover can be up to ___ degrees Celsius cooler.",
    wordLimit: 1,
  },
  {
    id: "q6",
    type: "matching_headings",
    question: "Paragraph 3 discusses:",
    options: [
      "Ancient garden traditions",
      "Industrial-era park reform",
      "Twentieth-century design innovations",
      "Modern climate challenges",
    ],
  },
];

const ANSWER_KEYS: Record<string, ReceptiveAnswerKey> = {
  q1: { primary: "False" },
  q2: { primary: "True" },
  q3: { primary: "False" },
  q4: { primary: "Not Given", acceptedAlternates: ["not given"] },
  q5: { primary: "5", wordLimit: 1 },
  q6: {
    primary: "Twentieth-century design innovations",
    acceptedAlternates: ["twentieth-century design innovations"],
  },
};

export default function ReadingPracticePage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const { setLocked, reset } = useSimulatorStore();

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    const { score: correct } = gradeReceptiveBatch(answers, ANSWER_KEYS);
    setScore(correct);
    setSubmitted(true);
    setLocked(true);
  }, [answers, setLocked]);

  const handleExpire = useCallback(() => {
    setLocked(true);
    handleSubmit();
  }, [handleSubmit, setLocked]);

  const handleReset = useCallback(() => {
    reset();
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  }, [reset]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-ielts-navy text-white px-6 py-3 flex items-center justify-between flex-shrink-0">
        <Link href="/" className="text-sm hover:underline">
          ← Home
        </Link>
        <h1 className="font-semibold">Reading Practice — CD-IELTS Simulator</h1>
        <TestTimer initialSeconds={1200} onExpire={handleExpire} />
      </nav>

      <div className="flex-1 p-4">
        <ReadingSimulator
          passage={SAMPLE_PASSAGE}
          passageTitle="Passage 1: The History of Urban Green Spaces"
          questions={SAMPLE_QUESTIONS}
          answers={answers}
          onAnswerChange={handleAnswerChange}
          disabled={submitted}
        />
      </div>

      <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between">
        {submitted ? (
          <div className="flex items-center gap-6">
            <p className="font-semibold text-ielts-navy">
              Score: {score}/{SAMPLE_QUESTIONS.length}
            </p>
            {answers.q1?.toLowerCase() === "true" && (
              <p className="text-sm text-amber-600">
                Tip: You confused False with Not Given on Q1. False means the text directly
                contradicts the statement.
              </p>
            )}
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-ielts-navy text-white rounded-lg text-sm"
            >
              Retry
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            className="ml-auto px-6 py-2 bg-ielts-red text-white rounded-lg font-semibold hover:bg-red-700"
          >
            Submit Answers
          </button>
        )}
      </div>
    </div>
  );
}
