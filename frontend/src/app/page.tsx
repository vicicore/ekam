"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/LanguageProvider";
import { useAuth } from "@/lib/useAuth";
import MaharashtraMap from "@/components/MaharashtraMap";
import StateHeritageSection from "@/components/StateHeritageSection";
import LeadershipCarousel from "@/components/LeadershipCarousel";
import { SCHEME_CATALOG } from "@/lib/schemeCatalog";

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();
  const [goalQuery, setGoalQuery] = useState("");

  const goalExamples = useMemo(() => [
    { label: t("example_scholarship"), query: "scholarship", route: "/services/scholarship-support" },
    { label: t("example_income"), query: "income certificate", route: "/services/income-certificate" },
    { label: t("example_housing"), query: "housing", route: "/schemes/housing-support" },
    { label: t("example_business"), query: "business", route: "/services/worker-registration" },
    { label: t("example_grievance"), query: "grievance", route: "/grievance" },
    { label: t("example_domicile"), query: "domicile", route: "/services/domicile-certificate" },
  ], [t]);

  const quickActions = useMemo(() => [
    { title: t("qa_apply_title"), desc: t("qa_apply_desc"), href: "/services", code: "01", icon: "📋" },
    { title: t("qa_track_title"), desc: t("qa_track_desc"), href: "/journeys", code: "02", icon: "🔍" },
    { title: t("qa_vault_title"), desc: t("qa_vault_desc"), href: "/vault", code: "03", icon: "🗄️" },
    { title: t("qa_schemes_title"), desc: t("qa_schemes_desc"), href: "/schemes", code: "04", icon: "🏛️" },
    { title: t("qa_grievance_title"), desc: t("qa_grievance_desc"), href: "/grievance", code: "05", icon: "⚖️" },
    { title: t("qa_digilocker_title"), desc: t("qa_digilocker_desc"), href: "/vault", code: "06", icon: "🔒" },
    { title: t("qa_dashboard_title"), desc: t("qa_dashboard_desc"), href: "/profile", code: "07", icon: "👤" },
    { title: t("qa_assistant_title"), desc: t("qa_assistant_desc"), href: "/assistant", code: "08", icon: "💬" },
  ], [t]);

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = goalQuery.trim();
    if (!q) {
      router.push("/services");
      return;
    }
    router.push(`/services?q=${encodeURIComponent(q)}`);
  };

  const handleSelectGoal = (example: typeof goalExamples[0]) => {
    setGoalQuery(example.label);
    router.push(example.route);
  };

  return (
    <div className="setu-home">
      {/* 1. Hero + Goal-Based Service Discovery */}
      <section className="setu-home-hero" aria-labelledby="hero-title">
        <div className="setu-wrap">
          <div className="ekam-hero-container">
            <div className="ekam-hero-content">
              <div className="setu-kicker">{t("hero_kicker")}</div>
              <h1 id="hero-title">{t("hero_title")}</h1>
              <p>{t("hero_lede")}</p>

              {/* Goal Search Input */}
              <form className="setu-goal-form" onSubmit={handleGoalSubmit} role="search">
                <label htmlFor="goal-input" className="sr-only">{t("hero_title")}</label>
                <input
                  id="goal-input"
                  type="text"
                  value={goalQuery}
                  onChange={(e) => setGoalQuery(e.target.value)}
                  placeholder={t("hero_placeholder")}
                  aria-label={t("hero_title")}
                />
                <button type="submit" className="setu-btn setu-btn-primary">
                  {t("hero_cta")}
                </button>
              </form>

              {/* Goal Examples */}
              <div className="setu-goal-examples" aria-label={t("suggested_goals")}>
                <span style={{ fontSize: "0.76rem", color: "#f2c36d", fontWeight: 700, alignSelf: "center", marginRight: "4px" }}>
                  {t("suggested_goals")}
                </span>
                {goalExamples.map((ex) => (
                  <button
                    type="button"
                    key={ex.label}
                    onClick={() => handleSelectGoal(ex)}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Official Full EKAM Logo Showcase Card */}
            <div className="ekam-hero-brand-showcase">
              <div className="ekam-hero-logo-card">
                <Image
                  src="/ekam-logo-full.png"
                  alt="EKAM — One Gateway. Connected Services."
                  width={300}
                  height={283}
                  priority
                  className="ekam-hero-logo-img"
                />
                <div className="ekam-hero-card-meta">
                  <span className="ekam-badge-pill">Official Identity · SIH 2026</span>
                  <p className="ekam-card-tagline">EKAM — An Integrated Citizen Service Orchestration Platform</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Citizen Actions */}
      <section className="setu-section-block" aria-labelledby="quick-access-heading">
        <div className="setu-wrap">
          <div className="setu-section-head">
            <div>
              <span className="setu-ink-kicker">{t("quick_shortcuts_kicker")}</span>
              <h2 id="quick-access-heading">{t("quick_actions_title")}</h2>
            </div>
            <Link href="/services" className="setu-btn-tertiary">
              {t("view_all_services")}
            </Link>
          </div>

          <div className="setu-action-grid">
            {quickActions.map((action) => (
              <Link href={action.href} key={action.title} className="setu-action-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{action.code}</span>
                  <span style={{ fontSize: "1.2rem" }} aria-hidden="true">{action.icon}</span>
                </div>
                <h3>{action.title}</h3>
                <p>{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 3. My EKAM / Personalized Citizen Preview */}
      <section className="setu-section-block" style={{ background: "#edf2f7", borderTop: "1px solid var(--setu-line)", borderBottom: "1px solid var(--setu-line)" }} aria-labelledby="my-setu-preview-heading">
        <div className="setu-wrap">
          <div className="setu-preview-grid">
            <div className="setu-panel">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <Image
                  src="/ekam-emblem.png"
                  alt="EKAM Emblem"
                  width={28}
                  height={28}
                  style={{ width: "28px", height: "28px", objectFit: "contain" }}
                />
                <span className="setu-ink-kicker">{t("my_setu_kicker")}</span>
              </div>
              <h3 id="my-setu-preview-heading">{t("my_setu_preview_title")}</h3>
              <p className="setu-muted">
                {t("my_setu_preview_desc")}
              </p>

              {isLoggedIn ? (
                <div>
                  <div style={{ margin: "16px 0", padding: "14px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <strong>{t("profile_completion")}: 86%</strong>
                      <span className="setu-status setu-status-verified">{t("citizen_active")}</span>
                    </div>
                    <div className="setu-completeness-list">
                      <div><span>✓ Personal Identity Credentials</span><strong style={{ color: "var(--setu-green)" }}>Verified</strong></div>
                      <div><span>✓ Maharashtra Residence Record</span><strong style={{ color: "var(--setu-green)" }}>Verified</strong></div>
                      <div><span>✓ Document Vault Storage</span><strong style={{ color: "var(--setu-green)" }}>Active</strong></div>
                      <div><span>○ Additional Family Income Certificate</span><strong style={{ color: "var(--setu-saffron)" }}>Pending Action</strong></div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Link href="/profile" className="setu-btn setu-btn-primary">
                      {t("open_my_setu")}
                    </Link>
                    <Link href="/journeys" className="setu-btn setu-btn-secondary">
                      {t("track_active_apps")}
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ margin: "16px 0", padding: "14px", background: "#ffffff", border: "1px dashed var(--setu-line)", borderRadius: "var(--setu-radius)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <Image
                        src="/ekam-emblem.png"
                        alt="EKAM Emblem"
                        width={36}
                        height={36}
                        style={{ width: "36px", height: "36px", objectFit: "contain", flexShrink: 0 }}
                      />
                      <div>
                        <strong>{t("signin_prompt")}</strong>
                        <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--setu-muted)" }}>
                          {t("signin_desc")}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <Link href="/login" className="setu-btn setu-btn-primary">
                      {t("signin_cta")}
                    </Link>
                    <Link href="/demo" className="setu-btn setu-btn-secondary">
                      {t("live_demo_cta")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Summary Panel */}
            <div className="setu-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <span className="setu-ink-kicker">{t("one_guided_kicker")}</span>
                <h3>{t("one_guided_title")}</h3>
                <p className="setu-muted" style={{ fontSize: "0.84rem" }}>
                  {t("one_guided_desc")}
                </p>
                <div style={{ display: "grid", gap: "10px", marginTop: "12px", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <strong style={{ color: "var(--setu-blue)" }}>01.</strong>
                    <span>{t("step1_desc")}</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <strong style={{ color: "var(--setu-blue)" }}>02.</strong>
                    <span>{t("step2_desc")}</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <strong style={{ color: "var(--setu-blue)" }}>03.</strong>
                    <span>{t("step3_desc")}</span>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "baseline" }}>
                    <strong style={{ color: "var(--setu-blue)" }}>04.</strong>
                    <span>{t("step4_desc")}</span>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--setu-line)" }}>
                <Link href="/journeys" className="setu-btn-tertiary">
                  {t("learn_connected")}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Maharashtra District Map */}
      <section className="setu-section-block setu-map-band">
        <div className="setu-wrap">
          <MaharashtraMap />
        </div>
      </section>

      {/* 5. Historical Background & Heritage Section (Repositioned elegantly after Maharashtra Map) */}
      <StateHeritageSection />

      {/* 6. Explore Services by Life Event */}
      <section className="setu-section-block" aria-labelledby="life-events-heading">
        <div className="setu-wrap">
          <div className="setu-section-head">
            <div>
              <span className="setu-ink-kicker">{t("life_events_kicker")}</span>
              <h2 id="life-events-heading">{t("life_events_title")}</h2>
              <p className="setu-muted" style={{ margin: "4px 0 0" }}>
                {t("life_events_desc")}
              </p>
            </div>
            <Link href="/services" className="setu-btn-tertiary">
              {t("browse_directory")}
            </Link>
          </div>

          <div className="setu-life-grid">
            {/* Life Event 1: College Admission + Scholarship */}
            <article className="setu-life-card" style={{ borderLeft: "4px solid var(--setu-blue)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="setu-kicker" style={{ color: "var(--setu-blue)" }}>EDUCATION & WELFARE</span>
                <span className="setu-status setu-status-progress">{t("multi_department_badge")}</span>
              </div>
              <h3 style={{ fontSize: "1.25rem" }}>College Admission + Scholarship</h3>
              <p className="setu-muted" style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                Apply for engineering or professional college admission scholarship. EKAM checks your verified documents, requests explicit consent, and coordinates Revenue and Higher Education for you.
              </p>
              <div style={{ margin: "10px 0", fontSize: "0.78rem", background: "#f8fafc", padding: "10px", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)" }}>
                <strong>{t("connected_pipeline")}</strong>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  <span className="setu-status setu-status-verified">Home: Identity</span>
                  <span>→</span>
                  <span className="setu-status setu-status-verified">Revenue: Domicile</span>
                  <span>→</span>
                  <span className="setu-status setu-status-action">Revenue: Income Cert</span>
                  <span>→</span>
                  <span className="setu-status setu-status-progress">Higher Edu: Scholarship</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <Link href="/services/scholarship-support" className="setu-btn setu-btn-primary">
                  {t("view_service_eligibility")}
                </Link>
                <Link href="/services/income-certificate" className="setu-btn setu-btn-secondary">
                  Income Certificate Prerequisite
                </Link>
              </div>
            </article>

            {/* Life Event 2: Starting a Small Business */}
            <article className="setu-life-card" style={{ borderLeft: "4px solid var(--setu-saffron)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span className="setu-kicker" style={{ color: "var(--setu-saffron)" }}>COMMERCE & EMPLOYMENT</span>
                <span className="setu-status setu-status-progress">{t("multi_department_badge")}</span>
              </div>
              <h3 style={{ fontSize: "1.25rem" }}>Starting a Small Business</h3>
              <p className="setu-muted" style={{ fontSize: "0.85rem", lineHeight: "1.5" }}>
                Register a shop/commercial establishment and obtain the municipal local body NOC and GST registration needed to legally operate — one coordinated journey across three state departments.
              </p>
              <div style={{ margin: "10px 0", fontSize: "0.78rem", background: "#f8fafc", padding: "10px", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)" }}>
                <strong>{t("connected_pipeline")}</strong>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "6px" }}>
                  <span className="setu-status setu-status-verified">Labour: Shop Reg.</span>
                  <span>→</span>
                  <span className="setu-status setu-status-progress">Urban Dev: Municipal NOC</span>
                  <span>→</span>
                  <span className="setu-status setu-status-pending">Finance: GST</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", marginTop: "auto" }}>
                <Link href="/services/worker-registration" className="setu-btn setu-btn-primary">
                  Start Business Registration
                </Link>
                <Link href="/services/municipal-service-request" className="setu-btn setu-btn-secondary">
                  Municipal NOC Details
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* 7. Recommended / Popular Government Schemes */}
      <section className="setu-section-block" style={{ background: "#ffffff", borderTop: "1px solid var(--setu-line)", borderBottom: "1px solid var(--setu-line)" }} aria-labelledby="schemes-heading">
        <div className="setu-wrap">
          <div className="setu-section-head">
            <div>
              <span className="setu-ink-kicker">{t("schemes_kicker")}</span>
              <h2 id="schemes-heading">{t("schemes_title")}</h2>
              <p className="setu-muted" style={{ margin: "4px 0 0" }}>
                {t("schemes_desc")}
              </p>
            </div>
            <Link href="/schemes" className="setu-btn-tertiary">
              {t("view_all_schemes")} ({SCHEME_CATALOG.length}) →
            </Link>
          </div>

          <div className="setu-carousel" role="region" aria-label="Featured government schemes">
            {SCHEME_CATALOG.map((scheme) => (
              <article
                key={scheme.id}
                style={{
                  background: "#f9fafb",
                  border: "1px solid var(--setu-line)",
                  borderRadius: "var(--setu-radius)",
                  padding: "20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span className="setu-status setu-status-verified" style={{ fontSize: "0.68rem" }}>
                      {scheme.category}
                    </span>
                    <span style={{ fontSize: "0.72rem", color: "var(--setu-muted)", fontWeight: 700 }}>
                      {scheme.status}
                    </span>
                  </div>
                  <h3 style={{ fontSize: "1.05rem", margin: "6px 0", color: "var(--setu-navy)" }}>
                    {scheme.title}
                  </h3>
                  <p style={{ fontSize: "0.75rem", color: "var(--setu-saffron)", fontWeight: 700, margin: "0 0 6px" }}>
                    {scheme.department}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#4b5563", lineHeight: "1.5", margin: 0 }}>
                    {scheme.summary}
                  </p>
                </div>

                <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #e5e7eb" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.74rem", color: "var(--setu-muted)" }}>
                      {scheme.documents.length} {t("scheme_required_docs")}
                    </span>
                    <Link href={`/schemes/${scheme.id}`} className="setu-btn-tertiary" style={{ fontSize: "0.8rem" }}>
                      {t("viewDetails")} →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Government Leadership / Council of Ministers Section (Compact, horizontal carousel with click-to-profile modal) */}
      <div className="setu-wrap">
        <LeadershipCarousel />
      </div>

      {/* 9. Connected Journey Flow Preview */}
      <section className="setu-section-block" aria-labelledby="how-it-works-heading">
        <div className="setu-wrap">
          <div className="setu-section-head">
            <div>
              <span className="setu-ink-kicker">{t("how_it_works_kicker")}</span>
              <h2 id="how-it-works-heading">{t("how_it_works_title")}</h2>
            </div>
            <Link href="/journeys" className="setu-btn-tertiary">
              {t("open_tracker_btn")}
            </Link>
          </div>

          <div className="setu-process">
            <div>
              <span>01</span>
              <h3>{t("proc_step1_title")}</h3>
              <p>{t("proc_step1_desc")}</p>
            </div>
            <div>
              <span>02</span>
              <h3>{t("proc_step2_title")}</h3>
              <p>{t("proc_step2_desc")}</p>
            </div>
            <div>
              <span>03</span>
              <h3>{t("proc_step3_title")}</h3>
              <p>{t("proc_step3_desc")}</p>
            </div>
            <div>
              <span>04</span>
              <h3>{t("proc_step4_title")}</h3>
              <p>{t("proc_step4_desc")}</p>
            </div>
            <div>
              <span>05</span>
              <h3>{t("proc_step5_title")}</h3>
              <p>{t("proc_step5_desc")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Document Vault & DigiLocker Section */}
      <section className="setu-section-block" style={{ background: "#f8fafc", borderTop: "1px solid var(--setu-line)", borderBottom: "1px solid var(--setu-line)" }} aria-labelledby="vault-heading">
        <div className="setu-wrap">
          <div className="setu-preview-grid">
            <div className="setu-panel">
              <span className="setu-ink-kicker">{t("dpi_kicker")}</span>
              <h3 id="vault-heading">{t("vault_preview_title")}</h3>
              <p className="setu-muted">
                {t("vault_preview_desc")}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", margin: "16px 0" }}>
                <div style={{ padding: "12px", background: "#f1f5f9", borderRadius: "var(--setu-radius)" }}>
                  <strong style={{ fontSize: "1.2rem", color: "var(--setu-blue)", display: "block" }}>100%</strong>
                  <span style={{ fontSize: "0.76rem", color: "var(--setu-muted)" }}>{t("consent_governed")}</span>
                </div>
                <div style={{ padding: "12px", background: "#f1f5f9", borderRadius: "var(--setu-radius)" }}>
                  <strong style={{ fontSize: "1.2rem", color: "var(--setu-green)", display: "block" }}>Zero</strong>
                  <span style={{ fontSize: "0.76rem", color: "var(--setu-muted)" }}>{t("zero_redundant")}</span>
                </div>
              </div>
              <Link href="/vault" className="setu-btn setu-btn-primary">
                {t("open_vault_btn")}
              </Link>
            </div>

            {/* DigiLocker Sync Card */}
            <div className="setu-panel" style={{ borderLeft: "4px solid var(--setu-blue)" }}>
              <div className="setu-digilocker">
                <div>
                  <span className="setu-status setu-status-verified" style={{ marginBottom: "6px" }}>
                    {t("digilocker_badge")}
                  </span>
                  <h4 style={{ margin: "6px 0 2px", fontSize: "1.1rem", color: "var(--setu-navy)" }}>
                    {t("connect_digilocker_title")}
                  </h4>
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--setu-muted)" }}>
                    {t("connect_digilocker_desc")}
                  </p>
                </div>
                <Link href="/vault" className="setu-btn setu-btn-secondary" style={{ flexShrink: 0 }}>
                  {t("sync_digilocker_btn")}
                </Link>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", margin: 0, lineHeight: "1.5" }}>
                Note: In this integration-ready prototype, DigiLocker import reflects server-verified vault transitions and document reuse cascades.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Grievance & Citizen Assistance Band */}
      <section className="setu-support-band" aria-labelledby="support-heading">
        <div className="setu-wrap">
          <div>
            <span className="setu-kicker">{t("rts_commitment_kicker")}</span>
            <h2 id="support-heading" style={{ fontSize: "1.7rem", margin: "6px 0" }}>
              {t("rts_heading")}
            </h2>
            <p>{t("rts_desc")}</p>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", flexShrink: 0 }}>
            <Link href="/grievance" className="setu-btn setu-btn-primary">
              {t("register_grievance_btn")}
            </Link>
            <Link href="/assistant" className="setu-btn setu-btn-secondary">
              {t("ask_assistant_btn")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
