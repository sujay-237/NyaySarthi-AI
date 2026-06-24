import { History, Scale, Sun, Moon } from "lucide-react";
import { type Language, type Theme } from "../types";
import { t } from "../utils/i18n";

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  toggleTheme: () => void;
  onToggleHistory: () => void;
}

const languages: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "bn", label: "বাংলা" },
  { value: "mr", label: "मराठी" },
  { value: "ta", label: "தமிழ்" },
  { value: "ml", label: "മലയാളം" },
];

export default function Header({ language, setLanguage, theme, toggleTheme, onToggleHistory }: HeaderProps) {
  return (
    <div className="flex-shrink-0">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleHistory}
            className="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 rounded-lg p-2.5 transition"
            title="History"
          >
            <History className="w-6 h-6" />
          </button>
          <Scale className="w-10 h-10 text-[#0d3d56] dark:text-[#48a9a6] hidden sm:block" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">
              {t(language, "title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">{t(language, "subtitle")}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 self-end sm:self-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-white/50 dark:bg-gray-800/50 border border-gray-300/50 dark:border-gray-700/50 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 block p-2 transition"
          >
            {languages.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
          <button
            onClick={toggleTheme}
            className="relative text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 rounded-lg text-sm p-2.5 w-10 h-10 flex items-center justify-center transition"
          >
            {theme === "light" ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
          </button>
        </div>
      </div>
      <p className="text-sm text-center text-gray-500 dark:text-gray-500 mb-4 italic">
        "பூரணம் ஞானம் சிறியது, பச்சாத்தாபம் துன்பகாரணம்।"
      </p>
    </div>
  );
}
