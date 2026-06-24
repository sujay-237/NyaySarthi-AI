import { useState } from "react";
import { analyzeDocument, addHistoryItem } from "../services/api";
import { type AnalysisResult, type Language, type Provider } from "../types";

export function useAnalysis() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyze = async (
    text: string,
    files: File[],
    provider: Provider,
    model: string | null,
    language: Language
  ) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeDocument(text, files, provider, model, language);
      setResult(res);
      // Save to history
      const title = text.substring(0, 40).replace(/\s+/g, " ") + "...";
      await addHistoryItem({
        id: res.id,
        title: title || "Document Analysis",
        date: new Date().toISOString(),
        response: res,
      });
      return res;
    } catch (err: any) {
      setError(err.message || "Analysis failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setResult(null);
    setError(null);
  };

  return { result, loading, error, analyze, clear };
}
