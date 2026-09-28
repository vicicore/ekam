"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/LanguageProvider";

export default function StateHeritageSection() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="setu-section-block setu-heritage-section" aria-labelledby="heritage-heading" style={{ background: "#ffffff", borderTop: "1px solid var(--setu-line)", borderBottom: "1px solid var(--setu-line)" }}>
      <div className="setu-wrap">
        <div style={{ maxWidth: "860px", margin: "0 auto", textAlign: "center" }}>
          <span className="setu-ink-kicker">{t("heritage_kicker")}</span>
          <h2 id="heritage-heading" style={{ fontSize: "1.75rem", color: "var(--setu-navy)", margin: "6px 0 12px" }}>
            {t("heritage_title")}
          </h2>
          <p className="setu-muted" style={{ fontSize: "0.92rem", lineHeight: "1.65", margin: "0 0 16px" }}>
            {t("heritage_lead")}
          </p>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
            className="setu-btn setu-btn-secondary"
            style={{
              fontSize: "0.82rem",
              padding: "6px 16px",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              margin: "0 auto",
            }}
          >
            <span>{expanded ? t("read_less") : t("read_more")}</span>
            <span style={{ transform: expanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
              ↓
            </span>
          </button>
        </div>

        {/* Expandable Archival Timeline Block */}
        {expanded && (
          <div
            className="setu-heritage-content"
            style={{
              marginTop: "28px",
              paddingTop: "24px",
              borderTop: "1px dashed var(--setu-line)",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Milestone 1 */}
            <article
              style={{
                background: "#fbfcfd",
                border: "1px solid var(--setu-line)",
                borderLeft: "4px solid var(--setu-saffron, #c47b16)",
                borderRadius: "var(--setu-radius, 6px)",
                padding: "16px 18px",
              }}
            >
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--setu-saffron, #c47b16)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                HISTORICAL MILESTONE
              </span>
              <h3 style={{ fontSize: "1rem", color: "var(--setu-navy)", margin: "6px 0 8px" }}>
                {t("history_1960_title")}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#475569", lineHeight: "1.55", margin: 0 }}>
                {t("history_1960_desc")}
              </p>
            </article>

            {/* Milestone 2 */}
            <article
              style={{
                background: "#fbfcfd",
                border: "1px solid var(--setu-line)",
                borderLeft: "4px solid var(--setu-blue, #163e63)",
                borderRadius: "var(--setu-radius, 6px)",
                padding: "16px 18px",
              }}
            >
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--setu-blue, #163e63)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                STATUTORY COMMITMENT
              </span>
              <h3 style={{ fontSize: "1rem", color: "var(--setu-navy)", margin: "6px 0 8px" }}>
                {t("history_rts_title")}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#475569", lineHeight: "1.55", margin: 0 }}>
                {t("history_rts_desc")}
              </p>
            </article>

            {/* Milestone 3 */}
            <article
              style={{
                background: "#fbfcfd",
                border: "1px solid var(--setu-line)",
                borderLeft: "4px solid var(--setu-green, #23764e)",
                borderRadius: "var(--setu-radius, 6px)",
                padding: "16px 18px",
              }}
            >
              <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "var(--setu-green, #23764e)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                DIGITAL TRANSFORMATION
              </span>
              <h3 style={{ fontSize: "1rem", color: "var(--setu-navy)", margin: "6px 0 8px" }}>
                {t("history_setu_title")}
              </h3>
              <p style={{ fontSize: "0.8rem", color: "#475569", lineHeight: "1.55", margin: 0 }}>
                {t("history_setu_desc")}
              </p>
            </article>
          </div>
        )}
      </div>
    </section>
  );
}
