 "use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SCHEME_CATALOG, SCHEME_CATEGORIES, SchemeRecord } from "@/lib/schemeCatalog";
import { useLanguage } from "@/lib/LanguageProvider";

export default function SchemesPage() {
  const { t } = useLanguage();
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SCHEME_CATALOG.filter((scheme) => {
      const matchesCategory = category === "All" || scheme.category === category;
      const text = `${scheme.title} ${scheme.department} ${scheme.summary} ${scheme.tags.join(" ")}`.toLowerCase();
      return matchesCategory && (!q || text.includes(q));
    });
  }, [category, query]);

  return (
    <main className="setu-schemes-page">
      <section className="setu-schemes-hero">
        <div className="setu-container">
          <div className="setu-breadcrumb"><Link href="/">{t("home")}</Link><span>/</span><span>{t("schemes")}</span></div>
          <div className="setu-section-kicker">{t("schemes_kicker")}</div>
          <h1>{t("schemes_hero_title")}</h1>
          <p>{t("schemes_hero_desc")}</p>
        </div>
      </section>

      <section className="setu-container setu-schemes-content">
        <div className="setu-scheme-searchbar">
          <div>
            <label htmlFor="scheme-search">{t("schemes_search_label")}</label>
            <input
              id="scheme-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("schemes_search_placeholder")}
            />
          </div>
          <Link className="setu-outline-btn" href="/services">{t("nav_services")}</Link>
        </div>

        <div className="setu-filter-row" aria-label="Scheme categories">
          {SCHEME_CATEGORIES.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="setu-scheme-results-head">
          <div>
            <div className="setu-section-kicker">DISCOVER</div>
            <h2>{t("schemes_pathways_heading")}</h2>
          </div>
          <span>{filtered.length} {t("schemes").toLowerCase()}</span>
        </div>

        {filtered.length === 0 ? (
          <div className="setu-empty-state">
            <strong>{t("noResults")}</strong>
            <p>{t("services_try_broader")}</p>
          </div>
        ) : (
          <div className="setu-scheme-grid">
            {filtered.map((scheme) => (
              <article className="setu-scheme-card" key={scheme.id}>
                <div className="setu-scheme-card-top">
                  <span className="setu-scheme-category">{scheme.category}</span>
                  <span className="setu-scheme-status">{scheme.status}</span>
                </div>
                <h3>{scheme.title}</h3>
                <p className="setu-scheme-dept">{scheme.department}</p>
                <p>{scheme.summary}</p>
                <div className="setu-tag-row">
                  {scheme.tags.map((tag) => <span key={tag}>{tag}</span>)}
                </div>
                <div className="setu-scheme-card-actions">
                  <Link href={`/schemes/${scheme.id}`} className="setu-primary-btn">{t("viewDetails")}</Link>
                  <Link href="/services" className="setu-text-btn">{t("schemes_find_service")} →</Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <section className="setu-eligibility-banner">
          <div>
            <div className="setu-section-kicker">SMART ELIGIBILITY</div>
            <h2>{t("one_guided_title")}</h2>
            <p>
              {t("my_setu_preview_desc")}
            </p>
          </div>
          <Link href="/profile" className="setu-primary-btn">{t("open_my_setu")}</Link>
        </section>
      </section>
    </main>
  );
}
