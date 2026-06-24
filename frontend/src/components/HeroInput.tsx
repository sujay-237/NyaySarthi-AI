import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Zap, Mic, MicOff, AlertCircle, X } from "lucide-react";
import { type Language, type Provider } from "../types";
import { t } from "../utils/i18n";

interface HeroInputProps {
  language: Language;
  provider: Provider;
  setProvider: (p: Provider) => void;
  model: string | null;
  setModel: (m: string | null) => void;
  providers: { id: Provider; name: string; models: string[]; available: boolean }[];
  onAnalyze: (text: string, files: File[]) => void;
  loading: boolean;
  error: string | null;
}

export default function HeroInput({
  language,
  provider,
  setProvider,
  model,
  setModel,
  providers,
  onAnalyze,
  loading,
  error,
}: HeroInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [listening, setListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedProvider = providers.find((p) => p.id === provider);
  const models = selectedProvider?.models || [];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).filter((f) =>
        [".txt", ".pdf", ".png", ".jpg", ".jpeg"].some((ext) =>
          f.name.toLowerCase().endsWith(ext)
        )
      );
      setFiles((prev) => [...prev, ...newFiles]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t(language, "listenError"));
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-US" : language === "hi" ? "hi-IN" : "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    if (!listening) {
      setListening(true);
      recognition.start();
      recognition.onresult = (event: any) => {
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
        }
        if (final) setText((prev) => prev + " " + final);
      };
      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);
    } else {
      recognition.stop();
      setListening(false);
    }
  };

  const handleAnalyze = () => {
    if (!text.trim() && files.length === 0) return;
    onAnalyze(text, files);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl"
      >
        {/* Provider bar */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full px-4 py-2 border border-white/20 dark:border-white/10">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">AI</span>
            <select
              value={provider}
              onChange={(e) => {
                const p = e.target.value as Provider;
                setProvider(p);
                const prov = providers.find((pr) => pr.id === p);
                if (prov && prov.models.length > 0) setModel(prov.models[0]);
              }}
              className="bg-transparent text-sm font-medium text-gray-800 dark:text-gray-200 focus:outline-none cursor-pointer"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id} disabled={!p.available}>
                  {p.name} {!p.available ? "✗" : ""}
                </option>
              ))}
            </select>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <select
              value={model || ""}
              onChange={(e) => setModel(e.target.value || null)}
              className="bg-transparent text-sm text-gray-600 dark:text-gray-400 focus:outline-none cursor-pointer"
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleVoice}
            className={`p-2.5 rounded-full transition-colors ${
              listening
                ? "bg-red-500 text-white"
                : "bg-white/60 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 border border-white/20 dark:border-white/10"
            }`}
            title={listening ? t(language, "stopListening") : t(language, "voiceInput")}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* Main input card */}
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-white/30 dark:border-white/10 shadow-xl p-1">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t(language, "pastePlaceholder")}
            className="w-full min-h-[200px] max-h-[400px] p-5 bg-transparent resize-none focus:outline-none text-gray-800 dark:text-gray-100 text-base placeholder-gray-400 dark:placeholder-gray-500"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleAnalyze();
              }
            }}
          />

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 pb-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-1.5 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">Upload</span>
                {files.length > 0 && (
                  <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {files.length}
                  </span>
                )}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".txt,.pdf,.png,.jpg,.jpeg"
                multiple
                onChange={handleFileSelect}
              />

              {files.length > 0 && (
                <div className="flex items-center gap-1">
                  {files.map((file, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700/50 px-2 py-1 rounded-md text-xs text-gray-600 dark:text-gray-300"
                    >
                      <span className="max-w-[100px] truncate">{file.name}</span>
                      <button onClick={() => removeFile(idx)} className="text-gray-400 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || (!text.trim() && files.length === 0)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600 text-white font-medium px-5 py-2.5 rounded-xl transition-all hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
            >
              <Zap className="w-4 h-4" />
              {loading ? "Analyzing..." : "Analyze"}
            </button>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-red-100/80 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-300 rounded-xl flex items-center gap-2 text-sm backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
