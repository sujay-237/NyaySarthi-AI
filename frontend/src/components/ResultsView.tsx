import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, Activity, ListTodo, Shield, CheckCircle, AlertTriangle, Clock, Send, MessageCircle, User, Bot, Plus, HelpCircle, Mail } from "lucide-react";
import { type AnalysisResult, type ChatMessage, type Language, type Provider } from "../types";
import { sendChatMessage } from "../services/api";

interface ResultsViewProps {
  result: AnalysisResult | null;
  language: Language;
  provider: Provider;
  model: string | null;
  loading: boolean;
  messages: ChatMessage[];
  chatLoading: boolean;
  onChat: (message: string) => void;
  onNewAnalysis: () => void;
}

function SeverityBadge({ count, severity }: { count: number; severity: string }) {
  if (count === 0) return null;
  const colors = {
    High: "bg-red-500/20 text-red-700 dark:text-red-300",
    Medium: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
    Low: "bg-green-500/20 text-green-700 dark:text-green-300",
  };
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${colors[severity as keyof typeof colors]}`}>
      <span className="font-bold">{count}</span>
      <span>{severity}</span>
    </div>
  );
}

function ClauseItem({ clause, provider, model, context, language }: any) {
  const [whyVisible, setWhyVisible] = useState(false);
  const [whyText, setWhyText] = useState("");
  const [loadingWhy, setLoadingWhy] = useState(false);

  const color =
    clause.severity === "High"
      ? "border-red-300 dark:border-red-700/50 bg-red-50/50 dark:bg-red-900/20"
      : clause.severity === "Medium"
      ? "border-yellow-300 dark:border-yellow-700/50 bg-yellow-50/50 dark:bg-yellow-900/20"
      : "border-green-300 dark:border-green-700/50 bg-green-50/50 dark:bg-green-900/20";

  const handleAskWhy = async () => {
    if (whyVisible) {
      setWhyVisible(false);
      return;
    }
    setWhyVisible(true);
    setWhyText("Explaining significance...");
    setLoadingWhy(true);
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
    } finally {
      setLoadingWhy(false);
    }
  };

  const handleEmail = () => {
    const subject = `Query regarding legal clause: ${clause.title}`;
    const body = `Clause Title: ${clause.title}\n\nExplanation:\n${clause.explanation}\n\n`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-xl border ${color} backdrop-blur-md`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                clause.severity === "High"
                  ? "bg-red-500 text-white"
                  : clause.severity === "Medium"
                  ? "bg-yellow-500 text-white"
                  : "bg-green-500 text-white"
              }`}
            >
              {clause.severity}
            </span>
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">{clause.title}</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{clause.explanation}</p>

          {whyVisible && (
            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Why it matters:</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{loadingWhy ? "Thinking..." : whyText}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleAskWhy}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <HelpCircle className="w-3 h-3" />
          {whyVisible ? "Hide" : "Why?"}
        </button>
        <button
          onClick={handleEmail}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          <Mail className="w-3 h-3" />
          Email
        </button>
      </div>
    </motion.div>
  );
}

export default function ResultsView({
  result,
  language,
  provider,
  model,
  loading,
  messages,
  chatLoading,
  onChat,
  onNewAnalysis,
}: ResultsViewProps) {
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    onChat(chatInput.trim());
    setChatInput("");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Analyzing your document...</p>
      </div>
    );
  }

  if (!result) return null;

  const healthIcon = result.health.rating.toLowerCase().includes("good")
    ? <CheckCircle className="w-6 h-6 text-green-500" />
    : result.health.rating.toLowerCase().includes("caution")
    ? <AlertTriangle className="w-6 h-6 text-red-500" />
    : <Clock className="w-6 h-6 text-yellow-500" />;

  const healthColor = result.health.rating.toLowerCase().includes("good")
    ? "bg-green-500/10 border-green-300/50 dark:border-green-700/30"
    : result.health.rating.toLowerCase().includes("caution")
    ? "bg-red-500/10 border-red-300/50 dark:border-red-700/30"
    : "bg-yellow-500/10 border-yellow-300/50 dark:border-yellow-700/30";

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 pb-24">
      {/* Top actions */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-blue-500" />
          Analysis Report
        </h1>
        <button
          onClick={onNewAnalysis}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      {/* Health Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-5 rounded-xl border ${healthColor} backdrop-blur-md mb-6`}
      >
        <div className="flex items-center gap-3">
          {healthIcon}
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{result.health.rating}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{result.health.justification}</p>
          </div>
        </div>
      </motion.div>

      {/* Severity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-3 mb-6"
      >
        <Shield className="w-5 h-5 text-gray-400" />
        <SeverityBadge count={result.severity.high} severity="High" />
        <SeverityBadge count={result.severity.medium} severity="Medium" />
        <SeverityBadge count={result.severity.low} severity="Low" />
      </motion.div>

      {/* Next Steps */}
      {result.next_steps.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-green-500" />
            Next Steps
          </h2>
          <div className="space-y-2">
            {result.next_steps.map((step, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-md">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold mt-0.5">
                  {i + 1}
                </div>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-500" />
          Summary
        </h2>
        <div className="p-5 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 dark:border-white/5">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{result.summary}</p>
        </div>
      </motion.div>

      {/* Clauses */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-6"
      >
        <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-500" />
          Key Clauses
        </h2>
        <div className="space-y-3">
          {result.clauses.map((clause, i) => (
            <ClauseItem
              key={i}
              clause={clause}
              provider={provider}
              model={model}
              context={result.full_text}
              language={language}
            />
          ))}
        </div>
      </motion.div>

      {/* Chat */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <h2 className="text-lg font-bold mb-3 text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-500" />
          Ask a Follow-up
        </h2>
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/5 p-4">
          <div className="h-48 overflow-y-auto mb-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-md p-3 flex items-start gap-2 ${
                    msg.role === "user"
                      ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm"
                  }`}
                >
                  {msg.role === "ai" ? <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" /> : <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                  <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
                </div>
              </div>
            ))}
            {chatLoading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
              <div className="flex justify-start">
                <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    <span className="text-sm text-gray-500">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleChatSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about specific terms, dates, or obligations..."
              className="flex-grow p-3 bg-white/70 dark:bg-gray-700/70 rounded-xl border border-gray-200/50 dark:border-gray-600/50 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="bg-blue-600 text-white rounded-xl p-3 hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
