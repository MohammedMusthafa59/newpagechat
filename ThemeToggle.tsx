import React from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function ThemeToggle({ darkMode, setDarkMode }: ThemeToggleProps) {
  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
      aria-label="Toggle visual theme"
    >
      {darkMode ? (
        <Sun id="sun-icon" className="w-5 h-5 text-amber-500" />
      ) : (
        <Moon id="moon-icon" className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
}
