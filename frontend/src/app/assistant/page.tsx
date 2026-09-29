"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { assistantApi } from "@/lib/assistantApi";
import { useLanguage } from "@/lib/LanguageProvider";
import "./assistant.css";

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: { title: string; route?: string | null }[];
  actions?: { label: string; route: string }[];
};

export default function AssistantPage() {
  const { language, t } = useLanguage();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const interactionAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello. I can help you navigate EKAM services, schemes, documents, applications, grievances and Maharashtra service information.",
    },
  ]);

  const prompts = useMemo(
    () => [
      t("assistant_prompt_track"),
      t("assistant_prompt_docs"),
      t("assistant_prompt_schemes"),
      t("assistant_prompt_grievance"),
      t("assistant_prompt_services"),
      t("assistant_prompt_caste"),
    ],
    [t],
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        interactionAreaRef.current &&
        !interactionAreaRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setShowSuggestions(false);
    setMessages((m) => [...m, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    try {
      const result = await assistantApi.ask(message, language);
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: result.answer,
          sources: result.sources,
          actions: result.suggested_actions,
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "The EKAM Assistant is temporarily unavailable. Please use the service navigation directly." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="assistant-page">
      <section className="assistant-shell">
        {/* 1. EKAM Assistant Header / Introduction */}
        <header className="assistant-header" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <Image
              src="/ekam-emblem.png"
              alt="EKAM Emblem"
              width={36}
              height={36}
              priority
              style={{ width: "36px", height: "36px", objectFit: "contain" }}
            />
            <span className="assistant-kicker">EKAM ASSISTANT</span>
          </div>
          <h1 className="assistant-title">{t("qa_assistant_title")}</h1>
          <p className="assistant-intro">{t("assistant_hero_desc")}</p>
        </header>

        {/* 2. Bot Response / Assistant Conversation Area (Above Input) */}
        <div className="assistant-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}>
              <div className="assistant-message__role">
                {message.role === "assistant" ? "EKAM Assistant" : "You"}
              </div>
              <div className="assistant-message__text">{message.text}</div>

              {message.sources?.length ? (
                <div className="assistant-sources">
                  <strong>Sources</strong>
                  {message.sources.map((source) => (
                    source.route ? (
                      <Link key={source.title} href={source.route}>{source.title} →</Link>
                    ) : <span key={source.title}>{source.title}</span>
                  ))}
                </div>
              ) : null}

              {message.actions?.length ? (
                <div className="assistant-actions">
                  {message.actions.map((action) => (
                    <Link href={action.route} key={action.label}>{action.label}</Link>
                  ))}
                </div>
              ) : null}
            </div>
          ))}

          {loading && <div className="assistant-typing">EKAM is checking its knowledge base…</div>}
        </div>

        {/* 3. Primary Input Area (Below Response) */}
        <div
          ref={interactionAreaRef}
          className="assistant-interaction-area"
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowSuggestions(false);
          }}
        >
          <form className="assistant-composer" onSubmit={send}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onClick={() => setShowSuggestions(true)}
              placeholder={t("assistant_placeholder")}
              aria-label="Ask EKAM Assistant"
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? t("loading") : t("assistant_ask_btn")}
            </button>
          </form>

          {/* 4. Suggested Questions (Shown only after clicking / focusing input) */}
          {showSuggestions && (
            <div className="assistant-suggestions">
              <span className="assistant-suggestions-label">{t("assistant_suggested_label")}:</span>
              <div className="assistant-prompts">
                {prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      inputRef.current?.focus();
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5. Grounded Advisory Notice */}
        <div className="assistant-notice">
          EKAM Assistant answers are grounded only in the configured EKAM
          knowledge base. Always verify eligibility, official requirements and
          deadlines with the relevant authoritative government source before
          acting.
        </div>
      </section>
    </main>
  );
}
