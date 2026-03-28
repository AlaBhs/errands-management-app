import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const saved = localStorage.getItem("ey-theme") as Theme | null;
    if (saved === "light" || saved === "dark") return saved;
    // Fall back to system preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("ey-theme", theme);
  }, [theme]);

  const toggle = () =>
    setTheme(prev => prev === "light" ? "dark" : "light");

  return { theme, toggle, isDark: theme === "dark" };
}