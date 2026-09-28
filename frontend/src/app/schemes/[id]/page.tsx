 "use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { SCHEME_CATALOG } from "@/lib/schemeCatalog";
import { useAuth } from "@/lib/useAuth";
import { journeyApi } from "@/lib/api";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageProvider";

export default function SchemeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { citizenId, token, isLoggedIn } = useAuth();
  const [starting, setStarting] = useState(false);

  const schemeId = String(params.id);
  const scheme = SCHEME_CATALOG.find((s) => s.id === schemeId);

  const handleStartJourney = async (lifeEventCode: string) => {
    if (!isLoggedIn || !citizenId) {
      router.push("/login");
      return;
    }
    setStarting(true);
    try {
      const journey = await journeyApi.start(citizenId, lifeEventCode, token ?? undefined);
      router.push(`/journeys/${journey.application_id}`);
    } catch {
      router.push("/journeys");
    } finally {
      setStarting(false);
    }
  };

  if (!scheme) {
    return (
      <main className="setu-container setu-not-found">
        <h1>{t("noResults")}</h1>
        <p>The requested scheme pathway is not available in this demo dataset.</p>
        <Link href="/schemes" className="setu-primary-btn">{t("back")}</Link>
      </main>
    );
  }

  return (
    <main className="setu-scheme-detail">
      <section className="setu-detail-hero">
        <div className="setu-container">
          <div className="setu-breadcrumb"><Link href="/schemes">{t("schemes")}</Link><span>/</span><span>{scheme.category}</span></div>
          <span className="setu-scheme-category">{scheme.category}</span>
          <h1>{scheme.title}</h1>
          <p>{scheme.summary}</p>
          <div className="setu-detail-meta">
            <span><strong>{t("department")}</strong>{scheme.department}</span>
            <span><strong>Pathway</strong>Scheme discovery → eligibility → service</span>
          </div>
        </div>
      </section>

      <section className="setu-container setu-detail-grid">
        <div className="setu-detail-main">
          <section className="setu-detail-panel">
            <div className="setu-section-kicker">ELIGIBILITY</div>
            <h2>{t("schemes_who_eligible")}</h2>
            <ul>{scheme.eligibility.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="setu-detail-panel">
            <div className="setu-section-kicker">BENEFITS / SUPPORT</div>
            <h2>{t("schemes_benefits_support")}</h2>
            <ul>{scheme.benefits.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
          <section className="setu-detail-panel">
            <div className="setu-section-kicker">DOCUMENT CHECKLIST</div>
            <h2>{t("schemes_checklist")}</h2>
            <ul>{scheme.documents.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        </div>

        <aside className="setu-detail-side">
          <div className="setu-apply-card">
            <div className="setu-section-kicker">NEXT STEP</div>
            <h2>{t("schemes_continue_setu")}</h2>
            <p>Use the service directory to locate the relevant application pathway, or initiate a connected journey directly through SETU.</p>
            {scheme.relatedLifeEvent ? (
              <button
                type="button"
                className="setu-primary-btn"
                onClick={() => handleStartJourney(scheme.relatedLifeEvent!)}
                disabled={starting}
                style={{ width: "100%", marginBottom: "8px" }}
              >
                {starting ? t("loading") : t("services_start_journey")}
              </button>
            ) : null}
            <Link href="/services" className="setu-outline-btn" style={{ width: "100%", textAlign: "center", marginBottom: "8px" }}>
              {t("schemes_find_service")}
            </Link>
            <Link href="/profile" className="setu-text-btn" style={{ width: "100%", textAlign: "center" }}>
              {t("open_my_setu")}
            </Link>
          </div>
          <div className="setu-note-card">
            <strong>Important</strong>
            <p>This Phase 7 module is a structured discovery/demo layer. Scheme-specific eligibility, benefits and document requirements should be connected to verified department data before production deployment.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
