import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark";
export type AccentKey = "sky" | "blue" | "violet" | "fuchsia" | "rose" | "orange" | "amber" | "emerald" | "teal" | "slate";

export const accentOptions: Array<{ key: AccentKey; label: string; color: string; soft: string }> = [
  { key: "sky", label: "Sky", color: "#0284c7", soft: "#e0f2fe" },
  { key: "blue", label: "Blue", color: "#2563eb", soft: "#dbeafe" },
  { key: "violet", label: "Violet", color: "#7c3aed", soft: "#ede9fe" },
  { key: "fuchsia", label: "Fuchsia", color: "#c026d3", soft: "#fae8ff" },
  { key: "rose", label: "Rose", color: "#e11d48", soft: "#ffe4e6" },
  { key: "orange", label: "Orange", color: "#ea580c", soft: "#ffedd5" },
  { key: "amber", label: "Amber", color: "#d97706", soft: "#fef3c7" },
  { key: "emerald", label: "Emerald", color: "#059669", soft: "#d1fae5" },
  { key: "teal", label: "Teal", color: "#0d9488", soft: "#ccfbf1" },
  { key: "slate", label: "Slate", color: "#475569", soft: "#e2e8f0" }
];

type ThemeContextValue = {
  mode: ThemeMode;
  accent: AccentKey;
  setAccent: (accent: AccentKey) => void;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const modeKey = "sdr-theme-mode";
const accentKey = "sdr-accent-color";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => (localStorage.getItem(modeKey) === "dark" ? "dark" : "light"));
  const [accent, setAccentState] = useState<AccentKey>(() => {
    const saved = localStorage.getItem(accentKey) as AccentKey | null;
    return accentOptions.some((option) => option.key === saved) ? saved! : "sky";
  });

  useEffect(() => {
    localStorage.setItem(modeKey, mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  useEffect(() => {
    const option = accentOptions.find((item) => item.key === accent) ?? accentOptions[0];
    localStorage.setItem(accentKey, accent);
    document.documentElement.style.setProperty("--accent", option.color);
    document.documentElement.style.setProperty("--accent-soft", option.soft);
  }, [accent]);

  const value = useMemo(
    () => ({
      mode,
      accent,
      setAccent: setAccentState,
      toggleMode: () => setMode((current) => (current === "light" ? "dark" : "light"))
    }),
    [accent, mode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
