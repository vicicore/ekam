"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { assistantApi } from "@/lib/assistantApi";

type Message = {
  role: "user" | "assistant";
  text: string;
  sources?: { title: string; route?: string | null }[];
  actions?: { label: string; route: string }[];
};

const prompts = [
  "How do I track my application?",
  "Where can I find my documents?",
  "Tell me about government schemes.",
  "How can I register a grievance?",
  "Find Maharashtra services.",
];

export default function AssistantPage() {
  const [language, setLanguage] = useState<"en" | "hi" | "mr">("en");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hello. I can help you navigate SETU services, schemes, documents, applications, grievances and Maharashtra service information.",
    },
  ]);

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
      <section className="assistant-hero">
        <div>
          <span className="assistant-kicker">SETU ASSISTANT</span>
          <h1>Find your way through SETU.</h1>
          <p>
            Ask about services, schemes, documents, applications, grievances,
            or Maharashtra service navigation.
          </p>
        </div>
        <label className="assistant-language">
          Language
          <select value={language} onChange={(e) => setLanguage(e.target.value as any)}>
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>
        </label>
      </section>

      <section className="assistant-shell">
        <div className="assistant-prompts">
          {prompts.map((prompt) => (
            <button key={prompt} onClick={() => setInput(prompt)}>{prompt}</button>
          ))}
        </div>

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

        <form className="assistant-composer" onSubmit={send}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a SETU question..."
            aria-label="Ask SETU Assistant"
          />
          <button type="submit" disabled={loading || !input.trim()}>
            {loading ? "Checking…" : "Ask SETU"}
          </button>
        </form>

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
