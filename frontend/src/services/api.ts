import { type AnalysisResult, type ProviderInfo, type Language, type Provider, type HistoryItem } from "../types";

const API_BASE = "";

export async function analyzeDocument(
  text: string,
  files: File[],
  provider: Provider,
  model: string | null,
  language: Language
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("text", text);
  formData.append("provider", provider);
  if (model) formData.append("model", model);
  formData.append("language", language);
  files.forEach((f) => formData.append("files", f));

  const resp = await fetch(`${API_BASE}/api/analyze`, {
    method: "POST",
    body: formData,
  });
  if (!resp.ok) {
    const err = await resp.json();
    throw new Error(err.detail || "Analysis failed");
  }
  return resp.json();
}

export async function fetchProviders(): Promise<ProviderInfo[]> {
  const resp = await fetch(`${API_BASE}/api/providers`);
  if (!resp.ok) throw new Error("Failed to fetch providers");
  const data = await resp.json();
  return data.providers;
}

export async function sendChatMessage(
  message: string,
  context: string,
  provider: Provider,
  model: string | null,
  language: Language,
  onChunk: (chunk: string) => void
): Promise<void> {
  const params = new URLSearchParams();
  params.append("message", message);
  params.append("context", context);
  params.append("provider", provider);
  if (model) params.append("model", model);
  params.append("language", language);

  const resp = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!resp.ok) throw new Error("Chat failed");
  if (!resp.body) throw new Error("No response body");

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          const data = JSON.parse(line.slice(6));
          if (data.chunk) onChunk(data.chunk);
        } catch {
          // ignore malformed lines
        }
      }
    }
  }
}

export async function fetchHistory(): Promise<HistoryItem[]> {
  const resp = await fetch(`${API_BASE}/api/history`);
  if (!resp.ok) throw new Error("Failed to fetch history");
  return resp.json();
}

export async function addHistoryItem(item: HistoryItem): Promise<void> {
  await fetch(`${API_BASE}/api/history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item),
  });
}

export async function clearHistory(): Promise<void> {
  await fetch(`${API_BASE}/api/history`, { method: "DELETE" });
}

export async function deleteHistoryItem(id: string): Promise<void> {
  await fetch(`${API_BASE}/api/history/${id}`, { method: "DELETE" });
}
