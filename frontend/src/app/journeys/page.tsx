"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
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
      <main className="setu-page">
        <section className="setu-login-panel">
          <p className="setu-eyebrow">APPLICATIONS</p>
          <h1>Sign in to track your services</h1>
          <p>SETU keeps your service journeys, department stages and application progress together.</p>
          <Link href="/login" className="setu-button setu-button-primary">
            Log in to SETU
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="setu-page">
      <header className="setu-dashboard-header">
        <div>
          <p className="setu-eyebrow">MY SETU</p>
          <h1>Application Tracker</h1>
          <p>Follow every service journey from submission through completion.</p>
        </div>
        <Link href="/services" className="setu-button setu-button-primary">
          Start a new service
        </Link>
      </header>

      {error && <div className="setu-alert setu-alert-error">{error}</div>}

      <section className="setu-journey-summary-grid">
        <SummaryCard label="All applications" value={journeys?.length ?? 0} />
        <SummaryCard label="In progress" value={journeys?.filter((j) => !j.is_complete).length ?? 0} />
        <SummaryCard label="Completed" value={journeys?.filter((j) => j.is_complete).length ?? 0} />
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
            {value === "all" ? "All" : value === "active" ? "In progress" : "Completed"}
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
                <div className="setu-journey-card-number">SETU</div>
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
