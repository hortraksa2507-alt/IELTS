"use client";

import { useEffect, useCallback, useRef } from "react";
import { useSimulatorStore } from "@/store/simulator-store";

interface TestTimerProps {
  initialSeconds: number;
  onExpire: () => void;
  className?: string;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function TestTimer({ initialSeconds, onExpire, className = "" }: TestTimerProps) {
  const { timeRemaining, isFinalMinute, setTimeRemaining, setFinalMinute, setLocked } =
    useSimulatorStore();
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    setTimeRemaining(initialSeconds);
    setFinalMinute(false);
  }, [initialSeconds, setTimeRemaining, setFinalMinute]);

  const handleExpire = useCallback(() => {
    setLocked(true);
    onExpireRef.current();
  }, [setLocked]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleExpire();
      return;
    }

    const interval = setInterval(() => {
      const current = useSimulatorStore.getState().timeRemaining;
      const next = current - 1;

      if (next <= 60 && next > 0) {
        setFinalMinute(true);
      }

      if (next <= 0) {
        setTimeRemaining(0);
        handleExpire();
      } else {
        setTimeRemaining(next);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, setTimeRemaining, setFinalMinute, handleExpire]);

  const displayText = isFinalMinute
    ? "1 minute remaining"
    : formatTime(timeRemaining);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold ${
        isFinalMinute
          ? "bg-red-600 text-white timer-warning"
          : "bg-ielts-navy text-white"
      } ${className}`}
      role="timer"
      aria-live="polite"
    >
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>{displayText}</span>
    </div>
  );
}
