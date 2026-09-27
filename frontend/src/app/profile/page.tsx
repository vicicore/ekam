"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ApiError,
  CitizenProfileView,
  DocumentView,
  JourneySummaryView,
  citizenApi,
  journeyApi,
} from "@/lib/api";
import {
  DOC_STATUS_CLASSES,
  DOC_STATUS_LABEL_KEY,
  STATUS_CLASSES,
  STATUS_LABEL_KEY,
} from "@/lib/statusStyles";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";

type Tab = "overview" | "applications" | "documents" | "profile";

export default function ProfilePage() {
  const { t } = useLanguage();
  const { citizenId, token, isLoggedIn } = useAuth();

  const [tab, setTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<CitizenProfileView | null>(null);
  const [journeys, setJourneys] = useState<JourneySummaryView[] | null>(null);
  const [documents, setDocuments] = useState<DocumentView[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    district: "",
    taluka: "",
    phone: "",
  });

  const load = useCallback(async () => {
    if (!citizenId) return;

    setLoading(true);
    setError(null);

    const results = await Promise.allSettled([
      citizenApi.getProfile(citizenId, token ?? undefined),
      journeyApi.listForCitizen(citizenId, token ?? undefined),
      citizenApi.getDocuments(citizenId, token ?? undefined),
    ]);

    const [profileResult, journeyResult, documentResult] = results;

    if (profileResult.status === "fulfilled") {
      const p = profileResult.value;
      setProfile(p);
      setForm({
        full_name: p.full_name ?? "",
        district: p.district ?? "",
        taluka: p.taluka ?? "",
        phone: p.phone ?? "",
      });
    }

    if (journeyResult.status === "fulfilled") {
      setJourneys(journeyResult.value);
    }

    if (documentResult.status === "fulfilled") {
      setDocuments(documentResult.value);
    }

    const failed = results.find(
      (result) => result.status === "rejected",
    );
    if (failed && failed.status === "rejected") {
      setError(
        failed.reason instanceof ApiError
          ? failed.reason.message
          : t("error_generic"),
      );
    }

    setLoading(false);
  }, [citizenId, token, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const stats = useMemo(() => {
    const applicationList = journeys ?? [];
    const documentList = documents ?? [];

    return {
      activeApplications: applicationList.filter((j) => !j.is_complete).length,
      completedApplications: applicationList.filter((j) => j.is_complete).length,
      totalDocuments: documentList.length,
      verifiedDocuments: documentList.filter((d) => d.status === "verified").length,
      pendingDocuments: documentList.filter(
        (d) => d.status === "uploaded" || d.status === "under_review",
      ).length,
      attentionDocuments: documentList.filter(
        (d) => d.status === "rejected" || d.status === "expired",
      ).length,
    };
  }, [journeys, documents]);

  const attentionItems = useMemo(() => {
    const items: { title: string; detail: string; href: string }[] = [];

    (journeys ?? []).forEach((journey) => {
      if (!journey.is_complete) {
        items.push({
          title: journey.life_event_title_en,
          detail: "Application is currently in progress.",
          href: `/journeys/${journey.application_id}`,
        });
      }
    });

    (documents ?? []).forEach((doc) => {
      if (doc.status === "rejected" || doc.status === "expired") {
        items.push({
          title: doc.doc_type.replaceAll("_", " "),
          detail:
            doc.status === "expired"
              ? "Document has expired and may need to be replaced."
              : "Document was rejected and may need to be re-uploaded.",
          href: "/vault",
        });
      }
    });

    return items.slice(0, 5);
  }, [journeys, documents]);

  const saveProfile = async () => {
    if (!citizenId) return;

    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const updated = await citizenApi.upsertProfile(
        citizenId,
        form,
        token ?? undefined,
      );
      setProfile(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    } finally {
      setSaving(false);
    }
  };

  if (!isLoggedIn || !citizenId) {
    return (
      <main className="setu-page">
        <section className="setu-login-panel">
          <p className="setu-eyebrow">MY SETU</p>
          <h1>Sign in to access your citizen dashboard</h1>
          <p>
            View your applications, documents, profile information and
            pending actions in one place.
          </p>
          <Link href="/login" className="setu-button setu-button-primary">
            Log in to SETU
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="setu-page">
      <div className="setu-dashboard-header">
        <div>
          <p className="setu-eyebrow">MY SETU</p>
          <h1>Citizen Dashboard</h1>
          <p>
            Manage your government-service activity, documents and profile
            from one place.
          </p>
        </div>
        <div className="setu-citizen-chip">
          <span className="setu-citizen-avatar">
            {(profile?.full_name || citizenId).charAt(0).toUpperCase()}
          </span>
          <span>
            <strong>{profile?.full_name || "Citizen"}</strong>
            <small>{citizenId}</small>
          </span>
        </div>
      </div>

      {error && (
        <div className="setu-alert setu-alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="setu-tabbar" role="tablist" aria-label="My SETU sections">
        {[
          ["overview", "Overview"],
          ["applications", "Applications"],
          ["documents", "Documents"],
          ["profile", "Profile"],
        ].map(([value, label]) => (
          <button
            key={value}
            role="tab"
            aria-selected={tab === value}
            className={tab === value ? "is-active" : ""}
            onClick={() => setTab(value as Tab)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {tab === "overview" && (
            <Overview
              stats={stats}
              attentionItems={attentionItems}
              journeys={journeys ?? []}
              documents={documents ?? []}
              onApplications={() => setTab("applications")}
              onDocuments={() => setTab("documents")}
            />
          )}

          {tab === "applications" && (
            <Applications journeys={journeys ?? []} />
          )}

          {tab === "documents" && (
            <Documents documents={documents ?? []} />
          )}

          {tab === "profile" && (
            <section className="setu-section">
              <div className="setu-section-heading">
                <div>
                  <p className="setu-eyebrow">PERSONAL INFORMATION</p>
                  <h2>Your citizen profile</h2>
                </div>
                {profile && (
                  <span className="setu-completeness">
                    {profile.profile_completeness_pct}% complete
                  </span>
                )}
              </div>

              <div className="setu-form-grid">
                <Field
                  label="Full name"
                  value={form.full_name}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, full_name: value }))
                  }
                />
                <Field
                  label="Phone"
                  value={form.phone}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, phone: value }))
                  }
                />
                <Field
                  label="District"
                  value={form.district}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, district: value }))
                  }
                />
                <Field
                  label="Taluka"
                  value={form.taluka}
                  onChange={(value) =>
                    setForm((current) => ({ ...current, taluka: value }))
                  }
                />
              </div>

              <div className="setu-form-actions">
                {saved && <span className="setu-save-message">Profile saved.</span>}
                <button
                  className="setu-button setu-button-primary"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </main>
  );
}

