"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SERVICE_CATALOG, SERVICE_CATEGORIES, ServiceRecord } from "@/lib/serviceCatalog";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";
import { DocumentView, LifeEventSummary, citizenApi, journeyApi, lifeEventApi } from "@/lib/api";

function ServicesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const { citizenId, token, isLoggedIn } = useAuth();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [lifeEvents, setLifeEvents] = useState<LifeEventSummary[] | null>(null);
  const [userDocs, setUserDocs] = useState<DocumentView[] | null>(null);
  const [startingCode, setStartingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load life events & citizen documents if logged in
  useEffect(() => {
    lifeEventApi.list().then(setLifeEvents).catch(() => {});
    if (citizenId && token) {
      citizenApi.getDocuments(citizenId, token).then(setUserDocs).catch(() => {});
    }
  }, [citizenId, token]);

  // Synchronize search params if query changes in URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q !== null && q !== query) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuery(q);
    }
  }, [searchParams, query]);

  // Filter services by category, query (searching name, department, category, purpose, eligibility)
  const filteredServices = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICE_CATALOG.filter((service) => {
      const matchesCategory = selectedCategory === "All" || service.category.toLowerCase() === selectedCategory.toLowerCase();
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = `${service.name} ${service.department} ${service.category} ${service.purpose} ${service.whoCanApply} ${service.eligibilityCriteria.join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [query, selectedCategory]);

  const handleStartLifeEvent = async (code: string) => {
    if (!isLoggedIn || !citizenId) {
      router.push("/login");
      return;
    }
    setStartingCode(code);
    setError(null);
    try {
      const journey = await journeyApi.start(citizenId, code, token ?? undefined);
      router.push(`/journeys/${journey.application_id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to initiate service journey");
      setStartingCode(null);
    }
  };

  return (
    <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "36px 0 60px" }}>
      {/* Header / Hero */}
      <header style={{ marginBottom: "28px" }}>
        <div className="setu-breadcrumb" style={{ fontSize: "0.8rem", color: "var(--setu-muted)", marginBottom: "8px" }}>
          <Link href="/" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>{t("home")}</Link>
          <span style={{ margin: "0 6px" }}>/</span>
          <strong>{t("services")}</strong>
        </div>
        <span className="setu-ink-kicker">{t("services_kicker")}</span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "var(--setu-navy)", margin: "4px 0 8px" }}>
          {t("services_hero_title")}
        </h1>
        <p className="setu-muted" style={{ maxWidth: "760px", margin: 0, fontSize: "0.95rem", lineHeight: "1.6" }}>
          {t("services_hero_desc")}
        </p>
      </header>

      {error && (
        <div className="setu-alert setu-alert-error" role="alert" style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Multi-Department Life Event Connected Journeys Banner */}
      {lifeEvents && lifeEvents.length > 0 && (
        <section aria-labelledby="life-events-title" style={{ background: "#ffffff", border: "1px solid var(--setu-line)", borderLeft: "4px solid var(--setu-blue)", padding: "20px", borderRadius: "var(--setu-radius)", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "12px" }}>
            <div>
              <span className="setu-status setu-status-progress" style={{ marginBottom: "6px" }}>
                {t("services_connected_badge")}
              </span>
              <h2 id="life-events-title" style={{ margin: "4px 0 2px", fontSize: "1.2rem", color: "var(--setu-navy)" }}>
                {t("services_multi_life_events")}
              </h2>
              <p className="setu-muted" style={{ margin: 0, fontSize: "0.84rem" }}>
                {t("services_multi_desc")}
              </p>
            </div>
            {!isLoggedIn && (
              <Link href="/login" className="setu-btn setu-btn-secondary" style={{ fontSize: "0.78rem" }}>
                {t("services_signin_to_start")}
              </Link>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px", marginTop: "12px" }}>
            {lifeEvents.map((evt) => (
              <div
                key={evt.code}
                style={{
                  padding: "16px",
                  background: "#f8fafc",
                  border: "1px solid var(--setu-line)",
                  borderRadius: "var(--setu-radius)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <strong style={{ fontSize: "1rem", color: "var(--setu-navy)" }}>{evt.title_en}</strong>
                  <p style={{ margin: "6px 0 12px", fontSize: "0.8rem", color: "var(--setu-muted)", lineHeight: "1.5" }}>
                    {evt.description_en}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleStartLifeEvent(evt.code)}
                  disabled={startingCode === evt.code}
                  className="setu-btn setu-btn-primary"
                  style={{ width: "100%", fontSize: "0.8rem" }}
                >
                  {startingCode === evt.code ? t("loading") : t("services_start_journey")}
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Goal Search Bar & Category Filters */}
      <section aria-label="Service Filters" style={{ marginBottom: "24px" }}>
        <div className="setu-searchbar">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("services_search_placeholder")}
            aria-label="Search citizen services"
          />
          {query && (
            <button
              type="button"
              className="setu-btn setu-btn-secondary"
              onClick={() => setQuery("")}
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="setu-filter-chips" role="tablist" aria-label="Service Categories">
          {SERVICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={selectedCategory === cat}
              className={selectedCategory === cat ? "is-active" : ""}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Services Result Grid */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "1.25rem", color: "var(--setu-navy)", margin: 0 }}>
          {t("services_available_heading")} ({filteredServices.length})
        </h2>
        <span style={{ fontSize: "0.8rem", color: "var(--setu-muted)" }}>
          {t("services_verified_sub")}
        </span>
      </div>

      {filteredServices.length === 0 ? (
        <div className="setu-panel" style={{ textAlign: "center", padding: "48px 20px" }}>
          <strong style={{ fontSize: "1.1rem", color: "var(--setu-navy)" }}>{t("services_no_match")}</strong>
          <p className="setu-muted" style={{ margin: "8px 0 16px" }}>
            {t("services_try_broader")}
          </p>
          <button
            type="button"
            className="setu-btn setu-btn-secondary"
            onClick={() => {
              setQuery("");
              setSelectedCategory("All");
            }}
          >
            {t("services_reset_filters")}
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {filteredServices.map((service) => {
            // Count how many required docs are already in user's vault
            const verifiedCount = userDocs
              ? service.requiredDocuments.filter((req) =>
                  userDocs.some((d) => (d.doc_type === req.docType || d.doc_type.includes(req.docType)) && d.status === "verified")
                ).length
              : null;

            return (
              <article
                key={service.id}
                style={{
                  background: "#ffffff",
                  border: "1px solid var(--setu-line)",
                  borderRadius: "var(--setu-radius)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "var(--setu-shadow)",
                  transition: "transform 140ms ease, border-color 140ms ease",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <span className="setu-status setu-status-progress" style={{ fontSize: "0.68rem" }}>
                      {service.category}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--setu-muted)", fontWeight: 700 }}>
                      SLA: ~{service.slaDays} Days
                    </span>
                  </div>

                  <h3 style={{ margin: "0 0 6px", fontSize: "1.15rem", color: "var(--setu-navy)" }}>
                    <Link href={`/services/${service.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {service.name}
                    </Link>
                  </h3>

                  <p style={{ margin: "0 0 10px", fontSize: "0.76rem", color: "var(--setu-saffron)", fontWeight: 700 }}>
                    {service.department}
                  </p>

                  <p style={{ margin: "0 0 14px", fontSize: "0.82rem", color: "#475569", lineHeight: "1.55" }}>
                    {service.purpose.length > 150 ? `${service.purpose.slice(0, 146)}…` : service.purpose}
                  </p>

                  {/* Requirements & Vault Reuse Indication */}
                  <div style={{ padding: "10px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)", fontSize: "0.75rem", marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                      <strong style={{ color: "var(--setu-navy)" }}>{t("requiredDocuments")} ({service.requiredDocuments.length}):</strong>
                      {verifiedCount !== null && (
                        <span style={{ color: verifiedCount === service.requiredDocuments.length ? "var(--setu-green)" : "var(--setu-saffron)", fontWeight: 700 }}>
                          {verifiedCount}/{service.requiredDocuments.length} {t("services_in_vault")}
                        </span>
                      )}
                    </div>
                    <ul style={{ margin: 0, paddingLeft: "16px", color: "var(--setu-muted)", lineHeight: "1.5" }}>
                      {service.requiredDocuments.slice(0, 2).map((d) => (
                        <li key={d.name}>{d.name}</li>
                      ))}
                      {service.requiredDocuments.length > 2 && (
                        <li>+{service.requiredDocuments.length - 2} more document(s)</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #edf2f7" }}>
                  <Link href={`/services/${service.id}`} className="setu-btn setu-btn-primary" style={{ flex: 1, fontSize: "0.8rem" }}>
                    {t("services_view_details")}
                  </Link>
                  {service.relatedLifeEvent && (
                    <button
                      type="button"
                      onClick={() => handleStartLifeEvent(service.relatedLifeEvent!)}
                      className="setu-btn setu-btn-secondary"
                      style={{ fontSize: "0.8rem" }}
                      title="Start complete connected journey"
                    >
                      Start
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense
      fallback={
        <div className="setu-container" style={{ padding: "60px 0", textAlign: "center" }}>
          <div className="setu-loading-spinner" />
          <p style={{ marginTop: "16px", color: "var(--setu-slate)" }}>Loading SETU Services Directory…</p>
        </div>
      }
    >
      <ServicesContent />
    </Suspense>
  );
}
