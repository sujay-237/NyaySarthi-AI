import { useState } from "react";
import { sendChatMessage } from "../services/api";
import { type ChatMessage, type Language, type Provider } from "../types";

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (
    message: string,
    context: string,
    provider: Provider,
    model: string | null,
    language: Language
  ) => {
    setLoading(true);
    const userMsg: ChatMessage = { role: "user", content: message };
    setMessages((prev) => [...prev, userMsg]);

    let aiContent = "";
    const aiMsg: ChatMessage = { role: "ai", content: "" };
    setMessages((prev) => [...prev, aiMsg]);

    try {
      await sendChatMessage(
        message,
        context,
        provider,
        model,
        language,
        (chunk) => {
          aiContent += chunk;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "ai", content: aiContent };
            return updated;
          });
        }
      );
    } catch (err: any) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "ai",
          content: "Sorry, I couldn't process that. Please try again.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setMessages([]);

  return { messages, loading, sendMessage, clear };
}
