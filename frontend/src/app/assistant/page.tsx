"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
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
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello. I can help you navigate SETU services, schemes, documents, applications, grievances and Maharashtra service information.",
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

  async function send(e?: FormEvent) {
    e?.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

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
        { role: "assistant", text: "The SETU Assistant is temporarily unavailable. Please use the service navigation directly." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="assistant-page">
      <section className="assistant-shell">
        {/* 1. SETU Assistant Header / Introduction */}
        <header className="assistant-header">
          <span className="assistant-kicker">SETU ASSISTANT</span>
          <h1 className="assistant-title">{t("qa_assistant_title")}</h1>
          <p className="assistant-intro">{t("assistant_hero_desc")}</p>
        </header>

        {/* 2. Ask SETU Area (Primary Interaction) */}
        <form className="assistant-composer" onSubmit={send}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("assistant_placeholder")}
            aria-label="Ask SETU Assistant"
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? t("loading") : t("assistant_ask_btn")}
          </button>
        </form>

        {/* 3. Suggested Questions (Clean Quick-Action Chips Below Input) */}
        <div className="assistant-suggestions">
          <span className="assistant-suggestions-label">{t("assistant_suggested_label")}:</span>
          <div className="assistant-prompts">
            {prompts.map((prompt) => (
              <button key={prompt} type="button" onClick={() => setInput(prompt)}>{prompt}</button>
            ))}
          </div>
        </div>

        {/* 4. Existing Assistant Content / Response Area */}
        <div className="assistant-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`assistant-message ${message.role}`} key={`${message.role}-${index}`}>
              <div className="assistant-message__role">
                {message.role === "assistant" ? "SETU Assistant" : "You"}
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

          {loading && <div className="assistant-typing">SETU is checking its knowledge base…</div>}
        </div>

        {/* 5. Notice */}
        <div className="assistant-notice">
          SETU Assistant answers are grounded only in the configured SETU
          knowledge base. Always verify eligibility, official requirements and
          deadlines with the relevant authoritative government source before
          acting.
        </div>
      </section>
    </main>
  );
}
