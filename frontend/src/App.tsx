import { useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useLanguage } from "./hooks/useLanguage";
import { useAnalysis } from "./hooks/useAnalysis";
import { useChat } from "./hooks/useChat";
import { fetchProviders, fetchHistory, clearHistory, deleteHistoryItem } from "./services/api";
import { type ProviderInfo, type HistoryItem, type Provider } from "./types";
import ThreeBackground from "./components/ThreeBackground";
import Header from "./components/Header";
import HeroInput from "./components/HeroInput";
import ResultsView from "./components/ResultsView";
import Sidebar from "./components/Sidebar";

function App() {
  const { theme, toggle } = useTheme();
  const { language, setLanguage } = useLanguage();
  const { result, loading, error, analyze, clear: clearAnalysis } = useAnalysis();
  const { messages, loading: chatLoading, sendMessage, clear: clearChat } = useChat();

  const [provider, setProvider] = useState<Provider>("gemini");
  const [model, setModel] = useState<string | null>(null);
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useState(() => {
    fetchProviders().then(setProviders).catch(console.error);
  });

  useState(() => {
    fetchHistory().then(setHistory).catch(console.error);
  });

  const handleAnalyze = async (text: string, files: File[]) => {
    clearChat();
    await analyze(text, files, provider, model, language);
  };

  const handleChat = (message: string) => {
    if (result) {
      sendMessage(message, result.full_text, provider, model, language);
    }
  };

  const handleNewAnalysis = () => {
    clearAnalysis();
    clearChat();
  };

  const handleSelectHistory = (_item: HistoryItem) => {
    clearAnalysis();
    clearChat();
    setSidebarOpen(false);
  };

  const handleClearHistory = async () => {
    await clearHistory();
    setHistory([]);
  };

  const handleDeleteHistoryItem = async (id: string) => {
    await deleteHistoryItem(id);
    setHistory((prev) => prev.filter((h) => h.id !== id));
  };

  const showResults = result !== null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased overflow-hidden flex">
      <ThreeBackground />

      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        history={history}
        language={language}
        onSelectItem={handleSelectHistory}
        onClear={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        {/* Top bar */}
        <Header
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          toggleTheme={toggle}
          onToggleSidebar={() => setSidebarOpen(true)}
          showResults={showResults}
          onNewAnalysis={handleNewAnalysis}
        />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          {!showResults && !loading && (
            <HeroInput
              language={language}
              provider={provider}
              setProvider={setProvider}
              model={model}
              setModel={setModel}
              providers={providers}
              onAnalyze={handleAnalyze}
              loading={loading}
              error={error}
            />
          )}

          {(showResults || loading) && (
            <ResultsView
              result={result}
              language={language}
              provider={provider}
              model={model}
              loading={loading}
              messages={messages}
              chatLoading={chatLoading}
              onChat={handleChat}
              onNewAnalysis={handleNewAnalysis}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
