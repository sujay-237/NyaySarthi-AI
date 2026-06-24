import { useState, useRef, useCallback } from "react";
import { Upload, X, Mic, MicOff, Zap, MessageSquare, Shield } from "lucide-react";
import { type Language, type Provider } from "../types";
import { t } from "../utils/i18n";
import ProviderSelector from "./ProviderSelector";

interface DocumentInputProps {
  language: Language;
  provider: Provider;
  setProvider: (p: Provider) => void;
  model: string | null;
  setModel: (m: string | null) => void;
  providers: { id: Provider; name: string; models: string[]; available: boolean }[];
  onAnalyze: (text: string, files: File[]) => void;
  loading: boolean;
}

export default function DocumentInput({
  language,
  provider,
  setProvider,
  model,
  setModel,
  providers,
  onAnalyze,
  loading,
}: DocumentInputProps) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [listening, setListening] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const valid = newFiles.filter((f) =>
        [".txt", ".pdf", ".png", ".jpg", ".jpeg"].some((ext) =>
          f.name.toLowerCase().endsWith(ext)
        )
      );
      setFiles((prev) => [...prev, ...valid]);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVoice = useCallback(() => {
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
  }, [language, listening]);

  const handleAnalyze = () => {
    if (!text.trim() && files.length === 0) return;
    onAnalyze(text, files);
  };

  const handleClear = () => {
    setText("");
    setFiles([]);
  };

  return (
    <div className="w-full md:w-1/2 p-4 sm:p-8 flex flex-col border-r border-gray-200/50 dark:border-gray-700/50">
      <div className="flex-grow flex flex-col min-h-0 overflow-y-auto pr-2">
        <div className="my-4 border-t border-b border-gray-200/50 dark:border-gray-700/50 py-4 space-y-4 flex-shrink-0">
          <ul className="space-y-3 text-gray-700 dark:text-gray-300 text-sm">
            <li className="flex items-center space-x-3">
              <Zap className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{t(language, "feature1")}</span>
            </li>
            <li className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{t(language, "feature2")}</span>
            </li>
            <li className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span>{t(language, "feature3")}</span>
            </li>
          </ul>
          <div className="flex items-start space-x-3 text-xs text-gray-500 dark:text-gray-400 p-3 bg-gray-500/10 rounded-lg">
            <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p>{t(language, "security")}</p>
          </div>
        </div>

        <ProviderSelector
          language={language}
          provider={provider}
          setProvider={setProvider}
          model={model}
          setModel={setModel}
          providers={providers}
        />

        <div className="relative flex-grow flex flex-col min-h-0 mt-4">
          <button
            onClick={handleClear}
            title={t(language, "clear")}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t(language, "pastePlaceholder")}
            className="w-full flex-grow p-4 border border-gray-300/50 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-300 text-sm bg-white/50 dark:bg-gray-800/50 dark:border-gray-700/50 dark:placeholder-gray-400 dark:text-white"
          />
        </div>
      </div>

      <div className="flex-shrink-0 mt-4">
        <div className="flex items-center justify-center space-x-4">
          <label className="cursor-pointer flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
            <Upload className="w-6 h-6" />
            <span>{t(language, "uploadFile")}</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".txt,.pdf,.png,.jpg,.jpeg"
            multiple
            onChange={handleFileSelect}
          />
          <button
            onClick={handleVoice}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              listening
                ? "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300"
                : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {listening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{listening ? t(language, "stopListening") : t(language, "voiceInput")}</span>
          </button>
        </div>

        {files.length > 0 && (
          <div className="mt-2 space-y-2 max-h-20 overflow-y-auto">
            {files.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-gray-500/10 p-2 rounded-md text-sm"
              >
                <span className="truncate pr-2">{file.name}</span>
                <button
                  onClick={() => removeFile(idx)}
                  className="text-red-500 hover:text-red-700 dark:hover:text-red-400 flex-shrink-0 font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleAnalyze}
          disabled={loading || (!text.trim() && files.length === 0)}
          className="mt-4 w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-transform transform hover:scale-105 duration-300 shadow-lg dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 flex items-center justify-center space-x-2 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:scale-100 disabled:cursor-not-allowed"
        >
          <Zap className="w-5 h-5" />
          <span>{loading ? t(language, "analyzing") : t(language, "demystifyBtn")}</span>
        </button>
      </div>
    </div>
  );
}
