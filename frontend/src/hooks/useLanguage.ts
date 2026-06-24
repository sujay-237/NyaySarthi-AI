import { useState, useEffect } from "react";
import type { Language } from "../types";

export function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("nyay-language");
    if (saved && ["en", "hi", "bn", "mr", "ta", "ml"].includes(saved)) {
      return saved as Language;
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("nyay-language", language);
    document.documentElement.lang = language;
  }, [language]);

  return { language, setLanguage };
}
