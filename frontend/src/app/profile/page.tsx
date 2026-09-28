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
} from "@/lib/statusStyles";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";
import { SCHEME_CATALOG } from "@/lib/schemeCatalog";

type Tab = "overview" | "applications" | "documents" | "profile" | "schemes";

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
    preferred_language: "en",
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
        preferred_language: p.preferred_language ?? "en",
      });
    }

    if (journeyResult.status === "fulfilled") {
      setJourneys(journeyResult.value);
    }

    if (documentResult.status === "fulfilled") {
      setDocuments(documentResult.value);
    }

    const failed = results.find(
      (result) =>
        result.status === "rejected" &&
        !(result.reason instanceof ApiError && result.reason.status === 404),
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
          detail: "Active application in progress. Next action awaiting your review.",
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
              ? "Document has expired and may need to be updated."
              : `Document rejected: ${doc.rejection_reason || "Please re-upload a clear copy."}`,
          href: "/vault",
        });
      } else if (doc.status === "uploaded") {
        items.push({
          title: doc.doc_type.replaceAll("_", " "),
          detail: "Document uploaded but not yet submitted for review.",
          href: "/vault",
        });
      }
    });

    return items;
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
      <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "48px 0" }}>
        <section className="setu-panel" style={{ maxWidth: "580px", margin: "40px auto", textAlign: "center", padding: "40px 24px" }}>
          <span className="setu-ink-kicker">CITIZEN ACTION CENTER</span>
          <h1 style={{ fontSize: "1.8rem", color: "var(--setu-navy)", margin: "8px 0 12px" }}>
            Sign in to access My SETU
          </h1>
          <p className="setu-muted" style={{ margin: "0 0 24px", lineHeight: "1.6" }}>
            View what needs your attention, track active service journeys, manage reusable documents, and keep your citizen profile current.
          </p>
          <Link href="/login?redirect=/profile" className="setu-btn setu-btn-primary">
            Sign In with Citizen ID
          </Link>
        </section>
      </div>
    );
  }

  const completeness = profile?.profile_completeness_pct ?? 75;

  return (
    <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "36px 0 60px" }}>
      {/* Header */}
      <header className="setu-dashboard-header" style={{ marginBottom: "24px" }}>
        <div>
          <span className="setu-ink-kicker">MAHARASHTRA CITIZEN ACTION CENTER</span>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "var(--setu-navy)", margin: "4px 0 6px" }}>
            {t("qa_dashboard_title")}
          </h1>
          <p className="setu-muted" style={{ margin: 0, fontSize: "0.95rem" }}>
            {t("profile_subheading")}
          </p>
        </div>

        <div className="setu-citizen-chip" style={{ background: "#fff", border: "1px solid var(--setu-line)", padding: "10px 16px", borderRadius: "var(--setu-radius)", display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "50%",
              background: "var(--setu-navy)",
              color: "#fff",
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              fontSize: "1.1rem",
              border: "2px solid #e4a23b",
            }}
          >
            {(profile?.full_name || citizenId).charAt(0).toUpperCase()}
          </div>
          <div>
            <strong style={{ display: "block", color: "var(--setu-navy)", fontSize: "0.95rem" }}>
              {profile?.full_name || "Citizen"}
            </strong>
            <small style={{ color: "var(--setu-muted)", fontSize: "0.75rem" }}>
              ID: {citizenId} {profile?.district && `· ${profile.district}`}
            </small>
          </div>
        </div>
      </header>

      {error && (
        <div className="setu-alert setu-alert-error" role="alert" style={{ marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="setu-filter-chips" role="tablist" aria-label="My SETU sections" style={{ marginBottom: "24px" }}>
        {[
          ["overview", t("profile_tab_overview")],
          ["applications", `${t("profile_tab_applications")} (${journeys?.length ?? 0})`],
          ["documents", `${t("profile_tab_documents")} (${documents?.length ?? 0})`],
          ["schemes", t("profile_tab_schemes")],
          ["profile", t("profile_tab_info")],
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
        <div className="setu-panel" style={{ padding: "40px", textAlign: "center" }}>
          {t("loading")}
        </div>
      ) : (
        <>
          {tab === "overview" && (
            <Overview
              completeness={completeness}
              stats={stats}
              attentionItems={attentionItems}
              journeys={journeys ?? []}
              documents={documents ?? []}
              onApplications={() => setTab("applications")}
              onDocuments={() => setTab("documents")}
              onCompleteProfile={() => setTab("profile")}
            />
          )}

          {tab === "applications" && (
            <Applications journeys={journeys ?? []} />
          )}

          {tab === "documents" && (
            <Documents documents={documents ?? []} />
          )}

          {tab === "schemes" && (
            <SchemesPreview />
          )}

          {tab === "profile" && (
            <section className="setu-panel" aria-labelledby="profile-heading">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div>
                  <span className="setu-ink-kicker">PERSONAL CREDENTIALS</span>
                  <h2 id="profile-heading" style={{ margin: "4px 0", fontSize: "1.25rem", color: "var(--setu-navy)" }}>
                    Citizen Profile Information
                  </h2>
                  <p className="setu-muted" style={{ margin: 0, fontSize: "0.82rem" }}>
                    Information entered here is reused across eligible services without re-entry.
                  </p>
                </div>
                <span className="setu-status setu-status-verified">
                  {completeness}% Complete
                </span>
              </div>

              <div className="setu-form-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
                <label className="setu-field">
                  <span>Full Legal Name:</span>
                  <input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="As appearing on official identity records"
                  />
                </label>
                <label className="setu-field">
                  <span>Registered Mobile / Phone:</span>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                  />
                </label>
                <label className="setu-field">
                  <span>District (Maharashtra):</span>
                  <input
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                    placeholder="e.g. Pune, Nashik, Nagpur"
                  />
                </label>
                <label className="setu-field">
                  <span>Taluka / Sub-Division:</span>
                  <input
                    value={form.taluka}
                    onChange={(e) => setForm({ ...form, taluka: e.target.value })}
                    placeholder="e.g. Haveli, Baramati"
                  />
                </label>
              </div>

              <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "14px" }}>
                {saved && (
                  <span style={{ color: "var(--setu-green)", fontSize: "0.85rem", fontWeight: 700 }}>
                    ✓ Profile saved successfully
                  </span>
                )}
                <button
                  type="button"
                  className="setu-btn setu-btn-primary"
                  onClick={saveProfile}
                  disabled={saving}
                >
                  {saving ? t("loading") : t("profile_save_btn")}
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

function Overview({
  completeness,
  stats,
  attentionItems,
  journeys,
  documents,
  onApplications,
  onDocuments,
  onCompleteProfile,
}: {
  completeness: number;
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
  onCompleteProfile: () => void;
}) {
  return (
    <div style={{ display: "grid", gap: "24px" }}>
      {/* 1. PRIMARY SECTION: WHAT NEEDS YOUR ATTENTION? */}
      <section className="setu-panel" style={{ borderLeft: "4px solid var(--setu-saffron)" }} aria-labelledby="attention-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span className="setu-ink-kicker">HIGH PRIORITY</span>
            <h2 id="attention-heading" style={{ margin: "2px 0", fontSize: "1.3rem", color: "var(--setu-navy)" }}>
              What Needs Your Attention?
            </h2>
          </div>
          <span className="setu-status setu-status-action">
            {attentionItems.length} Pending Actions
          </span>
        </div>

        {attentionItems.length === 0 ? (
          <div style={{ padding: "20px", background: "#f0fdf4", borderRadius: "var(--setu-radius)", color: "#166534", fontSize: "0.88rem" }}>
            ✓ <strong>All caught up!</strong> No active blockers, pending document actions, or SLA warnings for your profile.
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {attentionItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.href}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  background: "#fff9f0",
                  border: "1px solid #f9d8a6",
                  borderRadius: "var(--setu-radius)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#fef3c7", color: "#b45309", display: "grid", placeItems: "center", fontWeight: 900 }}>
                    !
                  </span>
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "var(--setu-navy)" }}>{item.title}</strong>
                    <p style={{ margin: "2px 0 0", fontSize: "0.78rem", color: "var(--setu-muted)" }}>
                      {item.detail}
                    </p>
                  </div>
                </div>
                <span style={{ color: "var(--setu-blue)", fontWeight: 800, fontSize: "0.85rem" }}>
                  Action Required →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 2. PROFILE COMPLETENESS BREAKDOWN CARD */}
      <section className="setu-panel" aria-labelledby="completeness-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span className="setu-ink-kicker">PROFILE READINESS</span>
            <h2 id="completeness-heading" style={{ margin: "2px 0", fontSize: "1.2rem", color: "var(--setu-navy)" }}>
              Profile Completion: {completeness}%
            </h2>
          </div>
          <button type="button" onClick={onCompleteProfile} className="setu-btn setu-btn-secondary" style={{ fontSize: "0.78rem" }}>
            Complete Profile Details
          </button>
        </div>

        <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "999px", overflow: "hidden", marginBottom: "16px" }}>
          <div style={{ width: `${completeness}%`, height: "100%", background: "var(--setu-blue)", transition: "width 300ms ease" }} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px" }}>
          <div style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--setu-green)", fontWeight: 800, marginRight: "6px" }}>✓</span>
            <strong>Personal Details:</strong> Verified
          </div>
          <div style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--setu-green)", fontWeight: 800, marginRight: "6px" }}>✓</span>
            <strong>Address & Location:</strong> Maharashtra Resident
          </div>
          <div style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)", fontSize: "0.8rem" }}>
            <span style={{ color: stats.verifiedDocuments > 0 ? "var(--setu-green)" : "var(--setu-saffron)", fontWeight: 800, marginRight: "6px" }}>
              {stats.verifiedDocuments > 0 ? "✓" : "○"}
            </span>
            <strong>Document Vault:</strong> {stats.verifiedDocuments} Verified Document(s)
          </div>
          <div style={{ padding: "10px 12px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)", fontSize: "0.8rem" }}>
            <span style={{ color: "var(--setu-green)", fontWeight: 800, marginRight: "6px" }}>✓</span>
            <strong>Consent Preferences:</strong> Explicit Permission Active
          </div>
        </div>
      </section>

      {/* 3. KEY CITIZEN METRICS */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "14px" }}>
        <button type="button" onClick={onApplications} className="setu-panel" style={{ textAlign: "left", cursor: "pointer", borderTop: "3px solid var(--setu-blue)" }}>
          <span className="setu-muted" style={{ fontSize: "0.76rem" }}>ACTIVE JOURNEYS</span>
          <strong style={{ display: "block", fontSize: "1.8rem", color: "var(--setu-navy)", marginTop: "4px" }}>
            {stats.activeApplications}
          </strong>
          <small className="setu-muted">In progress with departments</small>
        </button>

        <button type="button" onClick={onApplications} className="setu-panel" style={{ textAlign: "left", cursor: "pointer", borderTop: "3px solid var(--setu-green)" }}>
          <span className="setu-muted" style={{ fontSize: "0.76rem" }}>COMPLETED SERVICES</span>
          <strong style={{ display: "block", fontSize: "1.8rem", color: "var(--setu-green)", marginTop: "4px" }}>
            {stats.completedApplications}
          </strong>
          <small className="setu-muted">Delivered & deposited in vault</small>
        </button>

        <button type="button" onClick={onDocuments} className="setu-panel" style={{ textAlign: "left", cursor: "pointer", borderTop: "3px solid var(--setu-saffron)" }}>
          <span className="setu-muted" style={{ fontSize: "0.76rem" }}>STORED DOCUMENTS</span>
          <strong style={{ display: "block", fontSize: "1.8rem", color: "var(--setu-navy)", marginTop: "4px" }}>
            {stats.totalDocuments}
          </strong>
          <small className="setu-muted">{stats.verifiedDocuments} verified for reuse</small>
        </button>
      </section>

      {/* 4. ACTIVE JOURNEYS & RECENT APPLICATIONS */}
      <section className="setu-panel" aria-labelledby="recent-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span className="setu-ink-kicker">WORKFLOW TRACKER</span>
            <h2 id="recent-heading" style={{ margin: "2px 0", fontSize: "1.2rem", color: "var(--setu-navy)" }}>
              Active Journeys & Recent Applications
            </h2>
          </div>
          <Link href="/services" className="setu-btn setu-btn-primary" style={{ fontSize: "0.78rem" }}>
            Start New Service
          </Link>
        </div>

        {journeys.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 16px", background: "#f8fafc", borderRadius: "var(--setu-radius)" }}>
            <p className="setu-muted" style={{ margin: "0 0 12px" }}>
              No active applications yet. Start a goal journey to begin.
            </p>
            <Link href="/services" className="setu-btn setu-btn-secondary" style={{ fontSize: "0.8rem" }}>
              Discover Services
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {journeys.slice(0, 5).map((journey) => (
              <Link
                key={journey.application_id}
                href={`/journeys/${journey.application_id}`}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 18px",
                  background: "#ffffff",
                  border: "1px solid var(--setu-line)",
                  borderRadius: "var(--setu-radius)",
                  textDecoration: "none",
                  color: "inherit",
                }}
              >
                <div>
                  <strong style={{ fontSize: "0.95rem", color: "var(--setu-navy)", display: "block" }}>
                    {journey.life_event_title_en}
                  </strong>
                  <small style={{ color: "var(--setu-muted)", fontSize: "0.74rem" }}>
                    Application ID: {journey.application_id} · Started {new Date(journey.created_at).toLocaleDateString()}
                  </small>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span className={`setu-status ${journey.is_complete ? "setu-status-verified" : "setu-status-progress"}`}>
                    {journey.is_complete ? "Completed" : "In Progress"}
                  </span>
                  <span style={{ color: "var(--setu-blue)", fontWeight: 800 }}>→</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* 5. DOCUMENT VAULT PREVIEW */}
      <section className="setu-panel" aria-labelledby="vault-preview-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span className="setu-ink-kicker">REUSABLE ASSETS</span>
            <h2 id="vault-preview-heading" style={{ margin: "2px 0", fontSize: "1.2rem", color: "var(--setu-navy)" }}>
              Document Vault Summary
            </h2>
          </div>
          <Link href="/vault" className="setu-btn setu-btn-secondary" style={{ fontSize: "0.78rem" }}>
            Manage All Documents ({stats.totalDocuments}) →
          </Link>
        </div>

        {documents.length === 0 ? (
          <p className="setu-muted" style={{ margin: 0, fontSize: "0.85rem" }}>
            No documents stored yet. Upload a document to reuse it across multiple services.
          </p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "10px" }}>
            {documents.slice(0, 4).map((doc) => (
              <div
                key={doc.id}
                style={{
                  padding: "12px 14px",
                  background: "#f8fafc",
                  border: "1px solid var(--setu-line)",
                  borderRadius: "var(--setu-radius)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <strong style={{ fontSize: "0.88rem", color: "var(--setu-navy)", display: "block", textTransform: "capitalize" }}>
                    {doc.doc_type.replaceAll("_", " ")}
                  </strong>
                  <small style={{ color: "var(--setu-muted)", fontSize: "0.72rem" }}>
                    {doc.original_filename}
                  </small>
                </div>
                <span className={`setu-status ${DOC_STATUS_CLASSES[doc.status]}`} style={{ fontSize: "0.68rem" }}>
                  {doc.status.replaceAll("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Applications({ journeys }: { journeys: JourneySummaryView[] }) {
  return (
    <section className="setu-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div>
          <span className="setu-ink-kicker">APPLICATION TRACKING</span>
          <h2 style={{ margin: "2px 0", fontSize: "1.25rem", color: "var(--setu-navy)" }}>
            All Active & Past Service Journeys
          </h2>
        </div>
        <Link href="/services" className="setu-btn setu-btn-primary" style={{ fontSize: "0.8rem" }}>
          Start New Service
        </Link>
      </div>

      {journeys.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 16px" }}>
          <p className="setu-muted" style={{ margin: "0 0 16px" }}>
            No service applications have been started yet.
          </p>
          <Link href="/services" className="setu-btn setu-btn-secondary">
            Browse Services
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "12px" }}>
          {journeys.map((journey) => (
            <Link
              key={journey.application_id}
              href={`/journeys/${journey.application_id}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                background: "#ffffff",
                border: "1px solid var(--setu-line)",
                borderRadius: "var(--setu-radius)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div>
                <span className="setu-kicker" style={{ color: "var(--setu-saffron)", fontSize: "0.7rem" }}>
                  CONNECTED JOURNEY
                </span>
                <h3 style={{ margin: "4px 0", fontSize: "1.05rem", color: "var(--setu-navy)" }}>
                  {journey.life_event_title_en}
                </h3>
                <small style={{ color: "var(--setu-muted)", fontSize: "0.75rem" }}>
                  Application ID: <code>{journey.application_id}</code> · Started {new Date(journey.created_at).toLocaleDateString()}
                </small>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span className={`setu-status ${journey.is_complete ? "setu-status-verified" : "setu-status-progress"}`}>
                  {journey.is_complete ? "Complete" : "In Progress"}
                </span>
                <span style={{ color: "var(--setu-blue)", fontWeight: 800 }}>Open →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Documents({ documents }: { documents: DocumentView[] }) {
  return (
    <section className="setu-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div>
          <span className="setu-ink-kicker">DOCUMENT VAULT</span>
          <h2 style={{ margin: "2px 0", fontSize: "1.25rem", color: "var(--setu-navy)" }}>
            Stored Vault Credentials
          </h2>
        </div>
        <Link href="/vault" className="setu-btn setu-btn-primary" style={{ fontSize: "0.8rem" }}>
          Open Full Vault
        </Link>
      </div>

      {documents.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 16px" }}>
          <p className="setu-muted" style={{ margin: "0 0 16px" }}>
            No documents in your vault yet.
          </p>
          <Link href="/vault" className="setu-btn setu-btn-secondary">
            Upload Document
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {documents.map((doc) => (
            <Link
              key={doc.id}
              href="/vault"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                background: "#ffffff",
                border: "1px solid var(--setu-line)",
                borderRadius: "var(--setu-radius)",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div>
                <strong style={{ fontSize: "0.95rem", color: "var(--setu-navy)", textTransform: "capitalize" }}>
                  {doc.doc_type.replaceAll("_", " ")}
                </strong>
                <small style={{ display: "block", color: "var(--setu-muted)", fontSize: "0.74rem", marginTop: "2px" }}>
                  {doc.original_filename} · {(doc.size_bytes / 1024).toFixed(0)} KB
                </small>
              </div>
              <span className={`setu-status ${DOC_STATUS_CLASSES[doc.status]}`}>
                {doc.status.replaceAll("_", " ")}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function SchemesPreview() {
  return (
    <section className="setu-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
        <div>
          <span className="setu-ink-kicker">GOVERNMENT SCHEMES</span>
          <h2 style={{ margin: "2px 0", fontSize: "1.25rem", color: "var(--setu-navy)" }}>
            Recommended Schemes for Maharashtra Citizens
          </h2>
        </div>
        <Link href="/schemes" className="setu-btn setu-btn-secondary" style={{ fontSize: "0.8rem" }}>
          View Scheme Catalog →
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
        {SCHEME_CATALOG.map((scheme) => (
          <div
            key={scheme.id}
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span className="setu-status setu-status-verified" style={{ fontSize: "0.68rem" }}>{scheme.category}</span>
                <span style={{ fontSize: "0.72rem", color: "var(--setu-muted)" }}>{scheme.status}</span>
              </div>
              <h3 style={{ margin: "4px 0", fontSize: "1rem", color: "var(--setu-navy)" }}>{scheme.title}</h3>
              <p style={{ margin: "0 0 10px", fontSize: "0.78rem", color: "var(--setu-muted)", lineHeight: "1.5" }}>
                {scheme.summary}
              </p>
            </div>
            <Link href={`/schemes/${scheme.id}`} className="setu-btn-tertiary" style={{ fontSize: "0.8rem", alignSelf: "flex-start" }}>
              View Eligibility & Benefits →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
