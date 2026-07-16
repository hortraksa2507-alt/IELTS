"use client";

import { useCallback } from "react";
import { useSimulatorStore } from "@/store/simulator-store";

interface WritingSimulatorProps {
  placeholder?: string;
  minWords?: number;
  maxWords?: number;
  onChange?: (content: string, wordCount: number) => void;
}

export function WritingSimulator({
  placeholder = "Begin writing your response here...",
  minWords = 150,
  maxWords = 250,
  onChange,
}: WritingSimulatorProps) {
  const { content, wordCount, isLocked, setContent } = useSimulatorStore();

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newContent = e.target.value;
      setContent(newContent);
      onChange?.(newContent, useSimulatorStore.getState().wordCount);
    },
    [setContent, onChange]
  );

  const wordCountColor =
    wordCount < minWords
      ? "text-amber-600"
      : wordCount > maxWords
        ? "text-red-600"
        : "text-green-600";

  return (
    <div className="flex flex-col h-full bg-white border border-slate-300 rounded-lg overflow-hidden">
      <div className="flex-1 relative">
        <textarea
          value={content}
          onChange={handleChange}
          disabled={isLocked}
          placeholder={placeholder}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          className="simulator-textarea w-full h-full min-h-[400px] p-6 text-sm leading-relaxed resize-none focus:outline-none disabled:bg-slate-100 disabled:cursor-not-allowed"
          aria-label="Writing response"
        />
      </div>
      <div className="flex items-center justify-between px-4 py-3 bg-slate-100 border-t border-slate-300">
        <span className="text-xs text-slate-500">
          Spell check disabled — exam conditions
        </span>
        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500">
            Target: {minWords}–{maxWords} words
          </span>
          <span className={`font-mono font-semibold text-lg ${wordCountColor}`}>
            Words: {wordCount}
          </span>
        </div>
      </div>
    </div>
  );
}

interface StructuredWritingSimulatorProps {
  paragraphs: Array<{
    key: string;
    label: string;
    minWords: number;
    maxWords: number;
    hint: string;
  }>;
  onChange?: (content: string, wordCount: number, paragraphCounts: Record<string, number>) => void;
}

export function StructuredWritingSimulator({
  paragraphs,
  onChange,
}: StructuredWritingSimulatorProps) {
  const { paragraphContents, wordCount, isLocked, setParagraphContent } = useSimulatorStore();

  const handleParagraphChange = useCallback(
    (key: string, content: string) => {
      setParagraphContent(key, content);
      const state = useSimulatorStore.getState();
      const counts: Record<string, number> = {};
      for (const [k, v] of Object.entries(state.paragraphContents)) {
        counts[k] = v.trim().split(/\s+/).filter(Boolean).length;
      }
      onChange?.(state.content, state.wordCount, counts);
    },
    [setParagraphContent, onChange]
  );

  return (
    <div className="flex flex-col h-full gap-4">
      {paragraphs.map((para) => {
        const paraWordCount = (paragraphContents[para.key] || "")
          .trim()
          .split(/\s+/)
          .filter(Boolean).length;
        const inRange = paraWordCount >= para.minWords && paraWordCount <= para.maxWords;

        return (
          <div
            key={para.key}
            className="bg-white border border-slate-300 rounded-lg overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 bg-slate-100 border-b border-slate-300">
              <div>
                <h4 className="font-semibold text-sm text-ielts-navy">{para.label}</h4>
                <p className="text-xs text-slate-500">{para.hint}</p>
              </div>
              <span
                className={`font-mono text-sm font-medium ${
                  inRange ? "text-green-600" : "text-amber-600"
                }`}
              >
                {paraWordCount}/{para.minWords}–{para.maxWords}
              </span>
            </div>
            <textarea
              value={paragraphContents[para.key] || ""}
              onChange={(e) => handleParagraphChange(para.key, e.target.value)}
              disabled={isLocked}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="simulator-textarea w-full min-h-[120px] p-4 text-sm leading-relaxed resize-none focus:outline-none disabled:bg-slate-100"
              placeholder={`Write your ${para.label.toLowerCase()} here...`}
            />
          </div>
        );
      })}
      <div className="flex justify-end px-4 py-2 bg-slate-100 rounded-lg">
        <span className="font-mono font-semibold text-lg text-ielts-navy">
          Total Words: {wordCount}
        </span>
      </div>
    </div>
  );
}
