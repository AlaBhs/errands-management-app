import { useState } from "react";

export type ViewMode = "table" | "card";

export function useViewMode(key = "requests-view-mode"): [ViewMode, (m: ViewMode) => void] {
  const [mode, setMode] = useState<ViewMode>(() => {
    const saved = localStorage.getItem(key);
    return saved === "card" ? "card" : "table";
  });

  const set = (m: ViewMode) => {
    localStorage.setItem(key, m);
    setMode(m);
  };

  return [mode, set];
}