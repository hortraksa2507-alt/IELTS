import { create } from "zustand";

interface SimulatorState {
  content: string;
  wordCount: number;
  isLocked: boolean;
  timeRemaining: number;
  isFinalMinute: boolean;
  highlights: Array<{ id: string; start: number; end: number; color: string }>;
  notes: Array<{ id: string; text: string; position: number }>;
  paragraphContents: Record<string, string>;

  setContent: (content: string) => void;
  setParagraphContent: (key: string, content: string) => void;
  setLocked: (locked: boolean) => void;
  setTimeRemaining: (seconds: number) => void;
  setFinalMinute: (isFinal: boolean) => void;
  addHighlight: (highlight: { id: string; start: number; end: number; color: string }) => void;
  removeHighlight: (id: string) => void;
  addNote: (note: { id: string; text: string; position: number }) => void;
  reset: () => void;
}

function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

const initialState = {
  content: "",
  wordCount: 0,
  isLocked: false,
  timeRemaining: 0,
  isFinalMinute: false,
  highlights: [] as SimulatorState["highlights"],
  notes: [] as SimulatorState["notes"],
  paragraphContents: {} as Record<string, string>,
};

export const useSimulatorStore = create<SimulatorState>((set) => ({
  ...initialState,

  setContent: (content) =>
    set({ content, wordCount: countWords(content) }),

  setParagraphContent: (key, content) =>
    set((state) => {
      const paragraphContents = { ...state.paragraphContents, [key]: content };
      const allContent = Object.values(paragraphContents).join("\n\n");
      return {
        paragraphContents,
        content: allContent,
        wordCount: countWords(allContent),
      };
    }),

  setLocked: (locked) => set({ isLocked: locked }),
  setTimeRemaining: (seconds) => set({ timeRemaining: seconds }),
  setFinalMinute: (isFinal) => set({ isFinalMinute: isFinal }),

  addHighlight: (highlight) =>
    set((state) => ({ highlights: [...state.highlights, highlight] })),

  removeHighlight: (id) =>
    set((state) => ({
      highlights: state.highlights.filter((h) => h.id !== id),
    })),

  addNote: (note) =>
    set((state) => ({ notes: [...state.notes, note] })),

  reset: () => set(initialState),
}));

export { countWords };
