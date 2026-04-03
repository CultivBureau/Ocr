import {
  useCallback,
  useRef,
  useState,
  type SetStateAction,
} from "react";
import type { SeparatedStructure } from "../types/ExtractTypes";

const MAX_STACK = 50;

export function cloneStructure(s: SeparatedStructure): SeparatedStructure {
  if (typeof structuredClone === "function") {
    try {
      return structuredClone(s);
    } catch {
      /* fall through */
    }
  }
  return JSON.parse(JSON.stringify(s)) as SeparatedStructure;
}

function structuresEqual(a: SeparatedStructure, b: SeparatedStructure): boolean {
  try {
    return JSON.stringify(a) === JSON.stringify(b);
  } catch {
    return false;
  }
}

/**
 * Document-level undo/redo for template JSON. Uses snapshots (bounded stack).
 * Use `setStructure` when replacing the whole document (load/restore); use
 * `setStructureWithUndo` for user edits so steps can be reversed.
 */
export function useDocumentStructureHistory(initial: SeparatedStructure) {
  const [structure, setStructure] = useState(initial);
  const undoStackRef = useRef<SeparatedStructure[]>([]);
  const redoStackRef = useRef<SeparatedStructure[]>([]);
  /** Bumps when stacks are cleared without a structure change (e.g. after load). */
  const [historyEpoch, setHistoryEpoch] = useState(0);

  const clearHistory = useCallback(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    setHistoryEpoch((e) => e + 1);
  }, []);

  const setStructureWithUndo = useCallback(
    (action: SetStateAction<SeparatedStructure>) => {
      setStructure((prev) => {
        const next =
          typeof action === "function"
            ? (action as (p: SeparatedStructure) => SeparatedStructure)(prev)
            : action;
        if (structuresEqual(prev, next)) {
          return prev;
        }
        undoStackRef.current.push(cloneStructure(prev));
        if (undoStackRef.current.length > MAX_STACK) {
          undoStackRef.current.shift();
        }
        redoStackRef.current = [];
        return next;
      });
    },
    []
  );

  const undo = useCallback(() => {
    setStructure((current) => {
      if (undoStackRef.current.length === 0) return current;
      redoStackRef.current.push(cloneStructure(current));
      if (redoStackRef.current.length > MAX_STACK) {
        redoStackRef.current.shift();
      }
      const previous = undoStackRef.current.pop()!;
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setStructure((current) => {
      if (redoStackRef.current.length === 0) return current;
      undoStackRef.current.push(cloneStructure(current));
      if (undoStackRef.current.length > MAX_STACK) {
        undoStackRef.current.shift();
      }
      const next = redoStackRef.current.pop()!;
      return next;
    });
  }, []);

  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

  return {
    structure,
    setStructure,
    setStructureWithUndo,
    clearHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    /** Include in deps when binding undo/redo UI so it updates after clearHistory. */
    historyEpoch,
  };
}
