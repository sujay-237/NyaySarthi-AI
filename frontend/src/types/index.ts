export interface HealthRating {
  rating: string;
  justification: string;
}

export interface Clause {
  title: string;
  severity: "High" | "Medium" | "Low";
  explanation: string;
}

export interface SeverityCounts {
  high: number;
  medium: number;
  low: number;
}

export interface AnalysisResult {
  id: string;
  health: HealthRating;
  severity: SeverityCounts;
  next_steps: string[];
  summary: string;
  clauses: Clause[];
  full_text: string;
}

export interface ProviderInfo {
  id: Provider;
  name: string;
  models: string[];
  available: boolean;
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
}

export interface HistoryItem {
  id: string;
  title: string;
  date: string;
  response: AnalysisResult;
}

export type Language = "en" | "hi" | "bn" | "mr" | "ta" | "ml";
export type Provider = "gemini" | "groq" | "ollama";
export type Theme = "light" | "dark";
