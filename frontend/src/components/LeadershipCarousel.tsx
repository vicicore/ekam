"use client";

import { useEffect, useRef, useState } from "react";
import { GOVERNMENT_LEADERSHIP, LeaderRecord } from "@/lib/leadershipCatalog";
import { useLanguage } from "@/lib/LanguageProvider";

export default function LeadershipCarousel() {
  const { t } = useLanguage();
  const [selectedLeader, setSelectedLeader] = useState<LeaderRecord | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedLeader(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="setu-section-block setu-leadership-section" aria-labelledby="leadership-heading">
      <div className="setu-section-head">
        <div>
          <span className="setu-ink-kicker">{t("leadership_kicker")}</span>
          <h2 id="leadership-heading">{t("leadership_title")}</h2>
          <p className="setu-muted" style={{ margin: "4px 0 0", maxWidth: "680px" }}>
            {t("leadership_desc")}
          </p>
        </div>
        <div className="setu-carousel-controls" aria-label="Carousel navigation">
          <button
            type="button"
            onClick={() => handleScroll("left")}
            aria-label="Previous leadership card"
            className="setu-carousel-arrow"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid var(--setu-line)",
              background: "#ffffff",
              cursor: "pointer",
              display: "inline-grid",
              placeItems: "center",
              marginRight: "6px",
              color: "var(--setu-navy)",
            }}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => handleScroll("right")}
            aria-label="Next leadership card"
            className="setu-carousel-arrow"
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "1px solid var(--setu-line)",
              background: "#ffffff",
              cursor: "pointer",
              display: "inline-grid",
              placeItems: "center",
              color: "var(--setu-navy)",
            }}
          >
            →
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="setu-leadership-track"
        role="region"
        aria-label="Council of Ministers profiles"
        style={{
          display: "flex",
          gap: "16px",
          overflowX: "auto",
          paddingBottom: "12px",
          scrollSnapType: "x mandatory",
          scrollbarWidth: "thin",
        }}
      >
        {GOVERNMENT_LEADERSHIP.map((official) => (
          <article
            key={official.id}
            className="setu-leader-card"
            onClick={() => setSelectedLeader(official)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedLeader(official);
              }
            }}
            style={{
              flex: "0 0 280px",
              scrollSnapAlign: "start",
              background: "#ffffff",
              border: "1px solid var(--setu-line)",
              borderRadius: "var(--setu-radius, 8px)",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              cursor: "pointer",
              transition: "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
              borderTop: "3px solid var(--setu-blue)",
              position: "relative",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                <div
                  className="setu-official-avatar"
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "var(--setu-navy)",
                    color: "#ffffff",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: "0.9rem",
                    border: "2px solid var(--setu-saffron, #c47b16)",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {official.initials}
                </div>
                <span className="setu-status setu-status-progress" style={{ fontSize: "0.68rem" }}>
                  {official.roleBadge}
                </span>
              </div>

              <h3 style={{ margin: "14px 0 2px", fontSize: "1.02rem", color: "var(--setu-navy)" }}>
                {official.name}
              </h3>
              <p style={{ margin: "0 0 4px", fontSize: "0.78rem", fontWeight: 700, color: "var(--setu-saffron, #c47b16)" }}>
                {official.designation}
              </p>
              <p style={{ margin: "0 0 8px", fontSize: "0.74rem", color: "var(--setu-muted)", fontWeight: 600 }}>
                {official.department}
              </p>
              <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: "1.45", color: "#374151" }}>
                {official.responsibility.length > 95
                  ? official.responsibility.slice(0, 95) + "…"
                  : official.responsibility}
              </p>
            </div>

            <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "var(--setu-saffron, #c47b16)" }}>
                {t("view_profile_btn")}
              </span>
              <span style={{ fontSize: "0.9rem", color: "var(--setu-saffron, #c47b16)" }}>→</span>
            </div>
          </article>
        ))}
      </div>

      {/* Official Profile Modal */}
      {selectedLeader && (
        <div
          className="setu-modal-backdrop"
          onClick={() => setSelectedLeader(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="leader-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11, 31, 51, 0.65)",
            backdropFilter: "blur(3px)",
            display: "grid",
            placeItems: "center",
            padding: "16px",
            zIndex: 100,
          }}
        >
          <div
            className="setu-modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(560px, 100%)",
              background: "#ffffff",
              borderRadius: "12px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--setu-line)",
              overflow: "hidden",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, var(--setu-navy), var(--setu-blue))",
                color: "#ffffff",
                padding: "24px",
                position: "relative",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedLeader(null)}
                aria-label="Close leader profile modal"
                style={{
                  position: "absolute",
                  top: "16px",
                  right: "16px",
                  background: "rgba(255, 255, 255, 0.15)",
                  border: 0,
                  color: "#ffffff",
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                ×
              </button>

              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "2px solid #e4a23b",
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    flexShrink: 0,
                  }}
                >
                  {selectedLeader.initials}
                </div>
                <div>
                  <span style={{ fontSize: "0.72rem", letterSpacing: "0.08em", fontWeight: 700, color: "#f2c36d", textTransform: "uppercase" }}>
                    {selectedLeader.roleBadge}
                  </span>
                  <h3 id="leader-modal-title" style={{ margin: "4px 0 2px", fontSize: "1.3rem", color: "#ffffff" }}>
                    {selectedLeader.name}
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "#e2ecf5", opacity: 0.9 }}>
                    {selectedLeader.designation} · {selectedLeader.department}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "grid", gap: "16px", fontSize: "0.85rem" }}>
              <div>
                <strong style={{ display: "block", color: "var(--setu-navy)", marginBottom: "4px", fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {t("leader_resp_label")}
                </strong>
                <p style={{ margin: 0, color: "#374151", lineHeight: 1.55 }}>
                  {selectedLeader.responsibility}
                </p>
              </div>

              <div>
                <strong style={{ display: "block", color: "var(--setu-navy)", marginBottom: "4px", fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {t("leader_office_label")}
                </strong>
                <p style={{ margin: 0, color: "#374151", lineHeight: 1.5 }}>
                  🏛️ {selectedLeader.office}
                </p>
              </div>

              {selectedLeader.coordinatingServices && selectedLeader.coordinatingServices.length > 0 && (
                <div>
                  <strong style={{ display: "block", color: "var(--setu-navy)", marginBottom: "6px", fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {t("leader_services_label")}
                  </strong>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {selectedLeader.coordinatingServices.map((srv) => (
                      <span
                        key={srv}
                        style={{
                          background: "#f1f5f9",
                          border: "1px solid var(--setu-line)",
                          borderRadius: "4px",
                          padding: "3px 8px",
                          fontSize: "0.76rem",
                          color: "var(--setu-navy)",
                          fontWeight: 600,
                        }}
                      >
                        ✓ {srv}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: "8px", paddingTop: "16px", borderTop: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                <a
                  href={selectedLeader.officialPortal}
                  target="_blank"
                  rel="noreferrer"
                  className="setu-btn setu-btn-primary"
                  style={{ fontSize: "0.82rem", textDecoration: "none" }}
                >
                  {t("leader_portal_btn")}
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedLeader(null)}
                  className="setu-btn setu-btn-secondary"
                  style={{ fontSize: "0.82rem" }}
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
