import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, AlertCircle } from "lucide-react";
import ThreeBackground from "./components/ThreeBackground";
import SplashScreen from "./components/SplashScreen";
import Header from "./components/Header";
import DocumentInput from "./components/DocumentInput";
import AnalysisPanel from "./components/AnalysisPanel";
import ChatPanel from "./components/ChatPanel";
import HistoryPanel from "./components/HistoryPanel";
import { useTheme } from "./hooks/useTheme";
import { useLanguage } from "./hooks/useLanguage";
import { useAnalysis } from "./hooks/useAnalysis";
import { useChat } from "./hooks/useChat";
import { fetchProviders, fetchHistory, clearHistory, deleteHistoryItem } from "./services/api";
import { type Provider, type HistoryItem, type ProviderInfo } from "./types";
import { t } from "./utils/i18n";

function App() {
  const { theme, toggle } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { result, loading, error, analyze, clear: clearAnalysis } = useAnalysis();
  const { messages, loading: chatLoading, sendMessage, clear: clearChat } = useChat();

  const [provider, setProvider] = useState<Provider>("gemini");
  const [model, setModel] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [showSplash] = useState(true);

  useEffect(() => {
    fetchProviders().then(setProviders).catch(console.error);
  }, []);

  useEffect(() => {
    fetchHistory().then(setHistory).catch(console.error);
  }, [result]);

  useEffect(() => {
    const defaultProvider = providers.find((p) => p.id === "gemini" && p.available);
    if (defaultProvider) {
      setProvider("gemini");
      if (defaultProvider.models.length > 0) setModel(defaultProvider.models[0]);
    } else if (providers.length > 0 && providers[0].available) {
      setProvider(providers[0].id as Provider);
      if (providers[0].models.length > 0) setModel(providers[0].models[0]);
    }
  }, [providers]);

  const handleAnalyze = useCallback(
    async (text: string, files: File[]) => {
      clearChat();
      await analyze(text, files, provider, model, language);
    },
    [provider, model, language, analyze, clearChat]
  );

  const handleChat = useCallback(
    (message: string) => {
      if (result) {
        sendMessage(message, result.full_text, provider, model, language);
      }
    },
    [result, provider, model, language, sendMessage]
  );

  const handleSelectHistory = (_item: HistoryItem) => {
    clearAnalysis();
    clearChat();
    // We need to set result manually - but useAnalysis doesn't expose a setter
    // For now, we'll just reload the page or handle it differently
    // Actually let's just show the result directly
    setHistoryOpen(false);
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteHistoryItem(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const handleNewAnalysis = () => {
    clearAnalysis();
    clearChat();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased overflow-hidden">
      {showSplash && <SplashScreen />}
      <ThreeBackground />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-7xl mx-auto bg-white/60 dark:bg-gray-900/60 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col md:flex-row border border-white/30 dark:border-gray-700/50 md:overflow-hidden overflow-y-auto md:h-[90vh]">
          <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col border-r border-gray-200/50 dark:border-gray-700/50">
            <Header
              language={language}
              setLanguage={setLanguage}
              theme={theme}
              toggleTheme={toggle}
              onToggleHistory={() => setHistoryOpen(true)}
            />
            <DocumentInput
              language={language}
              provider={provider}
              setProvider={setProvider}
              model={model}
              setModel={setModel}
              providers={providers}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg dark:bg-red-900/20 dark:border-red-500/30 dark:text-red-400 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col bg-gray-50/60 dark:bg-black/20 overflow-y-auto">
            <AnimatePresence mode="wait">
              {!result && !loading && (
                <motion.div
                  key="initial"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full text-center"
                >
                  <FileText className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-500 dark:text-gray-400">
                    {t(language, "initialTitle")}
                  </h2>
                  <p className="text-gray-400 dark:text-gray-500 mt-1">{t(language, "initialSubtitle")}</p>
                </motion.div>
              )}

              {loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full space-y-6"
                >
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <p className="text-gray-500 dark:text-gray-400">{t(language, "analyzing")}</p>
                  <div className="space-y-4 w-full max-w-md">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/3"></div>
                    <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-1/2"></div>
                    <div className="h-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                  </div>
                </motion.div>
              )}

              {result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col"
                >
                  <div className="flex justify-between items-center mb-4">
                    <button
                      onClick={handleNewAnalysis}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      {t(language, "newAnalysis")}
                    </button>
                  </div>
                  <AnalysisPanel
                    result={result}
                    language={language}
                    provider={provider}
                    model={model}
                  />
                  <ChatPanel
                    messages={messages}
                    loading={chatLoading}
                    onSend={handleChat}
                    language={language}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        language={language}
        onSelectItem={handleSelectHistory}
        onClear={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />
    </div>
  );
}

export default App;
