"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { TestTimer } from "@/components/simulator/TestTimer";
import {
  SpeakingPart2Prep,
  PELLFrameworkGuide,
} from "@/components/simulator/SpeakingSimulator";
import { useSimulatorStore } from "@/store/simulator-store";

type Part = "1" | "2" | "3";

const PART1_QUESTIONS = [
  "Do you enjoy reading books?",
  "What kind of books do you prefer?",
  "Did you read much when you were a child?",
];

const PART2_CUE_CARD = {
  topic: "Describe a place in your city that you like to visit.",
  bulletPoints: [
    "where it is",
    "how often you go there",
    "what you do there",
    "and explain why you like this place",
  ],
};

const PART3_QUESTIONS = [
  "Why do you think green spaces are important in cities?",
  "Do you think cities will have more or fewer parks in the future?",
  "How can governments encourage people to use public parks?",
];

export default function SpeakingPracticePage() {
  const [activePart, setActivePart] = useState<Part>("1");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [evaluation, setEvaluation] = useState<Record<string, unknown> | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const { reset } = useSimulatorStore();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Type your response below.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const handleEvaluate = useCallback(async () => {
    const question =
      activePart === "1"
        ? PART1_QUESTIONS[currentQuestion]
        : PART3_QUESTIONS[currentQuestion];

    if (!transcript.trim()) return;

    setIsEvaluating(true);
    try {
      const response = await fetch("/api/evaluate-speaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, question }),
      });

      if (!response.ok) throw new Error("Evaluation failed");
      const result = await response.json();
      setEvaluation(result);
    } catch {
      alert("Evaluation failed. Ensure ANTHROPIC_API_KEY is configured.");
    } finally {
      setIsEvaluating(false);
    }
  }, [transcript, activePart, currentQuestion]);

  const handleReset = useCallback(() => {
    reset();
    setTranscript("");
    setEvaluation(null);
    setCurrentQuestion(0);
  }, [reset]);

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-ielts-navy text-white px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm hover:underline">
          ← Home
        </Link>
        <h1 className="font-semibold">Speaking Practice</h1>
        <div className="w-16" />
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div className="flex gap-2">
          {(["1", "2", "3"] as Part[]).map((part) => (
            <button
              key={part}
              type="button"
              onClick={() => {
                setActivePart(part);
                handleReset();
              }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                activePart === part
                  ? "bg-ielts-red text-white"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Part {part}
            </button>
          ))}
        </div>

        {activePart === "2" ? (
          <SpeakingPart2Prep
            cueCard={PART2_CUE_CARD}
            onComplete={() => {
              setTranscript("Part 2 speaking completed");
            }}
          />
        ) : (
          <>
            <PELLFrameworkGuide
              question={
                activePart === "1"
                  ? PART1_QUESTIONS[currentQuestion]
                  : PART3_QUESTIONS[currentQuestion]
              }
            />

            <div className="bg-white border border-slate-300 rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ielts-navy">Your Response</h3>
                <TestTimer
                  initialSeconds={activePart === "1" ? 30 : 60}
                  onExpire={stopRecording}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    isRecording
                      ? "bg-red-600 text-white animate-pulse"
                      : "bg-ielts-navy text-white"
                  }`}
                >
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
              </div>

              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                className="w-full min-h-[120px] p-4 text-sm border border-slate-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-ielts-navy"
                placeholder="Your speech will appear here, or type your response manually..."
              />

              <button
                type="button"
                onClick={handleEvaluate}
                disabled={isEvaluating || !transcript.trim()}
                className="w-full py-3 bg-ielts-red text-white rounded-lg font-semibold disabled:opacity-50"
              >
                {isEvaluating ? "Evaluating..." : "Evaluate with PELL Framework"}
              </button>
            </div>
          </>
        )}

        {evaluation && (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-ielts-navy">Speaking Evaluation</h3>
              <p className="text-3xl font-bold text-ielts-red">
                {String(evaluation.estimatedBandScore)}
              </p>
            </div>
            {["fluencyCoherence", "lexicalResource", "grammaticalRange"].map((key) => (
              <div key={key} className="border border-slate-100 rounded-lg p-3">
                <h4 className="font-semibold text-sm text-ielts-navy capitalize mb-1">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </h4>
                <p className="text-sm text-slate-700">{String(evaluation[key] ?? "")}</p>
              </div>
            ))}
            {Array.isArray(evaluation.actionableFixes) && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h4 className="font-semibold text-amber-900 mb-2">Actionable Fixes</h4>
                <ol className="list-decimal list-inside text-sm text-amber-800 space-y-1">
                  {(evaluation.actionableFixes as string[]).map((fix, i) => (
                    <li key={i}>{fix}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
