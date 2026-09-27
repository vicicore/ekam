"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Language, languageLabels, t as translate } from "./translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
  labels: typeof languageLabels;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const stored = window.localStorage.getItem("setu-language") as Language | null;
    if (stored === "en" || stored === "hi" || stored === "mr") {
      setLanguageState(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("setu-language", language);
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage: (next: Language) => setLanguageState(next),
      t: (key: string) => translate(language, key),
      labels: languageLabels,
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
