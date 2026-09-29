"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApiError, JourneyDetailView, JourneyStepView, journeyApi } from "@/lib/api";
import { STATUS_CLASSES, STATUS_LABEL_KEY } from "@/lib/statusStyles";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";

type ActionName = "consent" | "revoke" | "submit" | "approve" | null;

export default function JourneyDetailPage() {
  const params = useParams<{ id: string }>();
  const applicationId = params.id;
  const { t } = useLanguage();
  const { token, isLoggedIn } = useAuth();

  const [journey, setJourney] = useState<JourneyDetailView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<ActionName>(null);
  const [pendingService, setPendingService] = useState<string | null>(null);

  // Explicit Consent Modal State
  const [consentTargetStep, setConsentTargetStep] = useState<JourneyStepView | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setJourney(await journeyApi.get(applicationId, token ?? undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    }
  }, [applicationId, token, t]);

  useEffect(() => {
    load();
  }, [load]);

  const runAction = async (
    serviceCode: string,
    action: ActionName,
    fn: () => Promise<JourneyDetailView>,
  ) => {
    setPendingAction(action);
    setPendingService(serviceCode);
    setError(null);
    try {
      setJourney(await fn());
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    } finally {
      setPendingAction(null);
      setPendingService(null);
    }
  };

  const handleConfirmConsent = async () => {
    if (!consentTargetStep) return;
    const step = consentTargetStep;
    setConsentTargetStep(null);
    await runAction(step.service_code, "consent", () =>
      journeyApi.grantConsent(
        applicationId,
        step.service_code,
        `Authorize data sharing with ${step.department} for ${step.display_name}`,
        token ?? undefined,
      )
    );
  };

  const metrics = useMemo(() => {
    if (!journey) {
      return { done: 0, active: 0, blocked: 0, total: 0, progress: 0 };
    }

    const done = journey.steps.filter(
      (step) => step.status === "verified" || step.status === "ready",
    ).length;
    const active = journey.steps.filter((step) => step.status === "in_progress").length;
    const blocked = journey.steps.filter(
      (step) => step.status === "blocked" || step.status === "rejected",
    ).length;
    const total = journey.steps.length;

    return {
      done,
      active,
      blocked,
      total,
      progress: total ? Math.round((done / total) * 100) : 0,
    };
  }, [journey]);

  if (!isLoggedIn) {
    return (
      <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "48px 0" }}>
        <section className="setu-panel" style={{ maxWidth: "560px", margin: "40px auto", textAlign: "center", padding: "36px 20px" }}>
          <span className="setu-ink-kicker">APPLICATION TRACKER</span>
          <h1 style={{ fontSize: "1.8rem", color: "var(--setu-navy)", margin: "8px 0 12px" }}>
            Sign in to view this application journey
          </h1>
          <p className="setu-muted" style={{ margin: "0 0 20px", lineHeight: "1.6" }}>
            Application details, verified prerequisites, explicit consent records, and department progress are secured under your citizen account.
          </p>
          <Link href="/login" className="setu-btn setu-btn-primary">
            Sign In with Citizen ID
          </Link>
        </section>
      </div>
    );
  }

  if (!journey && !error) {
    return (
      <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "48px 0" }}>
        <div className="setu-panel" style={{ padding: "40px", textAlign: "center" }}>
          {t("loading")}
        </div>
      </div>
    );
  }

  if (error && !journey) {
    return (
      <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "48px 0" }}>
        <div className="setu-alert setu-alert-error">{error}</div>
        <Link href="/journeys" className="setu-btn setu-btn-secondary" style={{ marginTop: "16px" }}>
          ← Back to All Applications
        </Link>
      </div>
    );
  }

  if (!journey) return null;

  return (
    <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "36px 0 60px" }}>
      {/* Breadcrumb */}
      <nav className="setu-breadcrumb" aria-label="Breadcrumb" style={{ fontSize: "0.8rem", color: "var(--setu-muted)", marginBottom: "12px" }}>
        <Link href="/" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>{t("home")}</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <Link href="/profile" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>{t("mySetu")}</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <Link href="/journeys" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>{t("journeys_all")}</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <strong>{journey.application_id}</strong>
      </nav>

      {error && (
        <div className="setu-alert setu-alert-error" role="alert" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {/* Hero / Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "24px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span className={`setu-status ${journey.is_complete ? "setu-status-verified" : "setu-status-progress"}`}>
              {journey.is_complete ? t("completed") : t("in_progress")}
            </span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--setu-muted)" }}>
              ID: {journey.application_id}
            </span>
          </div>

          <span className="setu-ink-kicker">CONNECTED SERVICE JOURNEY</span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "var(--setu-navy)", margin: "4px 0 6px" }}>
            {journey.life_event_title_en}
          </h1>
          <p style={{ margin: 0, fontSize: "0.92rem", color: "var(--setu-muted)", maxWidth: "720px", lineHeight: "1.6" }}>
            Goal: &ldquo;{journey.goal_statement_en}&rdquo;
          </p>
        </div>

        <Link href="/journeys" className="setu-btn setu-btn-secondary" style={{ fontSize: "0.82rem" }}>
          ← {t("journeys_all")}
        </Link>
      </header>

      {/* CONNECTED JOURNEY PIPELINE BAR */}
      <section className="setu-panel" style={{ marginBottom: "24px" }} aria-label="Journey Pipeline Overview">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "12px" }}>
          <div>
            <span className="setu-ink-kicker">GOAL PROGRESS</span>
            <h2 style={{ margin: "2px 0", fontSize: "1.3rem", color: "var(--setu-navy)" }}>
              {metrics.progress}% Overall Completed
            </h2>
          </div>
          <span style={{ fontSize: "0.8rem", color: "var(--setu-muted)", fontWeight: 700 }}>
            {metrics.done} of {metrics.total} Stages Complete
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: "10px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ width: `${metrics.progress}%`, height: "100%", background: "var(--setu-blue)", transition: "width 350ms ease" }} />
        </div>

        {/* Visual Pipeline Stages */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "8px", borderTop: "1px solid var(--setu-line)", paddingTop: "14px" }}>
          <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "var(--setu-radius)", fontSize: "0.76rem" }}>
            <span style={{ color: "var(--setu-green)", fontWeight: 800 }}>✓ 1. Citizen Goal</span>
            <small style={{ display: "block", color: "var(--setu-muted)" }}>Defined</small>
          </div>
          <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "var(--setu-radius)", fontSize: "0.76rem" }}>
            <span style={{ color: "var(--setu-green)", fontWeight: 800 }}>✓ 2. Eligibility</span>
            <small style={{ display: "block", color: "var(--setu-muted)" }}>Evaluated</small>
          </div>
          <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "var(--setu-radius)", fontSize: "0.76rem" }}>
            <span style={{ color: "var(--setu-green)", fontWeight: 800 }}>✓ 3. Vault Reuse</span>
            <small style={{ display: "block", color: "var(--setu-muted)" }}>Credentials attached</small>
          </div>
          <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "var(--setu-radius)", fontSize: "0.76rem" }}>
            <span style={{ color: journey.steps.some(s => s.consent?.is_active) ? "var(--setu-green)" : "var(--setu-saffron)", fontWeight: 800 }}>
              {journey.steps.some(s => s.consent?.is_active) ? "✓ 4. Explicit Consent" : "○ 4. Explicit Consent"}
            </span>
            <small style={{ display: "block", color: "var(--setu-muted)" }}>
              {journey.steps.some(s => s.consent?.is_active) ? "Authorized" : "Pending action"}
            </small>
          </div>
          <div style={{ padding: "8px 10px", background: "#f8fafc", borderRadius: "var(--setu-radius)", fontSize: "0.76rem" }}>
            <span style={{ color: metrics.done === metrics.total ? "var(--setu-green)" : "var(--setu-blue)", fontWeight: 800 }}>
              {metrics.done === metrics.total ? "✓ 5. Final Service" : "● 5. Dept Processing"}
            </span>
            <small style={{ display: "block", color: "var(--setu-muted)" }}>
              {metrics.done === metrics.total ? "Completed" : "In progress"}
            </small>
          </div>
        </div>
      </section>

      {/* Main Layout: Stages vs Narrative Sidebar */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(300px, 0.75fr)", gap: "24px", alignItems: "start" }}>
        {/* Connected Stages */}
        <section aria-labelledby="stages-heading">
          <div style={{ marginBottom: "16px" }}>
            <span className="setu-ink-kicker">CROSS-DEPARTMENT WORKFLOW</span>
            <h2 id="stages-heading" style={{ margin: "2px 0", fontSize: "1.3rem", color: "var(--setu-navy)" }}>
              Service Stages &amp; Department Actions
            </h2>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {journey.steps.map((step, index) => {
              const canGrant = (step.status === "not_started" || step.status === "ready") && !step.consent?.is_active;
              const canRevoke = Boolean(step.consent?.is_active);
              const canSubmit = (step.status === "not_started" || step.status === "ready") && Boolean(step.consent?.is_active);
              const canApprove = step.status === "in_progress";
              const busy = pendingService === step.service_code;

              return (
                <article
                  key={step.service_code}
                  className="setu-panel"
                  style={{
                    padding: "20px",
                    borderLeft: `4px solid ${
                      step.status === "verified" || step.status === "ready"
                        ? "var(--setu-green)"
                        : step.status === "in_progress"
                        ? "var(--setu-blue)"
                        : step.status === "blocked" || step.status === "rejected"
                        ? "var(--setu-danger)"
                        : "var(--setu-line)"
                    }`,
                  }}
                >
                  {/* Step Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--setu-saffron)" }}>
                          STAGE 0{index + 1}
                        </span>
                        <span style={{ fontSize: "0.75rem", color: "var(--setu-muted)" }}>·</span>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--setu-navy)" }}>
                          {step.department}
                        </span>
                      </div>
                      <h3 style={{ margin: 0, fontSize: "1.2rem", color: "var(--setu-navy)" }}>
                        {step.display_name}
                      </h3>
                    </div>

                    <span className={`setu-status ${STATUS_CLASSES[step.status]}`}>
                      {t(STATUS_LABEL_KEY[step.status])}
                    </span>
                  </div>

                  {/* Operational Meta / References */}
                  <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "0.78rem", color: "var(--setu-muted)", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid #f1f5f9" }}>
                    {step.external_reference && (
                      <span>Dept Ref: <strong style={{ color: "var(--setu-navy)", fontFamily: "var(--font-mono)" }}>{step.external_reference}</strong></span>
                    )}
                    {step.sla_due_at && (
                      <span>SLA Due: <strong style={{ color: "var(--setu-navy)" }}>{new Date(step.sla_due_at).toLocaleDateString()}</strong></span>
                    )}
                    {step.sla_status && (
                      <span>
                        SLA Status:{" "}
                        <strong style={{ color: step.sla_status === "on_track" ? "var(--setu-green)" : "var(--setu-danger)" }}>
                          {step.sla_status.replaceAll("_", " ").toUpperCase()}
                        </strong>
                      </span>
                    )}
                  </div>

                  {/* 3-PART OPERATIONAL CLARITY CONTAINER */}
                  <div style={{ display: "grid", gap: "8px", margin: "12px 0", background: "#f8fafc", padding: "14px", borderRadius: "var(--setu-radius)", border: "1px solid var(--setu-line)", fontSize: "0.8rem" }}>
                    <div>
                      <strong style={{ color: "var(--setu-blue)", display: "block" }}>{t("op_what_setu_doing")}</strong>
                      <span style={{ color: "#334155" }}>
                        {step.status === "verified"
                          ? "Verified prerequisite satisfied from EKAM Document Vault. Credential securely linked."
                          : step.status === "in_progress"
                          ? "Cross-department handoff active. Transmitting payload to connector and monitoring SLA timers."
                          : "Evaluating dependencies and awaiting required consent/clearance."}
                      </span>
                    </div>

                    <div>
                      <strong style={{ color: "var(--setu-saffron)", display: "block" }}>{t("op_what_you_need_to_do")}</strong>
                      <span style={{ color: "#334155" }}>
                        {step.status === "blocked"
                          ? step.blocked_reason || "Prerequisite documents missing or pending approval."
                          : canGrant
                          ? "Review data disclosure details and grant explicit consent to share records."
                          : canSubmit
                          ? "Consent granted. Click 'Submit to Department' to trigger the official application."
                          : step.status === "in_progress"
                          ? "No citizen action required at this moment. Department review is in progress."
                          : "Stage completed."}
                      </span>
                    </div>

                    <div>
                      <strong style={{ color: "var(--setu-navy)", display: "block" }}>{t("op_what_dept_doing")}</strong>
                      <span style={{ color: "#334155" }}>
                        {step.status === "in_progress"
                          ? `${step.department} officer queue assignment and statutory field verification under RTS Act.`
                          : step.status === "verified"
                          ? `${step.department} official approval recorded. Digital certificate generated.`
                          : `Standby for verified submission from ${step.department}.`}
                      </span>
                    </div>
                  </div>

                  {/* Consent Disclosure Box */}
                  <div style={{ padding: "10px 14px", background: step.consent?.is_active ? "#f0fdf4" : "#fefce8", border: "1px solid", borderColor: step.consent?.is_active ? "#bbf7d0" : "#fef08a", borderRadius: "var(--setu-radius)", fontSize: "0.78rem", marginBottom: "14px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <strong>🔒 Consent Status: {step.consent?.is_active ? "Active & Authorized" : "Not Authorized"}</strong>
                      <span className={`setu-status ${step.consent?.is_active ? "setu-status-verified" : "setu-status-action"}`} style={{ fontSize: "0.68rem" }}>
                        {step.consent?.is_active ? "Consent Granted" : "Consent Required"}
                      </span>
                    </div>
                    {step.consent ? (
                      <p style={{ margin: "4px 0 0", color: "#374151" }}>
                        Authorized sharing with <strong>{step.consent.recipient_department}</strong> for &ldquo;{step.consent.purpose}&rdquo;. Valid until {new Date(step.consent.expires_at).toLocaleDateString()}.
                      </p>
                    ) : (
                      <p style={{ margin: "4px 0 0", color: "#374151" }}>
                        Explicit permission must be granted before EKAM transfers your vault credentials to {step.department}.
                      </p>
                    )}
                  </div>

                  {/* Operational Action Buttons */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {canGrant && (
                      <button
                        type="button"
                        onClick={() => setConsentTargetStep(step)}
                        disabled={busy}
                        className="setu-btn setu-btn-primary"
                        style={{ fontSize: "0.8rem", minHeight: "38px" }}
                      >
                        Grant Explicit Consent
                      </button>
                    )}

                    {canRevoke && (
                      <button
                        type="button"
                        onClick={() =>
                          runAction(step.service_code, "revoke", () =>
                            journeyApi.revokeConsent(applicationId, step.service_code, token ?? undefined)
                          )
                        }
                        disabled={busy && pendingAction === "revoke"}
                        className="setu-btn setu-btn-secondary"
                        style={{ fontSize: "0.8rem", minHeight: "38px" }}
                      >
                        {busy && pendingAction === "revoke" ? "Revoking…" : "Revoke Consent"}
                      </button>
                    )}

                    {canSubmit && (
                      <button
                        type="button"
                        onClick={() =>
                          runAction(step.service_code, "submit", () =>
                            journeyApi.submit(applicationId, step.service_code, {}, token ?? undefined)
                          )
                        }
                        disabled={busy && pendingAction === "submit"}
                        className="setu-btn setu-btn-primary"
                        style={{ fontSize: "0.8rem", minHeight: "38px" }}
                      >
                        {busy && pendingAction === "submit" ? "Submitting…" : `Submit to ${step.department}`}
                      </button>
                    )}

                    {canApprove && (
                      <button
                        type="button"
                        onClick={() =>
                          runAction(step.service_code, "approve", () =>
                            journeyApi.approve(applicationId, step.service_code, token ?? undefined)
                          )
                        }
                        disabled={busy && pendingAction === "approve"}
                        className="setu-btn setu-btn-primary"
                        style={{ fontSize: "0.8rem", minHeight: "38px", background: "var(--setu-green)", borderColor: "var(--setu-green)" }}
                      >
                        {busy && pendingAction === "approve" ? "Simulating…" : "Simulate Department Approval"}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Narrative & Status Sidebar */}
        <aside style={{ position: "sticky", top: "90px", display: "grid", gap: "16px" }}>
          {/* Current Status & Blocker */}
          <div className="setu-panel" style={{ borderTop: "4px solid var(--setu-blue)" }}>
            <span className="setu-ink-kicker">CURRENT STATUS</span>
            <h3 style={{ margin: "4px 0 8px", fontSize: "1.15rem", color: "var(--setu-navy)" }}>
              {journey.current_blocker ? "Action Required" : "Moving Normally"}
            </h3>
            <p className="setu-muted" style={{ fontSize: "0.82rem", lineHeight: "1.55", margin: "0 0 14px" }}>
              {journey.current_blocker ?? "No active blockers reported. Pipeline is progressing through scheduled stages."}
            </p>

            <div style={{ padding: "12px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)" }}>
              <span className="setu-muted" style={{ fontSize: "0.72rem", fontWeight: 700 }}>NEXT ACTION:</span>
              <strong style={{ display: "block", color: "var(--setu-navy)", fontSize: "0.88rem", marginTop: "2px" }}>
                {journey.next_action}
              </strong>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="setu-panel">
            <span className="setu-ink-kicker">ACTIVITY AUDIT LOG</span>
            <h3 style={{ margin: "4px 0 12px", fontSize: "1.1rem", color: "var(--setu-navy)" }}>
              Recorded Journey Events
            </h3>

            {journey.timeline.length === 0 ? (
              <p className="setu-muted" style={{ fontSize: "0.8rem", margin: 0 }}>
                No events recorded yet.
              </p>
            ) : (
              <ol style={{ margin: 0, paddingLeft: "16px", display: "grid", gap: "10px", fontSize: "0.8rem", color: "#334155" }}>
                {journey.timeline.map((event, idx) => (
                  <li key={idx} style={{ lineHeight: "1.45" }}>
                    <span>{event}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Need Assistance? */}
          <div className="setu-panel" style={{ background: "#f8fafc" }}>
            <strong style={{ display: "block", color: "var(--setu-navy)", fontSize: "0.9rem", marginBottom: "4px" }}>
              Service delayed or stuck?
            </strong>
            <p className="setu-muted" style={{ fontSize: "0.78rem", margin: "0 0 12px", lineHeight: "1.5" }}>
              Citizens are protected under the Maharashtra Right to Public Services Act. You can file a grievance directly linked to this application.
            </p>
            <Link href="/grievance" className="setu-btn setu-btn-secondary" style={{ width: "100%", fontSize: "0.78rem" }}>
              Register Grievance for this Journey
            </Link>
          </div>
        </aside>
      </div>

      {/* EXPLICIT CONSENT MODAL (Section 19) */}
      {consentTargetStep && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="consent-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(11,31,51,0.6)",
            zIndex: 100,
            display: "grid",
            placeItems: "center",
            padding: "16px",
          }}
        >
          <div
            className="setu-consent-modal"
            style={{
              maxWidth: "540px",
              width: "100%",
              background: "#ffffff",
              padding: "24px",
              borderRadius: "var(--setu-radius)",
              boxShadow: "var(--setu-shadow)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
              <div>
                <span className="setu-ink-kicker">EXPLICIT CITIZEN AUTHORIZATION</span>
                <h3 id="consent-modal-title" style={{ margin: "2px 0", fontSize: "1.25rem", color: "var(--setu-navy)" }}>
                  Grant Data &amp; Document Consent
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setConsentTargetStep(null)}
                style={{ background: "none", border: 0, fontSize: "1.4rem", cursor: "pointer", color: "var(--setu-muted)" }}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <p style={{ fontSize: "0.84rem", color: "var(--setu-muted)", lineHeight: "1.5", margin: "0 0 16px" }}>
              Under EKAM data governance guidelines, you must explicitly permit the sharing of your verified profile details and vault documents before they are transmitted.
            </p>

            <dl style={{ display: "grid", gap: "10px", margin: "16px 0", fontSize: "0.82rem", background: "#f8fafc", padding: "14px", borderRadius: "var(--setu-radius)", border: "1px solid var(--setu-line)" }}>
              <div>
                <dt style={{ color: "var(--setu-muted)", fontSize: "0.72rem", fontWeight: 800 }}>WHAT DATA WILL BE TRANSMITTED:</dt>
                <dd style={{ margin: "2px 0 0", color: "var(--setu-navy)", fontWeight: 700 }}>
                  Citizen Identity, Address, and Verified Vault Credentials
                </dd>
              </div>

              <div>
                <dt style={{ color: "var(--setu-muted)", fontSize: "0.72rem", fontWeight: 800 }}>WHY IT IS NEEDED:</dt>
                <dd style={{ margin: "2px 0 0", color: "#334155" }}>
                  To verify statutory eligibility for &ldquo;{consentTargetStep.display_name}&rdquo;
                </dd>
              </div>

              <div>
                <dt style={{ color: "var(--setu-muted)", fontSize: "0.72rem", fontWeight: 800 }}>WHO WILL RECEIVE IT:</dt>
                <dd style={{ margin: "2px 0 0", color: "var(--setu-blue)", fontWeight: 700 }}>
                  {consentTargetStep.department}, Government of Maharashtra
                </dd>
              </div>

              <div>
                <dt style={{ color: "var(--setu-muted)", fontSize: "0.72rem", fontWeight: 800 }}>FOR WHICH SERVICE:</dt>
                <dd style={{ margin: "2px 0 0", color: "var(--setu-navy)" }}>
                  {consentTargetStep.display_name}
                </dd>
              </div>

              <div>
                <dt style={{ color: "var(--setu-muted)", fontSize: "0.72rem", fontWeight: 800 }}>WHAT HAPPENS IF YOU DO NOT CONSENT:</dt>
                <dd style={{ margin: "2px 0 0", color: "#991b1b" }}>
                  The application cannot proceed to the department. Your records remain private in your vault. You may revoke consent at any time.
                </dd>
              </div>
            </dl>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={() => setConsentTargetStep(null)}
                className="setu-btn setu-btn-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmConsent}
                className="setu-btn setu-btn-primary"
              >
                Allow &amp; Grant Consent
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
