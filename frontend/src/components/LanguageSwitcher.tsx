"use client";

import { useLanguage } from "@/lib/LanguageProvider";
import { Language } from "@/lib/translations";

export default function LanguageSwitcher() {
  const { language, setLanguage, labels, t } = useLanguage();

  return (
    <label className="setu-language-switcher">
      <span className="sr-only">{t("language")}</span>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        aria-label={t("language")}
      >
        {Object.entries(labels).map(([code, label]) => (
          <option key={code} value={code}>{label}</option>
        ))}
      </select>
    </label>
  );
}
