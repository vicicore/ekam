"use client";

import LanguageSwitcher from "./LanguageSwitcher";
import { useLanguage } from "@/lib/LanguageProvider";

export default function Phase26LanguageBar() {
  const { t } = useLanguage();

  return (
    <div className="phase26-language-bar" role="region" aria-label={t("language")}>
      <span>{t("language")}</span>
      <LanguageSwitcher />
    </div>
  );
}
