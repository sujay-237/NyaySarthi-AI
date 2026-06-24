import { motion } from "framer-motion";
import { FileText, Activity, ListTodo, Shield } from "lucide-react";
import { type AnalysisResult, type Language, type Provider } from "../types";
import { t } from "../utils/i18n";
import HealthCard from "./HealthCard";
import ClauseCard from "./ClauseCard";
import ExportButtons from "./ExportButtons";

interface AnalysisPanelProps {
  result: AnalysisResult;
  language: Language;
  provider: Provider;
  model: string | null;
}

export default function AnalysisPanel({ result, language, provider, model }: AnalysisPanelProps) {
  return (
    <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col bg-gray-50/60 dark:bg-black/20 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col space-y-6"
      >
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-500" />
            {t(language, "analysisReport")}
          </h2>
          <ExportButtons result={result} language={language} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold mb-2 text-gray-800 dark:text-gray-200 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {t(language, "healthTitle")}
            </h2>
            <HealthCard health={result.health} />
          </div>
          <div>
            <div className="flex items-baseline space-x-3">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {t(language, "severityTitle")}
              </h2>
              <div className="flex items-center space-x-3">
                {result.severity.high > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-red-600 dark:text-red-400">{result.severity.high}</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t(language, "severityHigh")}</span>
                  </div>
                )}
                {result.severity.medium > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-yellow-600 dark:text-yellow-400">{result.severity.medium}</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t(language, "severityMedium")}</span>
                  </div>
                )}
                {result.severity.low > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-lg text-green-600 dark:text-green-400">{result.severity.low}</span>
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{t(language, "severityLow")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {result.next_steps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-3 text-green-700 dark:text-green-400 flex items-center gap-2">
              <ListTodo className="w-6 h-6" />
              {t(language, "nextStepsTitle")}
            </h2>
            <ul className="space-y-3">
              {result.next_steps.map((step, i) => (
                <li key={i} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center mt-0.5">
                    <span className="text-white text-xs font-bold">{i + 1}</span>
                  </div>
                  <span className="text-gray-600 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-3 text-blue-700 dark:text-blue-400 flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {t(language, "summaryTitle")}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed bg-blue-500/10 p-4 rounded-lg">
            {result.summary}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold mb-3 text-purple-700 dark:text-purple-400 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            {t(language, "clausesTitle")}
          </h2>
          <div className="space-y-4">
            {result.clauses.length > 0 ? (
              result.clauses.map((clause, i) => (
                <ClauseCard
                  key={i}
                  clause={clause}
                  language={language}
                  provider={provider}
                  model={model}
                  context={result.full_text}
                />
              ))
            ) : (
              <p className="text-gray-500">{t(language, "noClauses")}</p>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
