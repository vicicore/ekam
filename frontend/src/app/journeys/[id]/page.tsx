"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApiError, JourneyDetailView, journeyApi } from "@/lib/api";
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

  const load = useCallback(async () => {
    try {
      setError(null);
      setJourney(await journeyApi.get(applicationId, token ?? undefined));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    }
  }, [applicationId, token, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
      <main className="setu-page">
        <section className="setu-login-panel">
          <p className="setu-eyebrow">APPLICATION TRACKER</p>
          <h1>Sign in to view this application</h1>
          <p>Your SETU journey, documents, consent and department progress are available after sign in.</p>
          <Link href="/login" className="setu-button setu-button-primary">
            Log in to SETU
          </Link>
        </section>
      </main>
    );
  }

  if (!journey && !error) {
    return (
      <main className="setu-page">
        <div className="setu-journey-skeleton" aria-label="Loading application">
          <div className="setu-skeleton-line wide" />
          <div className="setu-skeleton-line medium" />
          <div className="setu-skeleton-panel" />
          <div className="setu-skeleton-panel" />
        </div>
      </main>
    );
  }

  if (error && !journey) {
    return (
      <main className="setu-page">
        <div className="setu-alert setu-alert-error">{error}</div>
        <Link href="/journeys" className="setu-button setu-button-secondary">
          ← Back to applications
        </Link>
      </main>
    );
  }

  if (!journey) return null;

  return (
    <main className="setu-page">
      <div className="setu-breadcrumb">
        <Link href="/profile">My SETU</Link>
        <span>/</span>
        <Link href="/journeys">Applications</Link>
        <span>/</span>
        <strong>{journey.application_id}</strong>
      </div>

      {error && <div className="setu-alert setu-alert-error">{error}</div>}

      <header className="setu-journey-hero">
        <div>
          <div className="setu-journey-title-row">
            <span
              className={`setu-status ${
                journey.is_complete ? "setu-status-success" : "setu-status-progress"
              }`}
            >
              {journey.is_complete ? "Completed" : "In progress"}
            </span>
            <span className="setu-application-id">{journey.application_id}</span>
          </div>
          <p className="setu-eyebrow">SERVICE JOURNEY</p>
          <h1>{journey.life_event_title_en}</h1>
          <p className="setu-journey-goal">{journey.goal_statement_en}</p>
        </div>
        <Link href="/journeys" className="setu-button setu-button-secondary">
          All applications
        </Link>
      </header>

      <section className="setu-progress-panel">
        <div className="setu-progress-top">
          <div>
            <p className="setu-eyebrow">APPLICATION PROGRESS</p>
            <h2>{metrics.progress}% complete</h2>
          </div>
          <span>{metrics.done} of {metrics.total} stages completed</span>
        </div>

        <div className="setu-progress-track" aria-label={`Application ${metrics.progress}% complete`}>
          <div className="setu-progress-fill" style={{ width: `${metrics.progress}%` }} />
        </div>

        <div className="setu-progress-stats">
          <Metric label="Completed" value={metrics.done} />
          <Metric label="In progress" value={metrics.active} />
          <Metric label="Needs attention" value={metrics.blocked} />
          <Metric label="Total stages" value={metrics.total} />
        </div>
      </section>

      <div className="setu-journey-layout">
        <div>
          <section className="setu-section">
            <div className="setu-section-heading">
              <div>
                <p className="setu-eyebrow">DEPARTMENT WORKFLOW</p>
                <h2>Service stages</h2>
              </div>
            </div>

            <div className="setu-stage-list">
              {journey.steps.map((step, index) => {
                const canGrant =
                  (step.status === "not_started" || step.status === "ready") &&
                  !step.consent?.is_active;
                const canRevoke = Boolean(step.consent?.is_active);
                const canSubmit =
                  (step.status === "not_started" || step.status === "ready") &&
                  Boolean(step.consent?.is_active);
                const canApprove = step.status === "in_progress";
                const busy = pendingService === step.service_code;

                return (
                  <article className="setu-stage-card" key={step.service_code}>
                    <div className="setu-stage-number">{String(index + 1).padStart(2, "0")}</div>

                    <div className="setu-stage-body">
                      <div className="setu-stage-heading">
                        <div>
                          <h3>{step.display_name}</h3>
                          <p>{step.department}</p>
                        </div>
                        <span className={`setu-status ${STATUS_CLASSES[step.status]}`}>
                          {t(STATUS_LABEL_KEY[step.status])}
                        </span>
                      </div>

                      <div className="setu-stage-meta">
                        {step.external_reference && (
                          <span>Reference: <strong>{step.external_reference}</strong></span>
                        )}
                        {step.sla_due_at && (
                          <span>Due: <strong>{new Date(step.sla_due_at).toLocaleDateString()}</strong></span>
                        )}
                        {step.sla_status && (
                          <span className={`setu-sla-${step.sla_status}`}>
                            SLA: <strong>{step.sla_status.replaceAll("_", " ")}</strong>
                          </span>
                        )}
                      </div>

                      {step.blocked_reason && (
                        <div className="setu-stage-notice warning">
                          <strong>Action required</strong>
                          <span>{step.blocked_reason}</span>
                        </div>
                      )}

                      {step.requires_service_codes.length > 0 && (
                        <div className="setu-stage-dependency">
                          <span>Dependency</span>
                          <strong>{step.requires_service_codes.join(", ")}</strong>
                        </div>
                      )}

                      <div className="setu-consent-box">
                        <div>
                          <p className="setu-consent-label">DOCUMENT & DATA CONSENT</p>
                          {step.consent ? (
                            <p>
                              Shared with <strong>{step.consent.recipient_department}</strong> for{" "}
                              “{step.consent.purpose}”.
                              {step.consent.is_active ? (
                                <> Valid until <strong>{new Date(step.consent.expires_at).toLocaleDateString()}</strong>.</>
                              ) : (
                                <> Consent has been revoked.</>
                              )}
                            </p>
                          ) : (
                            <p>No consent has been granted for this department yet.</p>
                          )}
                        </div>
                        <span className={step.consent?.is_active ? "consent-active" : "consent-inactive"}>
                          {step.consent?.is_active ? "Active" : "Not active"}
                        </span>
                      </div>

                      <div className="setu-stage-actions">
                        <ActionButton
                          label="Grant consent"
                          disabled={!canGrant}
                          pending={busy && pendingAction === "consent"}
                          onClick={() =>
                            runAction(step.service_code, "consent", () =>
                              journeyApi.grantConsent(
                                applicationId,
                                step.service_code,
                                `Process ${step.display_name}`,
                                token ?? undefined,
                              ),
                            )
                          }
                        />
                        <ActionButton
                          label="Revoke consent"
                          variant="secondary"
                          disabled={!canRevoke}
                          pending={busy && pendingAction === "revoke"}
                          onClick={() =>
                            runAction(step.service_code, "revoke", () =>
                              journeyApi.revokeConsent(
                                applicationId,
                                step.service_code,
                                token ?? undefined,
                              ),
                            )
                          }
                        />
                        <ActionButton
                          label={`Submit to ${step.department}`}
                          disabled={!canSubmit}
                          pending={busy && pendingAction === "submit"}
                          onClick={() =>
                            runAction(step.service_code, "submit", () =>
                              journeyApi.submit(
                                applicationId,
                                step.service_code,
                                {},
                                token ?? undefined,
                              ),
                            )
                          }
                        />
                        <ActionButton
                          label="Approve"
                          disabled={!canApprove}
                          pending={busy && pendingAction === "approve"}
                          onClick={() =>
                            runAction(step.service_code, "approve", () =>
                              journeyApi.approve(
                                applicationId,
                                step.service_code,
                                token ?? undefined,
                              ),
                            )
                          }
                        />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <aside className="setu-journey-sidebar">
          <section className="setu-section">
            <p className="setu-eyebrow">CURRENT STATUS</p>
            <h2 className="setu-sidebar-title">
              {journey.current_blocker ? "Action required" : "Moving normally"}
            </h2>
            <p className="setu-sidebar-copy">
              {journey.current_blocker ?? "No active blocker has been reported for this journey."}
            </p>

            <div className="setu-next-action">
              <span>Next action</span>
              <strong>{journey.next_action}</strong>
            </div>
          </section>

          <section className="setu-section">
            <div className="setu-section-heading">
              <div>
                <p className="setu-eyebrow">JOURNEY TIMELINE</p>
                <h2>Activity</h2>
              </div>
            </div>

            {journey.timeline.length === 0 ? (
              <p className="setu-muted">No activity recorded yet.</p>
            ) : (
              <ol className="setu-timeline">
                {journey.timeline.map((event, index) => (
                  <li key={`${event}-${index}`}>
                    <span className="setu-timeline-dot" />
                    <div>
                      <small>Step {index + 1}</small>
                      <p>{event}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>

          <section className="setu-section setu-help-card">
            <p className="setu-eyebrow">NEED HELP?</p>
            <h2>Something not right?</h2>
            <p>Use the grievance channel if a service is delayed or you need assistance.</p>
            <Link href="/services" className="setu-text-button">
              Explore services →
            </Link>
          </section>
        </aside>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  disabled,
  pending,
  variant = "primary",
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  pending?: boolean;
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      className={`setu-button ${variant === "primary" ? "setu-button-primary" : "setu-button-secondary"}`}
      disabled={disabled || pending}
      onClick={onClick}
    >
      {pending ? "Working…" : label}
    </button>
  );
}
