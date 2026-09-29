"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ApiError, DocumentView, citizenApi } from "@/lib/api";
import { DOC_STATUS_CLASSES, DOC_STATUS_LABEL_KEY } from "@/lib/statusStyles";
import { useAuth } from "@/lib/useAuth";
import { useLanguage } from "@/lib/LanguageProvider";

type FilterTab = "all" | "verified" | "under_review" | "uploaded" | "rejected";
type ActionName = "upload" | "review" | "verify" | "reject" | "digilocker" | null;

const COMMON_DOC_TYPES = [
  { value: "identity_verification", label: "Identity Verification (Aadhaar / Voter ID)" },
  { value: "domicile_certificate", label: "Domicile Certificate (Maharashtra Residence)" },
  { value: "income_certificate", label: "Income Certificate (Revenue Authority)" },
  { value: "caste_certificate", label: "Caste Certificate (Social Justice)" },
  { value: "student_certificate", label: "Student Certificate / Bonafide" },
  { value: "business_registration", label: "Shop & Establishment (Labour Reg.)" },
  { value: "supplementary_document", label: "Supplementary Supporting Document" },
];

export default function VaultPage() {
  const { t } = useLanguage();
  const { citizenId, token, isLoggedIn } = useAuth();

  const [documents, setDocuments] = useState<DocumentView[] | null>(null);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // DigiLocker Connection State
  const [digiLockerConnected, setDigiLockerConnected] = useState(false);
  const [digiLockerImporting, setDigiLockerImporting] = useState(false);

  // Upload Form State
  const [docType, setDocType] = useState("income_certificate");
  const [issuer, setIssuer] = useState("");
  const [pendingAction, setPendingAction] = useState<ActionName>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!citizenId) return;
    try {
      setError(null);
      const docs = await citizenApi.getDocuments(citizenId, token ?? undefined);
      setDocuments(docs);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    }
  }, [citizenId, token, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    // Check if DigiLocker connected state is in localStorage
    try {
      const stored = localStorage.getItem("setu-digilocker-connected");
      if (stored === "true") setDigiLockerConnected(true);
    } catch {}
  }, [load]);

  const stats = useMemo(() => {
    const list = documents ?? [];
    return {
      total: list.length,
      verified: list.filter((d) => d.status === "verified").length,
      underReview: list.filter((d) => d.status === "under_review").length,
      uploaded: list.filter((d) => d.status === "uploaded").length,
      rejected: list.filter((d) => d.status === "rejected" || d.status === "expired").length,
    };
  }, [documents]);

  const filteredDocs = useMemo(() => {
    if (!documents) return [];
    if (filter === "all") return documents;
    return documents.filter((d) => d.status === filter);
  }, [documents, filter]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file || !citizenId) {
      setError("Please select a valid document file to upload.");
      return;
    }

    setPendingAction("upload");
    setError(null);
    setSuccessMessage(null);
    try {
      await citizenApi.uploadDocument(citizenId, file, docType, issuer || undefined, token ?? undefined);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIssuer("");
      setSuccessMessage(`Document "${file.name}" uploaded successfully. Status: Uploaded (Awaiting Review).`);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    } finally {
      setPendingAction(null);
    }
  };

  const handleDigiLockerConnect = () => {
    setDigiLockerConnected(true);
    try {
      localStorage.setItem("setu-digilocker-connected", "true");
    } catch {}
    setSuccessMessage("DigiLocker linked successfully. 3 verifiable digital credentials discovered.");
  };

  const handleDigiLockerDisconnect = () => {
    setDigiLockerConnected(false);
    try {
      localStorage.removeItem("setu-digilocker-connected");
    } catch {}
    setSuccessMessage("DigiLocker disconnected.");
  };

  const handleDigiLockerImport = async () => {
    if (!citizenId) return;
    setDigiLockerImporting(true);
    setError(null);
    try {
      // Simulate verified DigiLocker credentials import via a dummy file
      const dummyBlob = new Blob(["Verified DigiLocker Certificate"], { type: "application/pdf" });
      const dummyFile = new File([dummyBlob], "DigiLocker_Verified_Identity.pdf", { type: "application/pdf" });
      const uploaded = await citizenApi.uploadDocument(citizenId, dummyFile, "identity_verification", "DigiLocker UIDAI", token ?? undefined);
      // Auto verify it through the backend verification path
      await citizenApi.submitDocumentForReview(citizenId, uploaded.id, token ?? undefined);
      await citizenApi.verifyDocument(citizenId, uploaded.id, token ?? undefined);
      setSuccessMessage("Imported verified Identity Proof from DigiLocker into EKAM Document Vault!");
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "DigiLocker import failed");
    } finally {
      setDigiLockerImporting(false);
    }
  };

  const runDocAction = async (documentId: string, action: ActionName, fn: () => Promise<DocumentView>) => {
    setPendingAction(action);
    setPendingId(documentId);
    setError(null);
    setSuccessMessage(null);
    try {
      await fn();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("error_generic"));
    } finally {
      setPendingAction(null);
      setPendingId(null);
    }
  };

  if (!isLoggedIn || !citizenId) {
    return (
      <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "48px 0" }}>
        <div className="setu-panel" style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center", padding: "40px 24px" }}>
          <div style={{ marginBottom: "16px" }}>
            <Image
              src="/ekam-official-logo.png"
              alt="एकम — सर्व सरकारी सेवाएँ • सर्व सरकारी प्रमाणपत्र एकाच ठिकाणी"
              width={180}
              height={180}
              priority
              style={{ margin: "0 auto", height: "auto", maxWidth: "180px" }}
            />
          </div>
          <span className="setu-ink-kicker">SECURE CITIZEN REPOSITORY</span>
          <h1 style={{ fontSize: "1.8rem", color: "var(--setu-navy)", margin: "8px 0 12px" }}>
            Sign in to access your Document Vault
          </h1>
          <p className="setu-muted" style={{ margin: "0 0 24px", lineHeight: "1.6" }}>
            The EKAM Document Vault securely stores verified certificates and documents for reuse across all Maharashtra government services.
          </p>
          <Link href="/login?redirect=/vault" className="setu-btn setu-btn-primary">
            Sign In with Citizen ID
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="setu-page-shell" style={{ width: "min(var(--setu-max), calc(100% - 32px))", margin: "0 auto", padding: "36px 0 60px" }}>
      {/* Breadcrumb */}
      <nav className="setu-breadcrumb" aria-label="Breadcrumb" style={{ fontSize: "0.8rem", color: "var(--setu-muted)", marginBottom: "12px" }}>
        <Link href="/" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>{t("home")}</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <Link href="/profile" style={{ color: "var(--setu-blue)", textDecoration: "none" }}>{t("mySetu")}</Link>
        <span style={{ margin: "0 6px" }}>/</span>
        <strong>{t("documents")}</strong>
      </nav>

      {/* Header */}
      <header style={{ marginBottom: "24px" }}>
        <span className="setu-ink-kicker">DIGITAL REPOSITORY · REUSE ACROSS SERVICES</span>
        <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", color: "var(--setu-navy)", margin: "4px 0 8px" }}>
          {t("vault_hero_title")}
        </h1>
        <p className="setu-muted" style={{ maxWidth: "760px", margin: 0, fontSize: "0.95rem", lineHeight: "1.6" }}>
          {t("vault_hero_desc")}
        </p>
      </header>

      {error && (
        <div className="setu-alert setu-alert-error" role="alert" style={{ marginBottom: "16px" }}>
          {error}
        </div>
      )}

      {successMessage && (
        <div className="setu-status setu-status-verified" role="status" style={{ width: "100%", padding: "12px 16px", borderRadius: "var(--setu-radius)", marginBottom: "16px", fontSize: "0.85rem" }}>
          ✓ {successMessage}
        </div>
      )}

      {/* DigiLocker Integration Experience Card */}
      <section className="setu-panel" id="digilocker" style={{ marginBottom: "24px", borderLeft: "4px solid #163e63" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{ fontWeight: 800, color: "var(--setu-blue)", letterSpacing: "0.06em", fontSize: "0.75rem" }}>
                NATIONAL DIGITAL INFRASTRUCTURE
              </span>
              <span className={`setu-status ${digiLockerConnected ? "setu-status-verified" : "setu-status-pending"}`}>
                {digiLockerConnected ? "DigiLocker Connected" : "Not Linked"}
              </span>
            </div>
            <h3 style={{ margin: "2px 0 6px", fontSize: "1.2rem", color: "var(--setu-navy)" }}>
              {t("vault_digilocker_title")}
            </h3>
            <p className="setu-muted" style={{ margin: 0, fontSize: "0.84rem", maxWidth: "600px" }}>
              {digiLockerConnected
                ? "Your DigiLocker account is linked. 3 official credentials detected (Identity Proof, Education Bonafide, Residence Evidence)."
                : t("vault_digilocker_desc")}
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {digiLockerConnected ? (
              <>
                <button
                  type="button"
                  onClick={handleDigiLockerImport}
                  disabled={digiLockerImporting}
                  className="setu-btn setu-btn-primary"
                  style={{ fontSize: "0.82rem" }}
                >
                  {digiLockerImporting ? t("loading") : t("vault_import_digilocker")}
                </button>
                <button
                  type="button"
                  onClick={handleDigiLockerDisconnect}
                  className="setu-btn setu-btn-secondary"
                  style={{ fontSize: "0.82rem" }}
                >
                  {t("vault_disconnect_digilocker")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleDigiLockerConnect}
                className="setu-btn setu-btn-primary"
                style={{ fontSize: "0.82rem" }}
              >
                {t("vault_connect_digilocker")}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Vault Statistics Strip */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        <div className="setu-panel" style={{ padding: "16px" }}>
          <span className="setu-muted" style={{ fontSize: "0.76rem" }}>TOTAL DOCUMENTS</span>
          <strong style={{ display: "block", fontSize: "1.7rem", color: "var(--setu-navy)", marginTop: "4px" }}>
            {stats.total}
          </strong>
        </div>
        <div className="setu-panel" style={{ padding: "16px", borderLeft: "3px solid var(--setu-green)" }}>
          <span className="setu-muted" style={{ fontSize: "0.76rem" }}>VERIFIED (REUSABLE)</span>
          <strong style={{ display: "block", fontSize: "1.7rem", color: "var(--setu-green)", marginTop: "4px" }}>
            {stats.verified}
          </strong>
        </div>
        <div className="setu-panel" style={{ padding: "16px", borderLeft: "3px solid var(--setu-blue)" }}>
          <span className="setu-muted" style={{ fontSize: "0.76rem" }}>UNDER REVIEW</span>
          <strong style={{ display: "block", fontSize: "1.7rem", color: "var(--setu-blue)", marginTop: "4px" }}>
            {stats.underReview}
          </strong>
        </div>
        <div className="setu-panel" style={{ padding: "16px", borderLeft: "3px solid var(--setu-saffron)" }}>
          <span className="setu-muted" style={{ fontSize: "0.76rem" }}>ACTION REQUIRED</span>
          <strong style={{ display: "block", fontSize: "1.7rem", color: "var(--setu-saffron)", marginTop: "4px" }}>
            {stats.rejected + stats.uploaded}
          </strong>
        </div>
      </section>

      {/* Upload Document Panel */}
      <section className="setu-panel" style={{ marginBottom: "24px" }} aria-labelledby="upload-heading">
        <span className="setu-ink-kicker">ADD DOCUMENT</span>
        <h2 id="upload-heading" style={{ margin: "4px 0 14px", fontSize: "1.15rem", color: "var(--setu-navy)" }}>
          {t("vault_upload_title")}
        </h2>

        <form onSubmit={handleUpload}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginBottom: "16px" }}>
            <label className="setu-field">
              <span>{t("vault_doc_type")}:</span>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                style={{ width: "100%", minHeight: "44px", border: "1px solid #ccd6df", padding: "8px 12px", background: "#fff" }}
              >
                {COMMON_DOC_TYPES.map((d) => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </label>

            <label className="setu-field">
              <span>{t("vault_issuing_authority")}:</span>
              <input
                type="text"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="e.g. Tahsildar Pune / UIDAI / DTE Maharashtra"
                style={{ width: "100%", minHeight: "44px", border: "1px solid #ccd6df", padding: "8px 12px" }}
              />
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              required
              aria-label="Select document file"
              style={{ fontSize: "0.85rem" }}
            />
            <button
              type="submit"
              disabled={pendingAction === "upload"}
              className="setu-btn setu-btn-primary"
              style={{ minHeight: "44px" }}
            >
              {pendingAction === "upload" ? t("loading") : t("vault_upload_btn")}
            </button>
            <span style={{ fontSize: "0.75rem", color: "var(--setu-muted)" }}>
              Accepted formats: PDF, JPG, PNG (Max 5MB)
            </span>
          </div>
        </form>
      </section>

      {/* Filter Tabs & Document List */}
      <section aria-labelledby="vault-list-heading">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
          <div>
            <span className="setu-ink-kicker">STORED VAULT ASSETS</span>
            <h2 id="vault-list-heading" style={{ margin: "2px 0", fontSize: "1.25rem", color: "var(--setu-navy)" }}>
              Your Stored Documents ({filteredDocs.length})
            </h2>
          </div>

          {/* Filter Chips */}
          <div className="setu-filter-chips" role="tablist" style={{ margin: 0 }}>
            {(["all", "verified", "under_review", "uploaded", "rejected"] as FilterTab[]).map((tabKey) => {
              const labelMap: Record<FilterTab, string> = {
                all: t("vault_filter_all"),
                verified: t("vault_filter_verified"),
                under_review: t("vault_filter_review"),
                uploaded: t("vault_filter_uploaded"),
                rejected: t("vault_filter_rejected"),
              };
              return (
                <button
                  key={tabKey}
                  role="tab"
                  aria-selected={filter === tabKey}
                  className={filter === tabKey ? "is-active" : ""}
                  onClick={() => setFilter(tabKey)}
                >
                  {labelMap[tabKey]}
                </button>
              );
            })}
          </div>
        </div>

        {!documents ? (
          <div className="setu-panel" style={{ padding: "40px", textAlign: "center" }}>
            {t("loading")}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="setu-panel" style={{ padding: "40px", textAlign: "center" }}>
            <p className="setu-muted" style={{ margin: "0 0 12px" }}>
              {filter === "all"
                ? "No documents stored in your vault yet. Upload a document or connect DigiLocker to begin."
                : `No documents found with status "${filter.replaceAll("_", " ")}".`}
            </p>
            {filter !== "all" && (
              <button type="button" onClick={() => setFilter("all")} className="setu-btn setu-btn-secondary" style={{ fontSize: "0.8rem" }}>
                View All Documents
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "12px" }}>
            {filteredDocs.map((doc) => {
              const busy = pendingId === doc.id;
              const formattedType = doc.doc_type.replaceAll("_", " ");

              return (
                <article
                  key={doc.id}
                  className="setu-panel"
                  style={{
                    padding: "18px 20px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <strong style={{ fontSize: "1.05rem", color: "var(--setu-navy)", textTransform: "capitalize" }}>
                          {formattedType}
                        </strong>
                        <span className={`setu-status ${DOC_STATUS_CLASSES[doc.status]}`}>
                          {t(DOC_STATUS_LABEL_KEY[doc.status])}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "var(--setu-muted)" }}>
                        File: <strong>{doc.original_filename}</strong> · {(doc.size_bytes / 1024).toFixed(0)} KB · Uploaded {new Date(doc.created_at).toLocaleDateString()}
                        {doc.issuer && ` · Issuer: ${doc.issuer}`}
                      </p>
                    </div>

                    {/* View File Link */}
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="setu-btn setu-btn-secondary"
                        style={{ fontSize: "0.75rem", minHeight: "34px", padding: "0 10px" }}
                      >
                        View File ↗
                      </a>
                    )}
                  </div>

                  {/* Rejection notice */}
                  {doc.rejection_reason && (
                    <div style={{ padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "var(--setu-radius)", fontSize: "0.8rem", color: "#991b1b" }}>
                      <strong>Rejection Reason:</strong> {doc.rejection_reason}
                    </div>
                  )}

                  {/* Cross-Service Reuse Indication */}
                  {doc.used_by && doc.used_by.length > 0 ? (
                    <div style={{ padding: "10px 12px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "var(--setu-radius)", fontSize: "0.8rem", color: "#166534" }}>
                      <strong>✓ Actively Reused in Applications:</strong>{" "}
                      {doc.used_by.map((u) => u.life_event_title_en).join(", ")}
                    </div>
                  ) : (
                    <div style={{ fontSize: "0.76rem", color: "var(--setu-muted)" }}>
                      Available for reuse in connected service journeys.
                    </div>
                  )}

                  {/* Operational Lifecycle Actions */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "8px", borderTop: "1px solid #f1f5f9" }}>
                    {doc.status === "uploaded" && (
                      <button
                        type="button"
                        onClick={() =>
                          runDocAction(doc.id, "review", () =>
                            citizenApi.submitDocumentForReview(citizenId, doc.id, token ?? undefined)
                          )
                        }
                        disabled={busy && pendingAction === "review"}
                        className="setu-btn setu-btn-primary"
                        style={{ fontSize: "0.76rem", minHeight: "36px" }}
                      >
                        {busy && pendingAction === "review" ? "Submitting…" : "Submit for Department Review"}
                      </button>
                    )}

                    {doc.status === "under_review" && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            runDocAction(doc.id, "verify", () =>
                              citizenApi.verifyDocument(citizenId, doc.id, token ?? undefined)
                            )
                          }
                          disabled={busy && pendingAction === "verify"}
                          className="setu-btn setu-btn-primary"
                          style={{ fontSize: "0.76rem", minHeight: "36px", background: "var(--setu-green)", borderColor: "var(--setu-green)" }}
                        >
                          {busy && pendingAction === "verify" ? "Verifying…" : "Simulate Officer Verification"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            runDocAction(doc.id, "reject", () =>
                              citizenApi.rejectDocument(
                                citizenId,
                                doc.id,
                                "Illegible scan or expired issuer stamp — please re-upload clear copy",
                                token ?? undefined
                              )
                            )
                          }
                          disabled={busy && pendingAction === "reject"}
                          className="setu-btn setu-btn-danger"
                          style={{ fontSize: "0.76rem", minHeight: "36px" }}
                        >
                          {busy && pendingAction === "reject" ? "Rejecting…" : "Reject Document"}
                        </button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Privacy Notice Banner */}
      <footer style={{ marginTop: "32px", padding: "16px", background: "#f8fafc", border: "1px solid var(--setu-line)", borderRadius: "var(--setu-radius)", fontSize: "0.78rem", color: "var(--setu-muted)", lineHeight: "1.5" }}>
        <strong>Data Protection & Privacy Notice:</strong> Documents deposited in your EKAM Document Vault are secured under state data confidentiality protocols. Credentials are never transmitted to external departments without your explicit per-service consent.
      </footer>
    </div>
  );
}
