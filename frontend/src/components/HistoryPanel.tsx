import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock } from "lucide-react";
import { type HistoryItem, type Language } from "../types";
import { t } from "../utils/i18n";

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  language: Language;
  onSelectItem: (item: HistoryItem) => void;
  onClear: () => void;
  onDeleteItem: (id: string) => void;
}

export default function HistoryPanel({
  isOpen,
  onClose,
  history,
  language,
  onSelectItem,
  onClear,
  onDeleteItem,
}: HistoryPanelProps) {
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-30"
            onClick={onClose}
          />
        )}
      </AnimatePresence>
      <motion.div
        className="fixed top-0 left-0 w-full max-w-sm h-full bg-white dark:bg-gray-800 shadow-2xl z-40 p-6 flex flex-col"
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t(language, "historyTitle")}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white text-3xl leading-none"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto pr-2 space-y-3">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 text-sm">{t(language, "noHistory")}</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="history-item p-3 rounded-lg bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer flex justify-between items-start group"
                onClick={() => onSelectItem(item)}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(item.date).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteItem(item.id);
                  }}
                  className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
        <button
          onClick={onClear}
          className="mt-4 w-full bg-red-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300 transition-colors flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          {t(language, "clearHistory")}
        </button>
      </motion.div>
    </>
  );
}
