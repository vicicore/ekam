"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/LanguageProvider";
import { MessageSquareText } from "lucide-react";

export default function FloatingAssistantButton() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const isAssistantPage = pathname === "/assistant";
  const assistantTitle = t("qa_assistant_title") || "EKAM Assistant";

  return (
    <aside
      className="setu-floating-assistant"
      aria-label="EKAM Assistant quick access"
    >
      <Link
        href="/assistant"
        className={`setu-floating-assistant-btn ${isAssistantPage ? "is-active" : ""}`}
        aria-label="Open EKAM Assistant"
        title={assistantTitle}
        aria-current={isAssistantPage ? "page" : undefined}
      >
        <MessageSquareText size={22} className="setu-floating-assistant-icon" aria-hidden="true" />
        <span className="setu-floating-assistant-badge" aria-hidden="true" />
      </Link>
      <span className="setu-floating-assistant-tooltip" role="tooltip">
        {assistantTitle}
      </span>
    </aside>
  );
}
