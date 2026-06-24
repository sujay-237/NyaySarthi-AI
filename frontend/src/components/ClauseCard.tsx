import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, RotateCcw, HelpCircle, Mail, ChevronUp } from "lucide-react";
import { type Clause, type Language } from "../types";
import { t } from "../utils/i18n";
import { sendChatMessage } from "../services/api";

interface ClauseCardProps {
  clause: Clause;
  language: Language;
  provider: any;
  model: string | null;
  context: string;
}

export default function ClauseCard({ clause, language, provider, model, context }: ClauseCardProps) {
  const [explanation, setExplanation] = useState(clause.explanation);
  const [whyVisible, setWhyVisible] = useState(false);
  const [whyText, setWhyText] = useState("");
  const [loading, setLoading] = useState(false);

  const colorClasses =
    clause.severity === "High"
      ? "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300"
      : clause.severity === "Medium"
      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300"
      : "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300";

  const handleReExplain = async () => {
    setLoading(true);
    try {
      let result = "";
      await sendChatMessage(
        `Re-explain the clause "${clause.title}" in a different, simpler way.`,
        context,
        provider,
        model,
        language,
        (chunk) => { result += chunk; }
      );
      setExplanation(result);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleAskWhy = async () => {
    if (whyVisible) {
      setWhyVisible(false);
      return;
    }
    setWhyVisible(true);
    setWhyText("Explaining significance...");
    try {
      let result = "";
      await sendChatMessage(
        `Why is the clause "${clause.title}" important? What are its implications?`,
        context,
        provider,
        model,
        language,
        (chunk) => { result += chunk; }
      );
      setWhyText(result);
    } catch {
      setWhyText("Could not generate explanation.");
    }
  };

  const handleEmail = () => {
    const subject = `Query regarding legal clause: ${clause.title}`;
    const body = `Hello,\n\nClause Title: ${clause.title}\n\nExplanation:\n${explanation}\n\nThank you.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white/60 dark:bg-gray-800/60 p-5 border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-sm flex flex-col"
    >
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
          <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <div className="flex-grow">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-purple-800 dark:text-purple-300">{clause.title}</h4>
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${colorClasses}`}>
              {clause.severity}
            </span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm leading-relaxed">{explanation}</p>
          {whyVisible && (
            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">Why it's important:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{whyText}</p>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 flex items-center space-x-2">
        <button
          onClick={handleReExplain}
          disabled={loading}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t(language, "reExplain")}</span>
        </button>
        <button
          onClick={handleAskWhy}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700"
        >
          {whyVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <HelpCircle className="w-3.5 h-3.5" />}
          <span>{t(language, "askWhy")}</span>
        </button>
        <button
          onClick={handleEmail}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700/50 dark:hover:bg-gray-700"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>{t(language, "emailClause")}</span>
        </button>
      </div>
    </motion.div>
  );
}
