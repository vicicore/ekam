"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApiError, JourneySummaryView, journeyApi } from "@/lib/api";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";

type Filter = "all" | "active" | "completed";

export default function JourneysPage() {
  const { t } = useLanguage();
  const { citizenId, token, isLoggedIn } = useAuth();
  const [journeys, setJourneys] = useState<JourneySummaryView[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!citizenId) return;
    try {
      setError(null);
      setJourneys(await journeyApi.listForCitizen(citizenId, token ?? undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    }
  }, [citizenId, token, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!journeys) return [];
    if (filter === "active") return journeys.filter((journey) => !journey.is_complete);
    if (filter === "completed") return journeys.filter((journey) => journey.is_complete);
    return journeys;
  }, [journeys, filter]);

  if (!isLoggedIn || !citizenId) {
    return (
      <main className="setu-container" style={{ padding: "48px 16px", minHeight: "75vh" }}>
        <div className="setu-breadcrumb" style={{ marginBottom: "20px" }}>
          <Link href="/" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>Home</Link>
          <span>/</span>
          <span>Application Tracker</span>
        </div>
        <section style={{
          background: "var(--setu-surface)",
          border: "1px solid var(--setu-border)",
          borderRadius: "var(--setu-radius-lg)",
          padding: "40px 24px",
          textAlign: "center",
          maxWidth: "540px",
          margin: "40px auto",
          boxShadow: "0 4px 20px rgba(16, 42, 67, 0.05)"
        }}>
          <div style={{ marginBottom: "16px" }}>
            <Image
              src="/ekam-official-logo.png"
              alt="एकम — सर्व सरकारी सेवाएँ • सर्व सरकारी प्रमाणपत्र एकाच ठिकाणी"
              width={180}
              height={180}
              priority
              style={{ margin: "0 auto", height: "auto", maxWidth: "180px" }}
            />
          </div>
          <p className="setu-section-kicker">APPLICATION TRACKER</p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--setu-navy)", margin: "8px 0 12px 0" }}>
            Sign In to Track Your Services
          </h1>
          <p style={{ fontSize: "0.95rem", color: "var(--setu-slate)", margin: "0 auto 24px auto", maxWidth: "420px", lineHeight: 1.5 }}>
            EKAM connects multiple departments, providing real-time status, document verification, and statutory SLA tracking in one place.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/login?redirect=/journeys" className="setu-btn setu-btn-primary">
              Log In to My EKAM →
            </Link>
            <Link href="/services" className="setu-btn setu-btn-secondary">
              Browse Services
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="setu-container" style={{ padding: "40px 16px 80px 16px" }}>
      <div className="setu-breadcrumb" style={{ marginBottom: "16px" }}>
        <Link href="/" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>{t("home")}</Link>
        <span>/</span>
        <Link href="/profile" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>{t("mySetu")}</Link>
        <span>/</span>
        <span>{t("journeys_hero_title")}</span>
      </div>

      <header className="setu-dashboard-header" style={{ marginBottom: "28px" }}>
        <div>
          <p className="setu-section-kicker">GOVERNMENT OF MAHARASHTRA • RTS</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--setu-navy)", margin: "4px 0 8px 0" }}>
            {t("journeys_hero_title")}
          </h1>
          <p style={{ color: "var(--setu-slate)", margin: 0, fontSize: "0.95rem" }}>
            {t("journeys_hero_desc")}
          </p>
        </div>
        <Link href="/services" className="setu-btn setu-btn-primary">
          {t("journeys_start_new")}
        </Link>
      </header>

      {error && <div className="setu-alert setu-alert-error">{error}</div>}

      <section className="setu-journey-summary-grid">
        <SummaryCard label={t("journeys_all")} value={journeys?.length ?? 0} />
        <SummaryCard label={t("journeys_in_progress")} value={journeys?.filter((j) => !j.is_complete).length ?? 0} />
        <SummaryCard label={t("journeys_completed")} value={journeys?.filter((j) => j.is_complete).length ?? 0} />
      </section>

      <div className="setu-filterbar" role="tablist" aria-label="Application filters">
        {(["all", "active", "completed"] as Filter[]).map((value) => (
          <button
            key={value}
            className={filter === value ? "is-active" : ""}
            onClick={() => setFilter(value)}
            role="tab"
            aria-selected={filter === value}
          >
            {value === "all" ? t("journeys_all") : value === "active" ? t("journeys_in_progress") : t("journeys_completed")}
          </button>
        ))}
      </div>

      {!journeys ? (
        <div className="setu-skeleton-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div className="setu-skeleton-card" key={index} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <section className="setu-section">
          <div className="setu-empty-state">
            <span className="setu-empty-mark">—</span>
            <strong>No applications in this view</strong>
            <p>Start a service journey and its progress will appear here.</p>
            <Link href="/services" className="setu-button setu-button-secondary">
              Discover services
            </Link>
          </div>
        </section>
      ) : (
        <div className="setu-journey-list">
          {filtered.map((journey) => (
            <Link
              key={journey.application_id}
              href={`/journeys/${journey.application_id}`}
              className="setu-journey-list-card"
            >
              <div className="setu-journey-card-main">
                <div className="setu-journey-card-number">EKAM</div>
                <div>
                  <span className="setu-eyebrow">SERVICE JOURNEY</span>
                  <h2>{journey.life_event_title_en}</h2>
                  <p>
                    Application {journey.application_id} · Started{" "}
                    {new Date(journey.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="setu-journey-card-status">
                <span
                  className={`setu-status ${
                    journey.is_complete ? "setu-status-success" : "setu-status-progress"
                  }`}
                >
                  {journey.is_complete ? "Completed" : "In progress"}
                </span>
                <span className="setu-card-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="setu-journey-summary-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
