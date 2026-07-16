"use client";

import { useCallback, useRef, useState } from "react";
import { useSimulatorStore } from "@/store/simulator-store";

export interface ReadingQuestion {
  id: string;
  type: "multiple_choice" | "true_false_ng" | "yes_no_ng" | "matching_headings" | "fill_blank";
  question: string;
  options?: string[];
  wordLimit?: number;
}

interface ReadingSimulatorProps {
  passage: string;
  passageTitle: string;
  questions: ReadingQuestion[];
  answers: Record<string, string>;
  onAnswerChange: (questionId: string, value: string) => void;
  disabled?: boolean;
}

export function ReadingSimulator({
  passage,
  passageTitle,
  questions,
  answers,
  onAnswerChange,
  disabled = false,
}: ReadingSimulatorProps) {
  const { highlights, addHighlight } = useSimulatorStore();
  const passageRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [splitRatio, setSplitRatio] = useState(50);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !passageRef.current) return;

    const range = selection.getRangeAt(0);
    if (!passageRef.current.contains(range.commonAncestorContainer)) return;

    const selectedText = selection.toString().trim();
    if (!selectedText) return;

    addHighlight({
      id: crypto.randomUUID(),
      start: 0,
      end: selectedText.length,
      color: selectedColor,
    });

    selection.removeAllRanges();
  }, [addHighlight, selectedColor]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("split-handle")) {
      isDragging.current = true;
      e.preventDefault();
    }
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitRatio(Math.min(70, Math.max(30, ratio)));
  }, []);

  const handleMouseUpGlobal = useCallback(() => {
    isDragging.current = false;
  }, []);

  const renderHighlightedPassage = () => {
    if (highlights.length === 0) {
      return passage;
    }
    return passage;
  };

  return (
    <div
      ref={containerRef}
      className="flex h-full min-h-[600px] border border-slate-300 rounded-lg overflow-hidden bg-white select-text"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUpGlobal}
    >
      {/* Left pane: Reading passage */}
      <div
        className="flex flex-col border-r border-slate-300 overflow-hidden"
        style={{ width: `${splitRatio}%` }}
      >
        <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-300">
          <h3 className="font-semibold text-sm text-ielts-navy">{passageTitle}</h3>
          <div className="flex items-center gap-1">
            <span className="text-xs text-slate-500 mr-2">Highlight:</span>
            {(["yellow", "green", "blue"] as const).map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`w-5 h-5 rounded border-2 ${
                  selectedColor === color ? "border-ielts-navy" : "border-transparent"
                } highlight-${color}`}
                aria-label={`Highlight ${color}`}
              />
            ))}
          </div>
        </div>
        <div
          ref={passageRef}
          className="flex-1 overflow-y-auto p-6 text-sm leading-relaxed text-slate-800"
          onMouseUp={handleMouseUp}
        >
          {renderHighlightedPassage().split("\n\n").map((paragraph, i) => (
            <p key={i} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Split handle */}
      <div className="split-handle w-1 bg-slate-300 hover:bg-ielts-navy cursor-col-resize flex-shrink-0" />

      {/* Right pane: Questions */}
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: `${100 - splitRatio}%` }}
      >
        <div className="px-4 py-2 bg-slate-100 border-b border-slate-300">
          <h3 className="font-semibold text-sm text-ielts-navy">Questions</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="border border-slate-200 rounded-lg p-4">
              <p className="font-medium text-sm mb-3">
                <span className="text-ielts-red mr-2">{index + 1}.</span>
                {q.question}
                {q.wordLimit && (
                  <span className="block text-xs text-slate-500 mt-1">
                    No more than {q.wordLimit} word{q.wordLimit > 1 ? "s" : ""}
                  </span>
                )}
              </p>

              {q.type === "multiple_choice" && q.options && (
                <div className="space-y-2">
                  {q.options.map((option) => (
                    <label key={option} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        disabled={disabled}
                        className="text-ielts-navy"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {(q.type === "true_false_ng" || q.type === "yes_no_ng") && (
                <div className="flex gap-4">
                  {(q.type === "true_false_ng"
                    ? ["True", "False", "Not Given"]
                    : ["Yes", "No", "Not Given"]
                  ).map((option) => (
                    <label key={option} className="flex items-center gap-1 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name={q.id}
                        value={option}
                        checked={answers[q.id] === option}
                        onChange={(e) => onAnswerChange(q.id, e.target.value)}
                        disabled={disabled}
                        className="text-ielts-navy"
                      />
                      {option}
                    </label>
                  ))}
                </div>
              )}

              {q.type === "fill_blank" && (
                <input
                  type="text"
                  value={answers[q.id] || ""}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  disabled={disabled}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ielts-navy"
                  spellCheck={false}
                />
              )}

              {q.type === "matching_headings" && q.options && (
                <select
                  value={answers[q.id] || ""}
                  onChange={(e) => onAnswerChange(q.id, e.target.value)}
                  disabled={disabled}
                  className="w-full border border-slate-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ielts-navy"
                >
                  <option value="">Select a heading</option>
                  {q.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
