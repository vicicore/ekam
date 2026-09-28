"use client";

import { useLanguage } from "@/lib/LanguageProvider";
import { Language } from "@/lib/translations";

export default function LanguageSwitcher() {
  const { language, setLanguage, labels, t } = useLanguage();

  return (
    <div
      className="setu-lang-selector"
      role="group"
      aria-label={t("language")}
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.08)",
        borderRadius: "4px",
        padding: "2px",
        border: "1px solid rgba(255, 255, 255, 0.16)",
      }}
    >
      {(Object.entries(labels) as [Language, string][]).map(([code, label], idx, arr) => {
        const isActive = language === code;
        return (
          <div key={code} style={{ display: "inline-flex", alignItems: "center" }}>
            <button
              type="button"
              onClick={() => setLanguage(code)}
              aria-pressed={isActive}
              style={{
                background: isActive ? "var(--setu-saffron, #c47b16)" : "transparent",
                color: isActive ? "#ffffff" : "#dce5ec",
                border: 0,
                borderRadius: "3px",
                padding: "3px 8px",
                fontSize: "0.74rem",
                fontWeight: isActive ? 800 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
                whiteSpace: "nowrap",
                letterSpacing: "0.02em",
              }}
            >
              {label}
            </button>
            {idx < arr.length - 1 && (
              <span style={{ opacity: 0.3, padding: "0 2px", fontSize: "0.7rem", color: "#ffffff" }}>
                |
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
