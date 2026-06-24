import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle, User, Bot } from "lucide-react";
import { type ChatMessage as ChatMessageType, type Language } from "../types";
import { t } from "../utils/i18n";

interface ChatPanelProps {
  messages: ChatMessageType[];
  loading: boolean;
  onSend: (message: string) => void;
  language: Language;
}

export default function ChatPanel({ messages, loading, onSend, language }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input.trim());
    setInput("");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border-t border-gray-200/50 dark:border-gray-700/50 pt-6"
    >
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        {t(language, "chatTitle")}
      </h3>
      <div className="h-48 overflow-y-auto mb-4 space-y-4 p-2 bg-white/30 dark:bg-gray-800/30 rounded-lg">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs lg:max-w-md p-3 flex items-start gap-2 ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-2xl rounded-br-sm"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-2xl rounded-bl-sm"
              }`}
            >
              {msg.role === "ai" ? (
                <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
              ) : (
                <User className="w-4 h-4 mt-0.5 flex-shrink-0" />
              )}
              <span className="text-sm whitespace-pre-wrap">{msg.content}</span>
            </div>
          </div>
        ))}
        {loading && messages.length > 0 && messages[messages.length - 1].role === "user" && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-2xl rounded-bl-sm animate-pulse">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4" />
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(language, "chatPlaceholder")}
          className="flex-grow p-3 border border-gray-300/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 dark:text-white rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-300"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 transition-transform transform hover:scale-110 duration-300 flex-shrink-0 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </motion.div>
  );
}
