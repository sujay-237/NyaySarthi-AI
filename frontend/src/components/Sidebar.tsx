import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Clock, Scale } from "lucide-react";
import { type HistoryItem, type Language } from "../types";
import { t } from "../utils/i18n";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  language: Language;
  onSelectItem: (item: HistoryItem) => void;
  onClear: () => void;
  onDeleteItem: (id: string) => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  history,
  language,
  onSelectItem,
  onClear,
  onDeleteItem,
}: SidebarProps) {
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
        className="fixed top-0 left-0 w-72 h-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl shadow-2xl z-40 flex flex-col border-r border-white/20 dark:border-white/5"
        animate={{ x: isOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#0d3d56] dark:text-[#48a9a6]" />
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">History</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {history.length === 0 ? (
            <p className="text-center text-gray-500 text-sm mt-8">{t(language, "noHistory")}</p>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 cursor-pointer group transition"
                onClick={() => onSelectItem(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 dark:text-gray-200 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="text-gray-400 hover:text-red-500 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-3 border-t border-gray-200/50 dark:border-gray-700/50">
            <button
              onClick={onClear}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            >
              <Trash2 className="w-4 h-4" />
              Clear History
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}
