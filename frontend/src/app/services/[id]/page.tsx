"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { getServiceById } from "@/lib/serviceCatalog";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";
import { DocumentView, EligibilityEvaluateResult, citizenApi, journeyApi } from "@/lib/api";

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const { citizenId, token, isLoggedIn } = useAuth();

  const serviceId = String(params.id ?? "");
  const service = getServiceById(serviceId);

  const [userDocs, setUserDocs] = useState<DocumentView[] | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityEvaluateResult | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [consentGranted, setConsentGranted] = useState(false);

  // Fetch citizen documents and eligibility if logged in
  useEffect(() => {
    if (!citizenId || !token || !service) return;

    citizenApi.getDocuments(citizenId, token)
      .then(setUserDocs)
      .catch(() => {});

    if (service.relatedLifeEvent) {
      citizenApi.getEligibility(citizenId, service.relatedLifeEvent, token)
        .then(setEligibilityResult)
        .catch(() => {});
    }
  }, [citizenId, token, service]);

  // Partition documents into "AVAILABLE IN MY VAULT" vs "STILL REQUIRED"
  const documentPartition = useMemo(() => {
    if (!service) return { available: [], stillRequired: [] };

    const available: { docType: string; name: string; description: string; status: string; filename?: string }[] = [];
    const stillRequired: { docType: string; name: string; description: string; mandatory: boolean }[] = [];

    service.requiredDocuments.forEach((req) => {
      const match = userDocs?.find(
        (d) => (d.doc_type === req.docType || d.doc_type.includes(req.docType)) && d.status === "verified"
      );

      if (match) {
        available.push({
          docType: req.docType,
          name: req.name,
          description: req.description,
          status: match.status,
          filename: match.original_filename,
        });
      } else {
        stillRequired.push(req);
      }
    });

    return { available, stillRequired };
  }, [service, userDocs]);

  if (!service) {
    return (
      <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "48px 0" }}>
        <div className="setu-panel" style={{ textAlign: "center", padding: "40px" }}>
          <h2>Service Not Found</h2>
          <p className="setu-muted">
            The requested service &quot;{serviceId}&quot; could not be found in the current SETU directory.
          </p>
          <Link href="/services" className="setu-btn setu-btn-primary">
            Return to Services Directory
          </Link>
        </div>
      </div>
    );
  }

  const handleStartJourney = async () => {
    if (!isLoggedIn || !citizenId) {
      router.push("/login");
      return;
    }

    if (!service.relatedLifeEvent) {
      router.push("/journeys");
      return;
    }

    setLoadingAction(true);
    setActionError(null);
    try {
      const journey = await journeyApi.start(citizenId, service.relatedLifeEvent, token ?? undefined);
      router.push(`/journeys/${journey.application_id}`);
    } catch (err: any) {
      setActionError(err?.message ?? "Failed to start service journey. Please try again.");
      setLoadingAction(false);
    }
  };

  return (
    <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "36px 0 60px" }}>
      {/* Breadcrumb */}
      <nav className="setu-breadcrumb" aria-label="Breadcrumb" style={{ fontSize: "0.8rem", color: "var(--setu-muted)", marginBottom: "12px" }}>
        <Link href="/" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>Home</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <Link href="/services" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>Services</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <span style={{ color: "var(--setu-muted)" }}>{service.category}</span>
        <span style={{ margin: "0 6px" }}>/</span>
        <strong>{service.name}</strong>
      </nav>

      {/* Page Title & Department Banner */}
      <header style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "8px" }}>
          <span className="setu-status setu-status-verified">{service.category}</span>
          <span className="setu-status setu-status-progress">Right to Public Services Act (RTSA)</span>
          <span style={{ fontSize: "0.76rem", color: "var(--setu-muted)", fontWeight: 700 }}>
            Official SLA: ~{service.slaDays} Days
          </span>
        </div>
        <h1 style={{ fontSize: "clamp(2rem, 4vw, 2.8rem)", color: "var(--setu-navy)", margin: "4px 0 8px" }}>
          {service.name}
        </h1>
        <p style={{ margin: "0 0 4px", fontSize: "0.95rem", fontWeight: 700, color: "var(--setu-saffron)" }}>
          {service.department} · Government of Maharashtra
        </p>
      </header>

      {actionError && (
        <div className="setu-alert setu-alert-error" role="alert" style={{ marginBottom: "20px" }}>
          {actionError}
        </div>
      )}

      {/* Main 4-Section Structured Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(300px, 0.8fr)", gap: "24px", alignItems: "start" }}>
        <div style={{ display: "grid", gap: "20px" }}>
          {/* SECTION 1: WHAT IS THIS? */}
          <section className="setu-panel" aria-labelledby="section-what-heading">
            <span className="setu-ink-kicker">SECTION 1</span>
            <h2 id="section-what-heading" style={{ margin: "4px 0 10px", fontSize: "1.3rem", color: "var(--setu-navy)" }}>
              {t("services_what_is")}
            </h2>
            <p style={{ fontSize: "0.9rem", lineHeight: "1.65", color: "#334155", margin: "0 0 16px" }}>
              {service.purpose}
            </p>

            <div style={{ padding: "14px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)" }}>
              <strong style={{ display: "block", color: "var(--setu-navy)", marginBottom: "4px", fontSize: "0.85rem" }}>
                {t("services_who_can_apply")}
              </strong>
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--setu-muted)", lineHeight: "1.5" }}>
                {service.whoCanApply}
              </p>
            </div>
          </section>

          {/* SECTION 2: AM I ELIGIBLE? */}
          <section className="setu-panel" aria-labelledby="section-eligible-heading">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span className="setu-ink-kicker">SECTION 2</span>
              {eligibilityResult && (
                <span className={`setu-status ${eligibilityResult.overall_ready ? "setu-status-verified" : "setu-status-action"}`}>
                  {eligibilityResult.overall_ready ? "✓ Eligible to Proceed" : "⚠ Prerequisites Pending"}
                </span>
              )}
            </div>
            <h2 id="section-eligible-heading" style={{ margin: "0 0 10px", fontSize: "1.3rem", color: "var(--setu-navy)" }}>
              {t("services_am_i_eligible")}
            </h2>

            <ul style={{ margin: "0 0 16px", paddingLeft: "20px", display: "grid", gap: "8px" }}>
              {service.eligibilityCriteria.map((criterion, idx) => (
                <li key={idx} style={{ fontSize: "0.86rem", color: "#334155", lineHeight: "1.5" }}>
                  {criterion}
                </li>
              ))}
            </ul>

            {/* Prerequisites */}
            <div style={{ padding: "14px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)" }}>
              <strong style={{ display: "block", color: "var(--setu-navy)", marginBottom: "6px", fontSize: "0.85rem" }}>
                {t("services_prereqs")}
              </strong>
              <ul style={{ margin: 0, paddingLeft: "18px", color: "var(--setu-muted)", fontSize: "0.82rem", lineHeight: "1.55" }}>
                {service.prerequisites.map((prereq, idx) => (
                  <li key={idx}>{prereq}</li>
                ))}
              </ul>
            </div>
          </section>

          {/* SECTION 3: WHAT DO I NEED? (DOCUMENT REUSE) */}
          <section className="setu-panel" aria-labelledby="section-docs-heading">
            <span className="setu-ink-kicker">SECTION 3 · DOCUMENT REUSE</span>
            <h2 id="section-docs-heading" style={{ margin: "4px 0 6px", fontSize: "1.3rem", color: "var(--setu-navy)" }}>
              {t("services_what_do_i_need")}
            </h2>
            <p className="setu-muted" style={{ margin: "0 0 16px", fontSize: "0.84rem" }}>
              SETU principle: <strong>Enter/upload once, reuse where allowed.</strong> Check below to see which documents are already verified in your vault versus what is still required.
            </p>

            {/* Structured Presentation: Available in Vault vs Still Required */}
            <div style={{ display: "grid", gap: "16px" }}>
              {/* AVAILABLE IN MY VAULT */}
              <div style={{ border: "1px solid #b7ddca", background: "#f5fbf7", padding: "16px", borderRadius: "var(--setu-radius)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ color: "var(--setu-green)", fontSize: "0.88rem" }}>
                    ✓ {t("services_avail_in_vault")} ({documentPartition.available.length})
                  </strong>
                  <span className="setu-status setu-status-verified" style={{ fontSize: "0.68rem" }}>
                    {t("services_ready_reuse")}
                  </span>
                </div>

                {documentPartition.available.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--setu-muted)" }}>
                    {isLoggedIn ? "No matching verified documents found in your vault yet." : "Sign in to check documents already verified in your SETU Document Vault."}
                  </p>
                ) : (
                  <ul className="setu-req-list" style={{ margin: 0, padding: 0 }}>
                    {documentPartition.available.map((doc) => (
                      <li key={doc.docType} style={{ borderColor: "#d8ede0" }}>
                        <span className="setu-check" aria-hidden="true">✓</span>
                        <div>
                          <strong>{doc.name}</strong>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--setu-muted)" }}>
                            Verified in SETU Vault · {doc.filename || "Attached credential"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* STILL REQUIRED */}
              <div style={{ border: "1px solid #ead7a7", background: "#fffdf9", padding: "16px", borderRadius: "var(--setu-radius)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <strong style={{ color: "#925e14", fontSize: "0.88rem" }}>
                    ○ {t("services_still_required")} ({documentPartition.stillRequired.length})
                  </strong>
                  <span className="setu-status setu-status-action" style={{ fontSize: "0.68rem" }}>
                    {t("services_needs_upload")}
                  </span>
                </div>

                {documentPartition.stillRequired.length === 0 ? (
                  <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--setu-green)", fontWeight: 700 }}>
                    {t("services_all_docs_ready")}
                  </p>
                ) : (
                  <ul className="setu-req-list" style={{ margin: 0, padding: 0 }}>
                    {documentPartition.stillRequired.map((req) => (
                      <li key={req.docType} style={{ borderColor: "#f3e7cb" }}>
                        <span className="setu-open" aria-hidden="true">○</span>
                        <div>
                          <strong>{req.name}</strong>
                          <span style={{ display: "block", fontSize: "0.75rem", color: "var(--setu-muted)" }}>
                            {req.description} {req.mandatory && "· Mandatory"}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                <div style={{ marginTop: "12px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <Link href="/vault" className="setu-btn setu-btn-secondary" style={{ fontSize: "0.78rem" }}>
                    {t("services_upload_vault")}
                  </Link>
                  <Link href="/vault" className="setu-btn setu-btn-secondary" style={{ fontSize: "0.78rem" }}>
                    {t("services_import_digilocker")}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: WHAT HAPPENS NEXT? */}
          <section className="setu-panel" aria-labelledby="section-next-heading">
            <span className="setu-ink-kicker">SECTION 4</span>
            <h2 id="section-next-heading" style={{ margin: "4px 0 10px", fontSize: "1.3rem", color: "var(--setu-navy)" }}>
              {t("services_what_happens_next")}
            </h2>

            <div style={{ display: "grid", gap: "12px", margin: "16px 0" }}>
              {service.processSteps.map((step) => (
                <div
                  key={step.stepNumber}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr",
                    gap: "12px",
                    padding: "12px",
                    background: "#f8fafc",
                    border: "1px solid var(--setu-line)",
                    borderRadius: "var(--setu-radius)",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--setu-blue)",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      fontWeight: 800,
                      fontSize: "0.85rem",
                    }}
                  >
                    0{step.stepNumber}
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "6px" }}>
                      <strong style={{ fontSize: "0.92rem", color: "var(--setu-navy)" }}>{step.title}</strong>
                      <span className="setu-status setu-status-progress" style={{ fontSize: "0.68rem" }}>
                        Actor: {step.actor}
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--setu-muted)", lineHeight: "1.5" }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Explicit Consent Requirements Preview */}
            <div style={{ padding: "16px", background: "#f0f7fc", border: "1px solid #bdd5e8", borderRadius: "var(--setu-radius)" }}>
              <strong style={{ display: "block", color: "var(--setu-navy)", marginBottom: "6px", fontSize: "0.88rem" }}>
                🔒 Explicit Data Consent Requirement:
              </strong>
              <p style={{ margin: "0 0 10px", fontSize: "0.8rem", color: "#334155", lineHeight: "1.5" }}>
                Before submitting, SETU requests your explicit permission to share the following verified data with <strong>{service.consentDetails.recipient}</strong>:
              </p>
              <div style={{ fontSize: "0.78rem", color: "#475569", display: "grid", gap: "4px" }}>
                <div><strong>Data Shared:</strong> {service.consentDetails.dataShared}</div>
                <div><strong>Purpose:</strong> {service.consentDetails.purpose}</div>
                <div><strong>Retention:</strong> {service.consentDetails.retention}</div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar: Action Center */}
        <aside style={{ position: "sticky", top: "90px", display: "grid", gap: "16px" }}>
          <div className="setu-panel" style={{ borderTop: "4px solid var(--setu-blue)" }}>
            <span className="setu-ink-kicker">CITIZEN ACTION</span>
            <h3 style={{ margin: "6px 0 8px", fontSize: "1.2rem", color: "var(--setu-navy)" }}>
              {t("services_start_journey_cta")}
            </h3>
            <p className="setu-muted" style={{ fontSize: "0.82rem", lineHeight: "1.55", margin: "0 0 16px" }}>
              SETU will verify your profile, attach available vault credentials, and initiate time-bound processing under the Maharashtra RTS Act.
            </p>

            {/* Consent Checkbox */}
            <label style={{ display: "flex", gap: "10px", alignItems: "flex-start", cursor: "pointer", fontSize: "0.78rem", color: "#334155", margin: "0 0 16px", padding: "10px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)" }}>
              <input
                type="checkbox"
                checked={consentGranted}
                onChange={(e) => setConsentGranted(e.target.checked)}
                style={{ marginTop: "2px" }}
              />
              <span>
                {t("services_consent_text")}
              </span>
            </label>

            <button
              type="button"
              onClick={handleStartJourney}
              disabled={loadingAction || !consentGranted}
              className="setu-btn setu-btn-primary"
              style={{ width: "100%", minHeight: "46px" }}
            >
              {loadingAction ? t("loading") : t("services_proceed_btn")}
            </button>

            {!isLoggedIn && (
              <p style={{ margin: "10px 0 0", fontSize: "0.75rem", color: "var(--setu-muted)", textAlign: "center" }}>
                You will be prompted to sign in with your citizen identifier.
              </p>
            )}
          </div>

          {/* Quick Help Card */}
          <div className="setu-panel" style={{ background: "#f8fafc" }}>
            <strong style={{ fontSize: "0.9rem", color: "var(--setu-navy)", display: "block", marginBottom: "6px" }}>
              Questions about this service?
            </strong>
            <p style={{ margin: "0 0 12px", fontSize: "0.8rem", color: "var(--setu-muted)", lineHeight: "1.5" }}>
              Ask the SETU Assistant for grounded answers on deadlines, documents, or grievance escalation.
            </p>
            <Link href="/assistant" className="setu-btn setu-btn-secondary" style={{ width: "100%", fontSize: "0.8rem" }}>
              Ask SETU Assistant
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
