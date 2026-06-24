import { History, Scale, Sun, Moon, Plus } from "lucide-react";
import { type Language, type Theme } from "../types";

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  onToggleSidebar: () => void;
  showResults: boolean;
  onNewAnalysis: () => void;
}

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "hi", label: "HI" },
  { value: "bn", label: "BN" },
  { value: "mr", label: "MR" },
  { value: "ta", label: "TA" },
  { value: "ml", label: "ML" },
];

export default function Header({
  language,
  setLanguage,
  theme,
  toggleTheme,
  onToggleSidebar,
  showResults,
  onNewAnalysis,
}: HeaderProps) {
  return (
    <div className="flex-shrink-0 h-14 px-4 sm:px-6 flex items-center justify-between border-b border-white/10 dark:border-white/5 backdrop-blur-md bg-white/40 dark:bg-gray-900/40">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition"
          title="History"
        >
          <History className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Scale className="w-6 h-6 text-[#0d3d56] dark:text-[#48a9a6]" />
          <span className="text-lg font-bold text-gray-900 dark:text-white">NyaySarthi AI</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {showResults && (
          <button
            onClick={onNewAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        )}
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700/50 text-gray-900 dark:text-white text-sm rounded-lg p-1.5 transition"
        >
          {languages.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-200/50 dark:text-gray-400 dark:hover:bg-gray-800/50 transition"
        >
          {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