function Overview({
  stats,
  attentionItems,
  journeys,
  documents,
  onApplications,
  onDocuments,
}: {
  stats: {
    activeApplications: number;
    completedApplications: number;
    totalDocuments: number;
    verifiedDocuments: number;
    pendingDocuments: number;
    attentionDocuments: number;
  };
  attentionItems: { title: string; detail: string; href: string }[];
  journeys: JourneySummaryView[];
  documents: DocumentView[];
  onApplications: () => void;
  onDocuments: () => void;
}) {
  return (
    <>
      <section className="setu-stat-grid">
        <StatCard
          label="Active applications"
          value={stats.activeApplications}
          detail="Currently in progress"
          accent="blue"
          onClick={onApplications}
        />
        <StatCard
          label="Completed services"
          value={stats.completedApplications}
          detail="Successfully completed"
          accent="green"
          onClick={onApplications}
        />
        <StatCard
          label="Documents"
          value={stats.totalDocuments}
          detail={`${stats.verifiedDocuments} verified`}
          accent="orange"
          onClick={onDocuments}
        />
        <StatCard
          label="Pending actions"
          value={attentionItems.length}
          detail={`${stats.pendingDocuments} documents awaiting review`}
          accent="red"
          onClick={onDocuments}
        />
      </section>

      <div className="setu-content-grid">
        <section className="setu-section">
          <div className="setu-section-heading">
            <div>
              <p className="setu-eyebrow">ATTENTION REQUIRED</p>
              <h2>Needs your attention</h2>
            </div>
          </div>

          {attentionItems.length === 0 ? (
            <EmptyState
              title="Nothing needs your attention"
              detail="There are no pending actions or document issues right now."
            />
          ) : (
            <div className="setu-attention-list">
              {attentionItems.map((item, index) => (
                <Link key={`${item.href}-${index}`} href={item.href} className="setu-attention-item">
                  <span className="setu-attention-icon">!</span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.detail}</small>
                  </span>
                  <span className="setu-arrow">→</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="setu-section">
          <div className="setu-section-heading">
            <div>
              <p className="setu-eyebrow">QUICK ACCESS</p>
              <h2>Common actions</h2>
            </div>
          </div>

          <div className="setu-quick-grid">
            <Link href="/services" className="setu-quick-card">
              <span>01</span>
              <strong>Discover a service</strong>
              <small>Find a government service by life event.</small>
            </Link>
            <Link href="/vault" className="setu-quick-card">
              <span>02</span>
              <strong>Manage documents</strong>
              <small>Review, upload and track your documents.</small>
            </Link>
            <Link href="/journeys" className="setu-quick-card">
              <span>03</span>
              <strong>Track applications</strong>
              <small>Follow your active service journeys.</small>
            </Link>
            <Link href="/profile" className="setu-quick-card">
              <span>04</span>
              <strong>Update profile</strong>
              <small>Keep your citizen information current.</small>
            </Link>
          </div>
        </section>
      </div>

      <section className="setu-section">
        <div className="setu-section-heading">
          <div>
            <p className="setu-eyebrow">RECENT ACTIVITY</p>
            <h2>Your applications</h2>
          </div>
          <button className="setu-text-button" onClick={onApplications}>
            View all →
          </button>
        </div>

        {journeys.length === 0 ? (
          <EmptyState
            title="No applications yet"
            detail="Start a service journey and it will appear here."
            action={
              <Link href="/services" className="setu-button setu-button-secondary">
                Discover services
              </Link>
            }
          />
        ) : (
          <div className="setu-table-wrap">
            <table className="setu-table">
              <thead>
                <tr>
                  <th>Service journey</th>
                  <th>Started</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {journeys.slice(0, 5).map((journey) => (
                  <tr key={journey.application_id}>
                    <td>
                      <strong>{journey.life_event_title_en}</strong>
                      <small>{journey.application_id}</small>
                    </td>
                    <td>{new Date(journey.created_at).toLocaleDateString()}</td>
                    <td>
                      <span
                        className={`setu-status ${
                          journey.is_complete
                            ? "setu-status-success"
                            : "setu-status-progress"
                        }`}
                      >
                        {journey.is_complete ? "Complete" : "In progress"}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="setu-text-button"
                        href={`/journeys/${journey.application_id}`}
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="setu-section">
        <div className="setu-section-heading">
          <div>
            <p className="setu-eyebrow">DOCUMENT VAULT</p>
            <h2>Document status</h2>
          </div>
          <button className="setu-text-button" onClick={onDocuments}>
            Manage documents →
          </button>
        </div>

        <div className="setu-document-summary">
          <DocumentMetric label="Verified" value={stats.verifiedDocuments} />
          <DocumentMetric label="Under review" value={stats.pendingDocuments} />
          <DocumentMetric label="Needs attention" value={stats.attentionDocuments} />
        </div>

        {documents.length > 0 && (
          <div className="setu-document-list">
            {documents.slice(0, 4).map((doc) => (
              <Link href="/vault" key={doc.id} className="setu-document-row">
                <span>
                  <strong>{doc.doc_type.replaceAll("_", " ")}</strong>
                  <small>{doc.original_filename}</small>
                </span>
                <span
                  className={`setu-status ${DOC_STATUS_CLASSES[doc.status]}`}
                >
                  {doc.status.replaceAll("_", " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function Applications({ journeys }: { journeys: JourneySummaryView[] }) {
  return (
    <section className="setu-section">
      <div className="setu-section-heading">
        <div>
          <p className="setu-eyebrow">MY APPLICATIONS</p>
          <h2>Service journeys</h2>
        </div>
        <Link href="/services" className="setu-button setu-button-primary">
          Start a service
        </Link>
      </div>

      {journeys.length === 0 ? (
        <EmptyState
          title="No applications yet"
          detail="Choose a life event to start your first SETU journey."
          action={
            <Link href="/services" className="setu-button setu-button-secondary">
              Discover services
            </Link>
          }
        />
      ) : (
        <div className="setu-application-list">
          {journeys.map((journey) => (
            <Link
              href={`/journeys/${journey.application_id}`}
              className="setu-application-card"
              key={journey.application_id}
            >
              <div>
                <p className="setu-eyebrow">APPLICATION</p>
                <h3>{journey.life_event_title_en}</h3>
                <small>
                  {journey.application_id} ·{" "}
                  {new Date(journey.created_at).toLocaleDateString()}
                </small>
              </div>
              <span
                className={`setu-status ${
                  journey.is_complete
                    ? "setu-status-success"
                    : "setu-status-progress"
                }`}
              >
                {journey.is_complete ? "Complete" : "In progress"}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Documents({ documents }: { documents: DocumentView[] }) {
  return (
    <section className="setu-section">
      <div className="setu-section-heading">
        <div>
          <p className="setu-eyebrow">DOCUMENT VAULT</p>
          <h2>Your documents</h2>
        </div>
        <Link href="/vault" className="setu-button setu-button-primary">
          Open vault
        </Link>
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title="No documents stored"
          detail="Upload a document once and reuse it across eligible service journeys."
          action={
            <Link href="/vault" className="setu-button setu-button-secondary">
              Upload document
            </Link>
          }
        />
      ) : (
        <div className="setu-document-list setu-document-list-large">
          {documents.map((doc) => (
            <Link href="/vault" key={doc.id} className="setu-document-row">
              <span>
                <strong>{doc.doc_type.replaceAll("_", " ")}</strong>
                <small>
                  {doc.original_filename} ·{" "}
                  {(doc.size_bytes / 1024).toFixed(0)} KB
                </small>
              </span>
              <span
                className={`setu-status ${DOC_STATUS_CLASSES[doc.status]}`}
              >
                {doc.status.replaceAll("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function StatCard({
  label,
  value,
  detail,
  accent,
  onClick,
}: {
  label: string;
  value: number;
  detail: string;
  accent: "blue" | "green" | "orange" | "red";
  onClick: () => void;
}) {
  return (
    <button className={`setu-stat-card accent-${accent}`} onClick={onClick}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </button>
  );
}

function DocumentMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="setu-document-metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="setu-field">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function EmptyState({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="setu-empty-state">
      <span className="setu-empty-mark">—</span>
      <strong>{title}</strong>
      <p>{detail}</p>
      {action}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="setu-skeleton-grid" aria-label="Loading">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="setu-skeleton-card" />
      ))}
    </div>
  );
}
